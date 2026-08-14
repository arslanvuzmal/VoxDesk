import 'server-only';

export type ElevenLabsAccessFailureCode =
  | 'ELEVENLABS_CREDENTIALS_REJECTED'
  | 'ELEVENLABS_AGENT_NOT_FOUND'
  | 'ELEVENLABS_AGENT_CONFIGURATION_INVALID'
  | 'ELEVENLABS_RATE_LIMITED'
  | 'ELEVENLABS_PROVIDER_UNAVAILABLE'
  | 'ELEVENLABS_TOKEN_FAILED';

export type ElevenLabsConversationAccessResult =
  | {
      ok: true;
      signedUrl: string;
    }
  | {
      ok: false;
      code: ElevenLabsAccessFailureCode;
      message: string;
      providerStatus: number | null;
    };

function failureForStatus(status: number): Exclude<ElevenLabsConversationAccessResult, { ok: true }> {
  if (status === 401 || status === 403) {
    return {
      ok: false,
      code: 'ELEVENLABS_CREDENTIALS_REJECTED',
      message:
        'ElevenLabs rejected the configured API key. Confirm the key is active and has access to Conversational AI.',
      providerStatus: status,
    };
  }

  if (status === 404) {
    return {
      ok: false,
      code: 'ELEVENLABS_AGENT_NOT_FOUND',
      message:
        'ElevenLabs could not find this agent for the configured API key. Confirm both values belong to the same ElevenLabs workspace.',
      providerStatus: status,
    };
  }

  if (status === 422) {
    return {
      ok: false,
      code: 'ELEVENLABS_AGENT_CONFIGURATION_INVALID',
      message:
        'ElevenLabs rejected the configured agent ID. Copy the Agent ID from the ElevenLabs Agents dashboard and try again.',
      providerStatus: status,
    };
  }

  if (status === 429) {
    return {
      ok: false,
      code: 'ELEVENLABS_RATE_LIMITED',
      message: 'ElevenLabs is temporarily rate limiting new voice sessions. Try again shortly.',
      providerStatus: status,
    };
  }

  if (status >= 500) {
    return {
      ok: false,
      code: 'ELEVENLABS_PROVIDER_UNAVAILABLE',
      message: 'ElevenLabs is temporarily unavailable. No conversation was started.',
      providerStatus: status,
    };
  }

  return {
    ok: false,
    code: 'ELEVENLABS_TOKEN_FAILED',
    message: 'ElevenLabs did not authorize a conversation for the configured agent.',
    providerStatus: status,
  };
}

/**
 * Requests the credential that the ElevenLabs React client actually consumes.
 *
 * This is the authoritative readiness boundary for Web Voice. A separate
 * agents.get() preflight is intentionally avoided: API-key scopes can allow
 * signed conversation creation without allowing agent-management reads.
 */
export async function requestElevenLabsSignedUrl({
  apiKey,
  agentId,
}: {
  apiKey: string;
  agentId: string;
}): Promise<ElevenLabsConversationAccessResult> {
  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${encodeURIComponent(agentId)}`,
      {
        method: 'GET',
        headers: {
          'xi-api-key': apiKey,
          Accept: 'application/json',
        },
        cache: 'no-store',
        signal: AbortSignal.timeout(10_000),
      }
    );

    if (!response.ok) return failureForStatus(response.status);

    const payload: unknown = await response.json();
    const signedUrl =
      typeof payload === 'object' &&
      payload !== null &&
      'signed_url' in payload &&
      typeof payload.signed_url === 'string'
        ? payload.signed_url
        : '';

    if (!signedUrl.startsWith('wss://')) {
      return {
        ok: false,
        code: 'ELEVENLABS_TOKEN_FAILED',
        message: 'ElevenLabs returned an invalid conversation credential.',
        providerStatus: response.status,
      };
    }

    return { ok: true, signedUrl };
  } catch {
    return {
      ok: false,
      code: 'ELEVENLABS_PROVIDER_UNAVAILABLE',
      message: 'VoxDesk could not reach ElevenLabs. No conversation was started.',
      providerStatus: null,
    };
  }
}
