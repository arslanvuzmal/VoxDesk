import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

function source(...parts: string[]): string {
  return readFileSync(join(process.cwd(), ...parts), 'utf8');
}

describe('tool governance security boundary', () => {
  it('persists tri-state policy evidence and payload-bound approvals', () => {
    const schema = source('prisma', 'schema.prisma');

    expect(schema).toContain('enum ToolPolicyOutcome');
    expect(schema).toContain('ALLOW');
    expect(schema).toContain('DENY');
    expect(schema).toContain('ESCALATE');
    expect(schema).toContain('model ToolApprovalRequest');
    expect(schema).toContain('payloadFingerprint');
    expect(schema).toContain('@@unique([conversationId, actionId])');
    expect(schema).toContain('PENDING_APPROVAL');
  });

  it('uses an additive governance migration', () => {
    const migration = source(
      'prisma',
      'migrations',
      '20260812223000_add_tool_governance',
      'migration.sql'
    );

    expect(migration).toContain('CREATE TABLE "tool_approval_requests"');
    expect(migration).toContain('ADD COLUMN "payloadFingerprint" TEXT');
    expect(migration).not.toMatch(/DROP\s+(TABLE|COLUMN|TYPE)/i);
    expect(migration).not.toMatch(/DELETE\s+FROM/i);
  });

  it('keeps policy and execution integrity as separate checks', () => {
    const executor = source('lib', 'voice-agent', 'tool-executor.ts');

    expect(executor).toContain('deterministicToolPolicyEvaluator.evaluate');
    expect(executor).toContain('fingerprintToolPayload');
    expect(executor).toContain("decision.outcome === 'ESCALATE'");
    expect(executor).toContain("existing.status === 'SUCCEEDED'");
    expect(executor).toContain('payloadFingerprint !== payloadFingerprint');
  });

  it('requires an authorized workspace administrator for approval decisions', () => {
    const route = source('app', 'api', 'tool-approvals', '[id]', 'route.ts');

    expect(route).toContain("hasPermission(member.role as WorkspaceRole, 'tools:approve')");
    expect(route).toContain('workspaceId: { in: authorizedWorkspaceIds }');
    expect(route).toContain("status: 'PENDING'");
    expect(route).toContain('decidedByUserId: auth.user.userId');
    expect(route).not.toContain('x-demo');
  });

  it('binds an approval retry to the exact persisted fingerprint', () => {
    const executor = source('lib', 'voice-agent', 'tool-executor.ts');

    expect(executor).toContain('options.approvalRequestId !== approval.id');
    expect(executor).toContain('approval.payloadFingerprint !== payloadFingerprint');
    expect(executor).toContain("status: 'CONSUMED'");
  });
});
