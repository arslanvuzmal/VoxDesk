import { afterEach, describe, expect, it, vi } from 'vitest';
import { TelnyxProvider } from '@/lib/telephony/providers/telnyx';

describe('Telnyx outbound caller ID', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('uses the server-resolved eligible caller ID', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          call_control_id: 'control-1',
          call_session_id: 'session-1',
          call_leg_id: 'leg-1',
          connection_id: 'connection-1',
          state: 'ringing',
        },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);
    const provider = new TelnyxProvider({
      apiKey: 'test-key',
      connectionId: 'connection-1',
      webhookUrl: 'https://example.test/telnyx',
      failoverUrl: 'https://example.test/telnyx/failover',
    });

    await provider.startCall({
      workspaceId: 'workspace-1',
      businessId: 'business-1',
      agentId: 'agent-1',
      agentVersionId: 'version-1',
      callerNumber: '+15551234567',
      callerIdNumber: '+15557654321',
      direction: 'OUTBOUND',
      channel: 'PHONE',
      language: 'en-US',
      trainingPackVersion: 2,
    });

    const request = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(request).toMatchObject({ from: '+15557654321', to: '+15551234567', record: false });
  });
});
