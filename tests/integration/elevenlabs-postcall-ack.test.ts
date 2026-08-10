import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  ingest: vi.fn(),
  running: vi.fn(),
  completed: vi.fn(),
  failed: vi.fn(),
  reconcile: vi.fn(),
}));

vi.mock('@/lib/voice-agent/elevenlabs-postcall', async importOriginal => {
  const actual = await importOriginal<typeof import('@/lib/voice-agent/elevenlabs-postcall')>();
  return {
    ...actual,
    ingestElevenLabsPostCall: mocks.ingest,
    markElevenLabsJobRunning: mocks.running,
    markElevenLabsJobCompleted: mocks.completed,
    markElevenLabsJobFailed: mocks.failed,
    reconcileElevenLabsPostCall: mocks.reconcile,
  };
});

import { queueElevenLabsPostCall } from '@/lib/voice-agent/elevenlabs-postcall-handler';
import type { ElevenLabsPostCall } from '@/lib/voice-agent/elevenlabs-postcall';

const event: ElevenLabsPostCall = {
  type: 'post_call_transcription',
  event_timestamp: 1_786_262_400,
  data: {
    agent_id: 'provider-agent',
    conversation_id: 'provider-conversation',
    transcript: [],
    metadata: {},
  },
};

describe('ElevenLabs post-call acknowledgment boundary', () => {
  beforeEach(() => vi.clearAllMocks());

  it('acknowledges after durable enqueue without reconciling inline', async () => {
    mocks.ingest.mockResolvedValue({
      providerEventRecordId: 'provider-event',
      providerEventId: 'post_call_transcription:provider-conversation:1786262400',
      jobId: 'job',
      correlationId: 'elevenlabs_provider-conversation',
      duplicate: false,
    });
    const scheduled: Array<() => Promise<void>> = [];

    const response = await queueElevenLabsPostCall('{}', event, task => scheduled.push(task));

    expect(response.status).toBe(200);
    expect(scheduled).toHaveLength(1);
    expect(mocks.reconcile).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toMatchObject({
      data: { received: true, queued: true, duplicate: false },
    });
  });

  it('does not schedule duplicate provider events', async () => {
    mocks.ingest.mockResolvedValue({
      providerEventRecordId: 'provider-event',
      providerEventId: 'post_call_transcription:provider-conversation:1786262400',
      correlationId: 'elevenlabs_provider-conversation',
      duplicate: true,
    });
    const schedule = vi.fn();

    const response = await queueElevenLabsPostCall('{}', event, schedule);

    expect(response.status).toBe(200);
    expect(schedule).not.toHaveBeenCalled();
  });
});

