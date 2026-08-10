import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  handoffFind: vi.fn(),
  handoffUpdate: vi.fn(),
  callFind: vi.fn(),
  agentFind: vi.fn(),
  auditCreate: vi.fn(),
  transaction: vi.fn(),
  decrypt: vi.fn(),
  transfer: vi.fn(),
}));
vi.mock('@/lib/database', () => ({
  prisma: {
    handoff: { findFirst: mocks.handoffFind, update: mocks.handoffUpdate },
    call: { findFirst: mocks.callFind },
    voiceAgent: { findFirst: mocks.agentFind },
    auditLog: { create: mocks.auditCreate },
    $transaction: mocks.transaction,
  },
}));
vi.mock('@/lib/security/encryption', () => ({ decryptSensitiveValue: mocks.decrypt }));
vi.mock('@/lib/telephony/providers/telnyx', () => ({ TelnyxProvider: class {} }));

import { initiateConfiguredHandoff } from '@/lib/telephony/handoffs/initiate-handoff';

describe('configured Telnyx handoff initiation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.handoffFind.mockResolvedValue({ id: 'handoff-a' });
    mocks.callFind.mockResolvedValue({ providerCallControlId: 'control-a' });
    mocks.agentFind.mockResolvedValue({
      escalationPolicy: { targetPhoneEnc: 'encrypted-target' },
    });
    mocks.decrypt.mockReturnValue('+15551234567');
    mocks.transfer.mockResolvedValue(true);
    mocks.handoffUpdate.mockReturnValue(Promise.resolve({ id: 'handoff-a' }));
    mocks.auditCreate.mockReturnValue(Promise.resolve({ id: 'audit-a' }));
    mocks.transaction.mockResolvedValue([]);
  });

  it('uses only the decrypted configured target and an idempotent command ID', async () => {
    const result = await initiateConfiguredHandoff(
      'handoff-a',
      'workspace-a',
      'agent-a',
      'call-a',
      'tool-execution-a',
      { transferCall: mocks.transfer }
    );
    expect(mocks.transfer).toHaveBeenCalledWith(
      'control-a',
      '+15551234567',
      'tool-execution-a'
    );
    expect(result).toEqual({
      handoffId: 'handoff-a',
      status: 'INITIATED',
      providerTransferConfirmed: false,
    });
  });

  it('records provider rejection without claiming connection', async () => {
    mocks.transfer.mockResolvedValue(false);
    const result = await initiateConfiguredHandoff(
      'handoff-a',
      'workspace-a',
      'agent-a',
      'call-a',
      'tool-execution-a',
      { transferCall: mocks.transfer }
    );
    expect(result.status).toBe('FAILED');
    expect(mocks.auditCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: 'HANDOFF_FAILED',
          metadata: { reason: 'PROVIDER_TRANSFER_REJECTED' },
        }),
      })
    );
  });
});

