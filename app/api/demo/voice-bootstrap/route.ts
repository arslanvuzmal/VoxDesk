import { NextResponse } from 'next/server';
import { signDemoSessionToken } from '@/lib/security/session-token';
import crypto from 'crypto';
import { z } from 'zod';
import { DEFAULT_DEMO_CONFIGURATION } from '@/lib/demo/configuration';
import { getDemoSessionFromCookieToken } from '@/lib/demo/session';
import { requestElevenLabsSignedUrl } from '@/lib/elevenlabs/conversation-access';

const DemoBootstrapSchema = z.object({
  presetKey: z.literal('LEGAL'),
  language: z.literal('en-US'),
  scenario: z.enum(['BOOKING', 'QUALIFICATION', 'ESCALATION', 'ROUTINE']),
  channel: z.literal('WEB_VOICE'),
});

function noStoreHeaders() {
  return { 'Cache-Control': 'no-store, private' };
}

export async function POST(req: Request) {
  const cookieHeader = req.headers.get('cookie') ?? '';
  const existingToken = cookieHeader.match(/(?:^|;\s*)voxdesk_demo_session=([^;]+)/)?.[1];
  const existingSession = existingToken ? await getDemoSessionFromCookieToken(existingToken) : null;
  if (!existingSession) {
    return NextResponse.json(
      {
        error: 'DEMO_SESSION_REQUIRED',
        message: 'Start an authenticated demo session before starting Web Voice.',
      },
      { status: 401, headers: noStoreHeaders() }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'INVALID_JSON', message: 'Invalid JSON request body.' },
      { status: 400, headers: noStoreHeaders() }
    );
  }

  const parsed = DemoBootstrapSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'UNSUPPORTED_CONFIGURATION',
        message: 'This demo configuration is not available.',
      },
      { status: 400, headers: noStoreHeaders() }
    );
  }
  const { presetKey, language, scenario } = parsed.data;

  const apiKey = (process.env.ELEVENLABS_API_KEY || process.env.ELEVENLABS)?.trim();
  if (!apiKey) {
    return NextResponse.json(
      {
        error: 'ELEVENLABS_NOT_CONFIGURED',
        message: 'ElevenLabs API key is not configured for this deployment.',
      },
      { status: 503, headers: noStoreHeaders() }
    );
  }

  const agentId =
    process.env.ELEVENLABS_AGENT_ID?.trim() || process.env.ELEVENLABS_AGENT_ID_LEGAL_EN?.trim();

  if (!agentId) {
    return NextResponse.json(
      {
        error: 'ELEVENLABS_AGENT_NOT_CONFIGURED',
        message: 'ElevenLabs Agent ID is not configured for this deployment.',
      },
      { status: 503, headers: noStoreHeaders() }
    );
  }

  // The signed URL is the credential consumed by the browser SDK, so obtaining
  // it is the authoritative provider check. Agent-management reads are not used
  // as a gate because ElevenLabs API keys can have narrower conversation scopes.
  const access = await requestElevenLabsSignedUrl({ apiKey, agentId });
  if (!access.ok) {
    console.warn('[voice-bootstrap] ElevenLabs conversation authorization failed', {
      code: access.code,
      providerStatus: access.providerStatus,
    });
    return NextResponse.json(
      {
        error: access.code,
        message: access.message,
      },
      { status: access.providerStatus === 429 ? 429 : 502, headers: noStoreHeaders() }
    );
  }

  const sessionId = `demo_session_${crypto.randomBytes(12).toString('hex')}`;
  const now = Date.now();
  const expiresAt = now + 180 * 1000 + 30 * 1000;

  const sessionToken = signDemoSessionToken({
    sessionId,
    presetKey,
    language,
    scenario,
    issuedAt: now,
    expiresAt,
  });

  const response = NextResponse.json(
    {
      success: true,
      sessionId,
      conversationToken: access.signedUrl,
      expiresAt: new Date(expiresAt).toISOString(),
      agent: {
        displayName: DEFAULT_DEMO_CONFIGURATION.agentDisplayName,
        businessName: DEFAULT_DEMO_CONFIGURATION.businessName,
        language,
      },
    },
    {
      status: 200,
      headers: noStoreHeaders(),
    }
  );

  response.cookies.set('voxdesk_demo_session', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 210,
    path: '/',
  });

  return response;
}
