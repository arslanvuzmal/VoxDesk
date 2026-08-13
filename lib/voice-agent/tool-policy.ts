import crypto from 'node:crypto';

export type ToolPolicyDecision = 'ALLOW' | 'DENY' | 'ESCALATE';

export interface ToolPolicyResult {
  decision: ToolPolicyDecision;
  riskScore: number;
  policyCodes: string[];
  reason: string;
}

const SENSITIVE_KEY = /payment|card|cvv|bank|routing|password|passcode|secret|token|ssn|social.?security|medical.?record|health.?diagnosis/i;
const CONSEQUENTIAL_TOOLS = new Set([
  'create_or_update_contact',
  'book_appointment',
  'reschedule_appointment',
  'cancel_appointment',
  'create_opportunity',
  'update_opportunity',
  'schedule_callback',
  'record_opt_out',
]);
const EXTERNAL_DESTINATION_KEY = /external|destination|recipient|toEmail|toPhone|webhook|url/i;

function collectKeys(value: unknown, matcher: RegExp, path = ''): string[] {
  if (!value || typeof value !== 'object') return [];
  const entries = Array.isArray(value)
    ? value.map((child, index) => [String(index), child] as const)
    : Object.entries(value);
  const matches: string[] = [];
  for (const [key, child] of entries) {
    const currentPath = path ? `${path}.${key}` : key;
    if (matcher.test(key)) matches.push(currentPath);
    else matches.push(...collectKeys(child, matcher, currentPath));
  }
  return matches;
}

export function evaluateToolPolicy(input: {
  tool: string;
  parameters: Record<string, unknown>;
  priorSuccessfulTools: string[];
}): ToolPolicyResult {
  if (collectKeys(input.parameters, SENSITIVE_KEY).length > 0) {
    return {
      decision: 'ESCALATE',
      riskScore: 90,
      policyCodes: ['SENSITIVE_FIELD_REQUIRES_HUMAN'],
      reason: 'Sensitive fields require human approval before a business action can run.',
    };
  }

  if (
    CONSEQUENTIAL_TOOLS.has(input.tool) &&
    input.priorSuccessfulTools.includes(input.tool) &&
    input.tool !== 'record_opt_out'
  ) {
    return {
      decision: 'DENY',
      riskScore: 55,
      policyCodes: ['DUPLICATE_SESSION_ACTION'],
      reason: 'This action already succeeded in the conversation session.',
    };
  }

  if (
    collectKeys(input.parameters, EXTERNAL_DESTINATION_KEY).length > 0 &&
    ['schedule_callback', 'create_follow_up'].includes(input.tool)
  ) {
    return {
      decision: 'ESCALATE',
      riskScore: 70,
      policyCodes: ['EXTERNAL_COMMUNICATION_REQUIRES_APPROVAL'],
      reason: 'External communication requires human approval before dispatch.',
    };
  }

  return {
    decision: 'ALLOW',
    riskScore: 10,
    policyCodes: ['TOOL_ALLOWLISTED'],
    reason: 'Tool is allowlisted and the request passed payload and session policy checks.',
  };
}

export function policyAuditFingerprint(result: ToolPolicyResult): string {
  return crypto
    .createHash('sha256')
    .update(JSON.stringify([result.decision, result.riskScore, result.policyCodes, result.reason]))
    .digest('hex');
}
