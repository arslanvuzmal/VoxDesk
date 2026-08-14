import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TelnyxProvider } from '@/lib/telephony/providers/telnyx';

describe('Telnyx outbound caller ID', () => {
  const liveEnvironment = {
    TELEPHONY_MODE: 'live',
    DATABASE_URL: 'postgresql://demo:demo@localhost:5432/voxdesk',
    APP_URL: 'https://example.test',
    ELEVENLABS_API_KEY: 'test-key',
    ELEVENLABS_AGENT_ID: 'test-agent',
    TELNYX_API_KEY: 'test-key',
    TELNYX_PUBLIC_KEY: 'test-public-key',
    TELNYX_CONNECTION_ID: 'connection-1',
    TELNYX_PRIMARY_PHONE_NUMBER: '+15555550123',
    TELNYX_OUTBOUND_VOICE_PROFILE_ID: 'profile-1',
  };
  const previousEnvironment = Object.fromEntries(
    Object.keys(liveEnvironment).map(key => [key, process.env[key]])
  );

  beforeEach(() => {
    Object.assign(process.env, liveEnvironment);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    for (const [key, value] of Object.entries(previousEnvironment)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });

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

    await expect(
      provider.startCall({
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
      })
    ).rejects.toThrow('approved Telnyx number');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('does not use the outbound profile ID as a caller ID', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          call_control_id: 'control-2',
          call_session_id: 'session-2',
          call_leg_id: 'leg-2',
          connection_id: 'connection-1',
          state: 'initiated',
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
      direction: 'OUTBOUND',
      channel: 'PHONE',
      language: 'en-US',
      trainingPackVersion: 2,
    });

    const request = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(request.from).toBe('+15555550123');
    expect(request.from).not.toBe('profile-1');
  });
});
