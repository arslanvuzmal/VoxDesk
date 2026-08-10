import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('human handoff destination authorization', () => {
  const source = readFileSync('lib/voice-agent/tool-executor.ts', 'utf8');

  it('does not accept an LLM-supplied destination', () => {
    const schema = source.slice(source.indexOf('const HandoffSchema'), source.indexOf('export class'));
    expect(schema).not.toContain('destination:');
  });

  it('resolves transfer targets from the tenant-scoped agent escalation policy', () => {
    expect(source).toContain("workspaceId: context.workspaceId");
    expect(source).toContain('include: { escalationPolicy: true }');
    expect(source).toContain('escalationPolicy.targetPhoneEnc');
    expect(source).toContain('providerTransferConfirmed: false');
  });
});

