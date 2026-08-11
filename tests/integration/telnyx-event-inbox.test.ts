import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  transaction: vi.fn(),
  providerEventCreate: vi.fn(),
  jobCreate: vi.fn(),
  providerEventFindUnique: vi.fn(),
}));

vi.mock('@/lib/database', () => ({
  prisma: {
    $transaction: mocks.transaction,
    providerEvent: { findUnique: mocks.providerEventFindUnique },
  },
}));

import type { IdentifiedTelnyxEvent } from '@/lib/telephony/events/telnyx-inbox';
import { ingestTelnyxEvent } from '@/lib/telephony/events/telnyx-inbox';

const event: IdentifiedTelnyxEvent = {
  eventType: 'CALL_RINGING',
  providerEventId: 'telnyx-event-a',
  providerCallControlId: 'control-a',
  providerCallSessionId: 'session-a',
  providerCallLegId: 'leg-a',
  connectionId: 'connection-a',
  timestamp: new Date('2026-08-09T10:00:00.000Z'),
  rawPayload: { data: { payload: { from: '+15552345678', to: '+15559876543' } } },
  direction: 'INBOUND',
  fromNumber: '+15552345678',
  toNumber: '+15559876543',
  callState: 'RINGING',
};

describe('Telnyx provider event inbox', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const tx = {
      providerEvent: { create: mocks.providerEventCreate },
      backgroundJob: { create: mocks.jobCreate },
    };
    mocks.transaction.mockImplementation(async callback => callback(tx));
    mocks.providerEventCreate.mockResolvedValue({ id: 'provider-event-a' });
    mocks.jobCreate.mockResolvedValue({ id: 'job-a' });
  });

  it('stores an immutable safe event and queues bounded asynchronous processing atomically', async () => {
    await expect(ingestTelnyxEvent(event)).resolves.toEqual({
      providerEventRecordId: 'provider-event-a',
      jobId: 'job-a',
      correlationId: 'telnyx_telnyx-event-a',
      duplicate: false,
    });

    const create = mocks.providerEventCreate.mock.calls[0][0];
    expect(create.data).toMatchObject({
      provider: 'TELNYX',
      providerEventId: 'telnyx-event-a',
      eventType: 'CALL_RINGING',
      connectionId: 'connection-a',
      processingState: 'PENDING',
      safePayload: {
        direction: 'INBOUND',
        callState: 'RINGING',
        fromMasked: '***5678',
        toMasked: '***6543',
      },
    });
    expect(JSON.stringify(create.data)).not.toContain('+15552345678');
    expect(JSON.stringify(create.data)).not.toContain('+15559876543');
    expect(mocks.jobCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        type: 'TELNYX_EVENT_PROCESS',
        resourceId: 'provider-event-a',
        maxAttempts: 5,
      }),
    });
  });

  it('recognizes a replay by provider event ID and does not enqueue another job', async () => {
    mocks.transaction.mockRejectedValue({ code: 'P2002' });
    mocks.providerEventFindUnique.mockResolvedValue({
      id: 'provider-event-a',
      correlationId: 'telnyx_telnyx-event-a',
    });

    await expect(ingestTelnyxEvent(event)).resolves.toEqual({
      providerEventRecordId: 'provider-event-a',
      correlationId: 'telnyx_telnyx-event-a',
      duplicate: true,
    });
    expect(mocks.providerEventFindUnique).toHaveBeenCalledWith({
      where: {
        provider_providerEventId: {
          provider: 'TELNYX',
          providerEventId: 'telnyx-event-a',
        },
      },
      select: { id: true, correlationId: true },
    });
  });
});
