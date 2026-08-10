import crypto from 'node:crypto';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TelnyxProvider } from '@/lib/telephony/providers/telnyx';

describe('Telnyx webhook verification and identity', () => {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519');
  const publicKeyPem = publicKey.export({ format: 'pem', type: 'spki' }).toString();
  const provider = new TelnyxProvider({ publicKey: publicKeyPem });
  const body = JSON.stringify({ data: { id: 'event-1' } });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function headers(timestamp: number, value = body) {
    const signature = crypto
      .sign(null, Buffer.from(`${timestamp}|${value}`), privateKey)
      .toString('base64');
    return {
      'telnyx-timestamp': String(timestamp),
      'telnyx-signature-ed25519': signature,
    };
  }

  it('accepts a current signature over the exact raw body', async () => {
    const now = Math.floor(Date.now() / 1000);
    await expect(provider.verifyWebhook(headers(now), body)).resolves.toBe(true);
  });

  it('rejects forged and expired deliveries', async () => {
    const now = Math.floor(Date.now() / 1000);
    await expect(provider.verifyWebhook(headers(now), `${body} `)).resolves.toBe(false);
    await expect(provider.verifyWebhook(headers(now - 301), body)).resolves.toBe(false);
  });

  it('preserves the provider event id and occurrence time', () => {
    const occurredAt = '2026-08-09T12:00:00.000Z';
    const event = provider.parseWebhookEvent({
      data: {
        id: 'telnyx-event-123',
        event_type: 'call.initiated',
        occurred_at: occurredAt,
        payload: {
          call_control_id: 'control-1',
          call_session_id: 'session-1',
          call_leg_id: 'leg-1',
          connection_id: 'connection-1',
          from: '+15550000001',
          to: '+15550000002',
          state: 'ringing',
          direction: 'incoming',
        },
      },
      meta: { attempt: 1, delivered_to: 'https://example.test/webhook' },
    });

    expect(event.providerEventId).toBe('telnyx-event-123');
    expect(event.timestamp.toISOString()).toBe(occurredAt);
    expect(event.direction).toBe('INBOUND');
  });

  it('never enables provider recording before a policy-authorized consent state', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            call_control_id: 'control-a',
            call_session_id: 'session-a',
            call_leg_id: 'leg-a',
            connection_id: 'connection-a',
            from: '+15550000001',
            to: '+15550000002',
            state: 'initiated',
            direction: 'outgoing',
          },
        }),
        { status: 200, headers: { 'content-type': 'application/json' } }
      )
    );
    vi.stubGlobal('fetch', fetchMock);
    const configured = new TelnyxProvider({
      apiKey: 'test-key',
      connectionId: 'connection-a',
    });

    await configured.startCall({
      workspaceId: 'workspace-a',
      businessId: 'business-a',
      agentId: 'agent-a',
      agentVersionId: 'version-a',
      callerNumber: '+15550000002',
      direction: 'OUTBOUND',
      channel: 'PHONE',
      language: 'en-US',
      trainingPackVersion: 1,
    });

    const request = fetchMock.mock.calls[0][1] as RequestInit;
    const requestBody = JSON.parse(String(request.body));
    expect(requestBody.record).toBe(false);
    expect(requestBody).not.toHaveProperty('recording_channels');
  });
});
