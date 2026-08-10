import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  find: vi.fn(),
  update: vi.fn(),
  audit: vi.fn(),
  transaction: vi.fn(),
}));
vi.mock('@/lib/database', () => ({
  prisma: {
    handoff: { findFirst: mocks.find, update: mocks.update },
    auditLog: { create: mocks.audit },
    $transaction: mocks.transaction,
  },
}));

import { projectProviderHandoffState } from '@/lib/telephony/handoffs/project-handoff-event';

describe('provider-confirmed handoff projection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.find.mockResolvedValue({ id: 'handoff-a', result: 'REQUESTED' });
    mocks.update.mockReturnValue(Promise.resolve({ id: 'handoff-a' }));
    mocks.audit.mockReturnValue(Promise.resolve({ id: 'audit-a' }));
    mocks.transaction.mockResolvedValue([]);
  });

  it('marks ringing without claiming a human is connected', async () => {
    const occurredAt = new Date('2026-08-10T10:00:00Z');
    await projectProviderHandoffState('call-a', 'workspace-a', 'HUMAN_TRANSFER_PENDING', occurredAt);
    expect(mocks.find).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ workspaceId: 'workspace-a' }) })
    );
    expect(mocks.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ result: 'RINGING' }) })
    );
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it('marks connected only from the provider-confirmed connected state', async () => {
    mocks.find.mockResolvedValue({ id: 'handoff-a', result: 'RINGING' });
    await projectProviderHandoffState(
      'call-a',
      'workspace-a',
      'HUMAN_CONNECTED',
      new Date('2026-08-10T10:01:00Z')
    );
    expect(mocks.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ result: 'CONNECTED' }) })
    );
    expect(mocks.audit).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ action: 'HANDOFF_COMPLETED' }) })
    );
    expect(mocks.transaction).toHaveBeenCalledTimes(1);
  });
});
