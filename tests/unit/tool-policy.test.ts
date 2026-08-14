import { describe, expect, it } from 'vitest';
import { evaluateToolPolicy } from '@/lib/voice-agent/tool-policy';

describe('server tool policy', () => {
  it('allows an allowlisted action with ordinary payload data', () => {
    const result = evaluateToolPolicy({
      tool: 'create_task',
      parameters: { title: 'Call customer back' },
      priorSuccessfulTools: [],
    });
    expect(result.decision).toBe('ALLOW');
    expect(result.riskScore).toBeLessThan(50);
  });

  it('escalates payloads containing sensitive fields', () => {
    const result = evaluateToolPolicy({
      tool: 'create_or_update_contact',
      parameters: { name: 'Avery', ssn: 'redacted' },
      priorSuccessfulTools: [],
    });
    expect(result.decision).toBe('ESCALATE');
    expect(result.policyCodes).toContain('SENSITIVE_FIELD_REQUIRES_HUMAN');
  });

  it('denies a repeated consequential action in one session', () => {
    const result = evaluateToolPolicy({
      tool: 'book_appointment',
      parameters: { service: 'Consultation' },
      priorSuccessfulTools: ['book_appointment'],
    });
    expect(result.decision).toBe('DENY');
    expect(result.policyCodes).toContain('DUPLICATE_SESSION_ACTION');
  });

  it('escalates external communications', () => {
    const result = evaluateToolPolicy({
      tool: 'create_follow_up',
      parameters: { preferredChannel: 'EMAIL', recipient: 'customer@example.com' },
      priorSuccessfulTools: [],
    });
    expect(result.decision).toBe('ESCALATE');
    expect(result.policyCodes).toContain('EXTERNAL_COMMUNICATION_REQUIRES_APPROVAL');
  });
});
