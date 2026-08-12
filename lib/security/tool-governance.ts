import crypto from 'node:crypto';

export type ToolPolicyOutcome = 'ALLOW' | 'DENY' | 'ESCALATE';
export type ToolRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface ToolPolicyHistoryEntry {
  tool: string;
  status: string;
  dataCategories: string[];
}

export interface ToolPolicyInput {
  sessionId: string;
  workspaceId: string;
  agentId: string;
  contactId: string | null;
  specialist: string | null;
  tool: string;
  parameters: Record<string, unknown>;
  identityVerificationState: string | null;
  riskFlags: string[];
  complianceFlags: string[];
  history: ToolPolicyHistoryEntry[];
}

export interface ToolPolicyDecision {
  outcome: ToolPolicyOutcome;
  riskLevel: ToolRiskLevel;
  riskScore: number;
  policyVersion: string;
  triggeredPolicyIds: string[];
  reasonCodes: string[];
  dataCategories: string[];
}

export interface ToolPolicyEvaluator {
  evaluate(input: ToolPolicyInput): Promise<ToolPolicyDecision> | ToolPolicyDecision;
}

export const TOOL_POLICY_VERSION = '2026-08-12.1';

const EXTERNAL_COMMUNICATION_TOOLS = new Set(['schedule_callback', 'create_follow_up']);
const BASE_RISK: Record<string, number> = {
  check_availability: 5,
  record_opt_out: 0,
  request_human_handoff: 15,
  create_or_update_contact: 30,
  book_appointment: 35,
  reschedule_appointment: 50,
  cancel_appointment: 55,
  create_opportunity: 25,
  update_opportunity: 30,
  create_task: 20,
  complete_task: 25,
  schedule_callback: 45,
  create_follow_up: 40,
};

function canonicalize(value: unknown, key = ''): unknown {
  if (Array.isArray(value)) return value.map(item => canonicalize(item));
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([entryKey, entryValue]) => [entryKey, canonicalize(entryValue, entryKey)])
    );
  }
  if (typeof value !== 'string') return value;

  const normalized = value.trim();
  const lowerKey = key.toLowerCase();
  if (lowerKey.includes('email')) return normalized.toLowerCase();
  if (lowerKey.includes('phone')) return normalized.replace(/[^\d+]/g, '');
  if (lowerKey.endsWith('time') || lowerKey.endsWith('at')) {
    const parsed = new Date(normalized);
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
  }
  return normalized;
}

export function fingerprintToolPayload(tool: string, parameters: Record<string, unknown>): string {
  const canonical = JSON.stringify({ tool, parameters: canonicalize(parameters) });
  return crypto.createHash('sha256').update(canonical).digest('hex');
}

export function classifyToolPayload(parameters: Record<string, unknown>): string[] {
  const categories = new Set<string>();
  for (const key of Object.keys(parameters)) {
    const normalized = key.toLowerCase();
    if (normalized.includes('phone')) categories.add('CONTACT_PHONE');
    if (normalized.includes('email')) categories.add('CONTACT_EMAIL');
    if (normalized.includes('name')) categories.add('CONTACT_NAME');
    if (normalized.includes('payment') || normalized.includes('amount')) {
      categories.add('FINANCIAL');
    }
    if (normalized.includes('medical') || normalized.includes('health')) {
      categories.add('HEALTH');
    }
    if (normalized.includes('legal')) categories.add('LEGAL');
  }
  return [...categories].sort();
}

function riskLevel(score: number): ToolRiskLevel {
  if (score >= 85) return 'CRITICAL';
  if (score >= 60) return 'HIGH';
  if (score >= 30) return 'MEDIUM';
  return 'LOW';
}

export const deterministicToolPolicyEvaluator: ToolPolicyEvaluator = {
  evaluate(input) {
    const triggeredPolicyIds: string[] = [];
    const reasonCodes: string[] = [];
    const dataCategories = classifyToolPayload(input.parameters);
    const hasSensitivePayload = dataCategories.length > 0;
    const hasPriorSensitiveAccess = input.history.some(entry =>
      entry.dataCategories.some(category =>
        ['CONTACT_PHONE', 'CONTACT_EMAIL', 'FINANCIAL', 'HEALTH', 'LEGAL'].includes(category)
      )
    );
    const previousBlocks = input.history.filter(entry =>
      ['BLOCKED', 'DENIED'].includes(entry.status)
    ).length;
    let score = BASE_RISK[input.tool] ?? 70;

    if (hasSensitivePayload) {
      score += 15;
      triggeredPolicyIds.push('PAYLOAD_SENSITIVE_FIELDS');
      reasonCodes.push('SENSITIVE_FIELDS_PRESENT');
    }
    const requiresVerifiedIdentity =
      (input.tool === 'create_or_update_contact' &&
        input.contactId !== null &&
        hasSensitivePayload) ||
      ['reschedule_appointment', 'cancel_appointment'].includes(input.tool);
    if (requiresVerifiedIdentity && input.identityVerificationState !== 'VERIFIED') {
      score += 25;
      triggeredPolicyIds.push('IDENTITY_REQUIRED_FOR_SENSITIVE_MUTATION');
      reasonCodes.push('IDENTITY_NOT_VERIFIED');
    }
    if (EXTERNAL_COMMUNICATION_TOOLS.has(input.tool) && hasPriorSensitiveAccess) {
      score += 25;
      triggeredPolicyIds.push('SESSION_SENSITIVE_DATA_EGRESS');
      reasonCodes.push('SESSION_DATA_EGRESS_RISK');
    }
    if (input.riskFlags.length > 0) {
      score += Math.min(20, input.riskFlags.length * 5);
      triggeredPolicyIds.push('SESSION_RISK_FLAGS');
      reasonCodes.push('SESSION_RISK_REVIEW');
    }
    if (input.complianceFlags.length > 0) {
      score += 35;
      triggeredPolicyIds.push('SESSION_COMPLIANCE_FLAGS');
      reasonCodes.push('COMPLIANCE_REVIEW_REQUIRED');
    }
    if (previousBlocks > 0) {
      score += Math.min(15, previousBlocks * 5);
      triggeredPolicyIds.push('REPEATED_BLOCKED_ACTIONS');
      reasonCodes.push('REPEATED_POLICY_FAILURE');
    }

    score = Math.min(100, score);
    const optedOut = input.complianceFlags.some(flag =>
      /OPT.?OUT|SUPPRESS|DO.?NOT.?CALL/i.test(flag)
    );
    if (optedOut && EXTERNAL_COMMUNICATION_TOOLS.has(input.tool)) {
      return {
        outcome: 'DENY',
        riskLevel: 'CRITICAL',
        riskScore: 100,
        policyVersion: TOOL_POLICY_VERSION,
        triggeredPolicyIds: [...triggeredPolicyIds, 'OUTBOUND_SUPPRESSION'],
        reasonCodes: [...reasonCodes, 'CONTACT_SUPPRESSED'],
        dataCategories,
      };
    }

    if (input.tool === 'record_opt_out' || input.tool === 'request_human_handoff') {
      return {
        outcome: 'ALLOW',
        riskLevel: riskLevel(score),
        riskScore: score,
        policyVersion: TOOL_POLICY_VERSION,
        triggeredPolicyIds,
        reasonCodes,
        dataCategories,
      };
    }

    return {
      outcome: score >= 60 ? 'ESCALATE' : 'ALLOW',
      riskLevel: riskLevel(score),
      riskScore: score,
      policyVersion: TOOL_POLICY_VERSION,
      triggeredPolicyIds,
      reasonCodes,
      dataCategories,
    };
  },
};
