import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  ingest: vi.fn(),
  markRunning: vi.fn(),
  markCompleted: vi.fn(),
  markFailed: vi.fn(),
}));

vi.mock('@/lib/telephony/events/telnyx-inbox', async importOriginal => {
  const actual = await importOriginal<typeof import('@/lib/telephony/events/telnyx-inbox')>();
  return {
    ...actual,
    ingestTelnyxEvent: mocks.ingest,
    markTelnyxJobRunning: mocks.markRunning,
    markTelnyxJobCompleted: mocks.markCompleted,
    markTelnyxJobFailed: mocks.markFailed,
  };
});

import type { IdentifiedTelnyxEvent } from '@/lib/telephony/events/telnyx-inbox';
import { queueTelnyxEvent } from '@/lib/telephony/events/telnyx-handler';

const event: IdentifiedTelnyxEvent = {
  eventType: 'CALL_RINGING',
  providerEventId: 'event-a',
  providerCallControlId: 'control-a',
  timestamp: new Date('2026-08-09T10:00:00.000Z'),
  rawPayload: {},
  direction: 'INBOUND',
  fromNumber: '+15552345678',
  toNumber: '+15559876543',
  callState: 'RINGING',
};

describe('Telnyx webhook acknowledgment boundary', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 202 after durable enqueue without executing reconciliation inline', async () => {
    mocks.ingest.mockResolvedValue({
      providerEventRecordId: 'provider-event-a',
      jobId: 'job-a',
      correlationId: 'telnyx_event-a',
      duplicate: false,
    });
    const scheduled: Array<() => Promise<void>> = [];

    const response = await queueTelnyxEvent(event, task => scheduled.push(task), vi.fn());

    expect(response.status).toBe(202);
    expect(scheduled).toHaveLength(1);
    expect(mocks.markRunning).not.toHaveBeenCalled();
    expect(mocks.markCompleted).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toMatchObject({
      data: { received: true, queued: true, duplicate: false },
      meta: { correlationId: 'telnyx_event-a' },
    });
  });

  it('acknowledges a replay without scheduling another processor', async () => {
    mocks.ingest.mockResolvedValue({
      providerEventRecordId: 'provider-event-a',
      correlationId: 'telnyx_event-a',
      duplicate: true,
    });
    const schedule = vi.fn();

    const response = await queueTelnyxEvent(event, schedule, vi.fn());

    expect(response.status).toBe(200);
    expect(schedule).not.toHaveBeenCalled();
  });
});

