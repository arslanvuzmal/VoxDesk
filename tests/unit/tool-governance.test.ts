import { describe, expect, it } from 'vitest';
import {
  deterministicToolPolicyEvaluator,
  fingerprintToolPayload,
  type ToolPolicyInput,
} from '@/lib/security/tool-governance';

function policyInput(overrides: Partial<ToolPolicyInput> = {}): ToolPolicyInput {
  return {
    sessionId: 'conversation_1',
    workspaceId: 'workspace_1',
    agentId: 'agent_1',
    contactId: null,
    specialist: 'GENERAL_RECEPTION',
    tool: 'check_availability',
    parameters: {},
    identityVerificationState: null,
    riskFlags: [],
    complianceFlags: [],
    history: [],
    ...overrides,
  };
}

describe('tool governance', () => {
  it('creates the same semantic fingerprint for reordered and normalized payloads', () => {
    const first = fingerprintToolPayload('create_or_update_contact', {
      email: ' CUSTOMER@EXAMPLE.COM ',
      phone: '+1 (555) 010-1773',
      name: ' Avery Morgan ',
    });
    const second = fingerprintToolPayload('create_or_update_contact', {
      name: 'Avery Morgan',
      phone: '+15550101773',
      email: 'customer@example.com',
    });

    expect(first).toBe(second);
  });

  it('allows low-risk read operations', async () => {
    const decision = await deterministicToolPolicyEvaluator.evaluate(policyInput());
    expect(decision.outcome).toBe('ALLOW');
    expect(decision.riskLevel).toBe('LOW');
  });

  it('escalates sensitive changes to an existing contact without verified identity', async () => {
    const decision = await deterministicToolPolicyEvaluator.evaluate(
      policyInput({
        contactId: 'contact_1',
        tool: 'create_or_update_contact',
        parameters: { email: 'new@example.com' },
      })
    );

    expect(decision.outcome).toBe('ESCALATE');
    expect(decision.triggeredPolicyIds).toContain('IDENTITY_REQUIRED_FOR_SENSITIVE_MUTATION');
  });

  it('uses prior session actions when evaluating data egress risk', async () => {
    const decision = await deterministicToolPolicyEvaluator.evaluate(
      policyInput({
        tool: 'create_follow_up',
        parameters: { type: 'CALLBACK', preferredChannel: 'EMAIL' },
        history: [
          {
            tool: 'create_or_update_contact',
            status: 'SUCCEEDED',
            dataCategories: ['CONTACT_EMAIL'],
          },
        ],
      })
    );

    expect(decision.outcome).toBe('ESCALATE');
    expect(decision.reasonCodes).toContain('SESSION_DATA_EGRESS_RISK');
  });

  it('denies external follow-up for a suppressed contact', async () => {
    const decision = await deterministicToolPolicyEvaluator.evaluate(
      policyInput({
        tool: 'schedule_callback',
        complianceFlags: ['DO_NOT_CALL'],
      })
    );

    expect(decision.outcome).toBe('DENY');
    expect(decision.triggeredPolicyIds).toContain('OUTBOUND_SUPPRESSION');
  });

  it('always permits opt-out recording and safe human escalation', async () => {
    const optOut = await deterministicToolPolicyEvaluator.evaluate(
      policyInput({ tool: 'record_opt_out', complianceFlags: ['REVIEW_REQUIRED'] })
    );
    const handoff = await deterministicToolPolicyEvaluator.evaluate(
      policyInput({ tool: 'request_human_handoff', riskFlags: ['CRITICAL'] })
    );

    expect(optOut.outcome).toBe('ALLOW');
    expect(handoff.outcome).toBe('ALLOW');
  });
});
