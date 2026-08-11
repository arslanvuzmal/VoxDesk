import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({
  requireWorkspaceAccess: vi.fn(),
  findFirst: vi.fn(),
  updateMany: vi.fn(),
  auditCreate: vi.fn(),
  transaction: vi.fn(),
}));

vi.mock('@/lib/auth/require-session', () => ({
  requireWorkspaceAccess: mocks.requireWorkspaceAccess,
}));
vi.mock('@/lib/database', () => ({
  prisma: {
    improvementProposal: { findFirst: mocks.findFirst },
    $transaction: mocks.transaction,
  },
}));

import { POST } from '@/app/api/improvement/proposals/[id]/reject/route';

function request(reason = 'Evidence does not support this proposed change.') {
  return new NextRequest('https://example.test/api/improvement/proposals/proposal-a/reject', {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

describe('supervised improvement rejection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireWorkspaceAccess.mockResolvedValue({
      workspaceId: 'workspace-a',
      userId: 'user-a',
    });
    mocks.findFirst.mockResolvedValue({
      id: 'proposal-a',
      status: 'PENDING_REVIEW',
      decision: null,
    });
    mocks.updateMany.mockResolvedValue({ count: 1 });
    mocks.auditCreate.mockResolvedValue({});
    mocks.transaction.mockImplementation(async callback =>
      callback({
        improvementProposal: { updateMany: mocks.updateMany },
        auditLog: { create: mocks.auditCreate },
      })
    );
  });

  it('scopes the proposal and records reviewer rationale without creating a candidate', async () => {
    const response = await POST(request(), { params: Promise.resolve({ id: 'proposal-a' }) });

    expect(response.status).toBe(200);
    expect(mocks.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'proposal-a', workspaceId: 'workspace-a' } })
    );
    expect(mocks.auditCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: 'IMPROVEMENT_REJECTED',
        userId: 'user-a',
        metadata: { reason: 'Evidence does not support this proposed change.' },
      }),
    });
  });

  it('requires an explicit reviewer rationale', async () => {
    const response = await POST(request('no'), { params: Promise.resolve({ id: 'proposal-a' }) });

    expect(response.status).toBe(400);
    expect(mocks.findFirst).not.toHaveBeenCalled();
  });
});
