import { afterEach, describe, expect, it, vi } from 'vitest';

import { requestElevenLabsSignedUrl } from '@/lib/elevenlabs/conversation-access';

const signedUrl = 'wss://api.elevenlabs.io/v1/convai/conversation?agent_id=agent_test&token=test';

function mockProvider(status: number, payload: object) {
  const response = new Response(JSON.stringify(payload), { status });
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => response)
  );
}

describe('ElevenLabs conversation access', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns the signed WebSocket URL used by the browser client', async () => {
    mockProvider(200, { signed_url: signedUrl });

    const result = await requestElevenLabsSignedUrl({
      apiKey: 'test-key',
      agentId: 'agent_test',
    });

    expect(result).toEqual({ ok: true, signedUrl });
  });

  it.each([
    [401, 'ELEVENLABS_CREDENTIALS_REJECTED'],
    [403, 'ELEVENLABS_CREDENTIALS_REJECTED'],
    [404, 'ELEVENLABS_AGENT_NOT_FOUND'],
    [422, 'ELEVENLABS_AGENT_CONFIGURATION_INVALID'],
    [429, 'ELEVENLABS_RATE_LIMITED'],
    [503, 'ELEVENLABS_PROVIDER_UNAVAILABLE'],
  ] as const)(
    'maps provider status %s to %s without exposing a response body',
    async (status, code) => {
      mockProvider(status, { detail: 'provider detail must remain private' });

      const result = await requestElevenLabsSignedUrl({
        apiKey: 'test-key',
        agentId: 'agent_test',
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.code).toBe(code);
        expect(result.providerStatus).toBe(status);
        expect(result.message).not.toContain('provider detail');
      }
    }
  );

  it('rejects a response without a signed WebSocket URL', async () => {
    mockProvider(200, { signed_url: 'https://invalid' });

    const result = await requestElevenLabsSignedUrl({
      apiKey: 'test-key',
      agentId: 'agent_test',
    });

    expect(result).toMatchObject({
      ok: false,
      code: 'ELEVENLABS_TOKEN_FAILED',
    });
  });
});
