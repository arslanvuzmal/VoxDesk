import { NextResponse } from 'next/server';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { signDemoSessionToken } from '@/lib/security/session-token';
import crypto from 'crypto';
import { z } from 'zod';
import { DEFAULT_DEMO_CONFIGURATION } from '@/lib/demo/configuration';
import { getDemoSessionFromCookieToken } from '@/lib/demo/session';

const DemoBootstrapSchema = z.object({
  presetKey: z.literal('LEGAL'),
  language: z.literal('en-US'),
  scenario: z.enum(['BOOKING', 'QUALIFICATION', 'ESCALATION', 'ROUTINE']),
  channel: z.literal('WEB_VOICE'),
});

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
      { status: 401, headers: { 'Cache-Control': 'no-store, private' } }
    );
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'INVALID_JSON', message: 'Invalid JSON request body.' },
      { status: 400, headers: { 'Cache-Control': 'no-store, private' } }
    );
  }

  const parsed = DemoBootstrapSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'UNSUPPORTED_CONFIGURATION',
        message: 'This demo configuration is not available.',
      },
      { status: 400, headers: { 'Cache-Control': 'no-store, private' } }
    );
  }
  const { presetKey, language, scenario } = parsed.data;

  const apiKey = (process.env.ELEVENLABS_API_KEY || process.env.ELEVENLABS)?.trim();
  if (!apiKey) {
    return NextResponse.json(
      {
        error: 'ELEVENLABS_NOT_CONFIGURED',
        message: 'ElevenLabs API key is not configured.',
      },
      { status: 503, headers: { 'Cache-Control': 'no-store, private' } }
    );
  }

  const agentId =
    process.env.ELEVENLABS_AGENT_ID?.trim() || process.env.ELEVENLABS_AGENT_ID_LEGAL_EN?.trim();

  if (!agentId) {
    return NextResponse.json(
      {
        error: 'ELEVENLABS_AGENT_INVALID',
        message: 'No ElevenLabs agent ID configured for Northstar Legal.',
      },
      { status: 502, headers: { 'Cache-Control': 'no-store, private' } }
    );
  }

  // Retrieve and validate agent from ElevenLabs
  const client = new ElevenLabsClient({ apiKey });
  try {
    const agent = await client.conversationalAi.agents.get(agentId);
    if (!agent || !agent.agentId) {
      return NextResponse.json(
        {
          error: 'ELEVENLABS_AGENT_INVALID',
          message: 'The configured ElevenLabs agent could not be verified.',
        },
        { status: 502, headers: { 'Cache-Control': 'no-store, private' } }
      );
    }
  } catch {
    return NextResponse.json(
      {
        error: 'ELEVENLABS_AGENT_INVALID',
        message: 'The configured ElevenLabs agent could not be verified.',
      },
      { status: 502, headers: { 'Cache-Control': 'no-store, private' } }
    );
  }

  // Request ElevenLabs WebRTC conversation token
  let conversationToken = '';
  try {
    const signedUrlRes = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${agentId}`,
      {
        headers: {
          'xi-api-key': apiKey,
        },
        cache: 'no-store',
      }
    );

    if (!signedUrlRes.ok) {
      return NextResponse.json(
        {
          error: 'ELEVENLABS_TOKEN_FAILED',
          message: 'ElevenLabs did not issue a conversation token.',
        },
        { status: 502, headers: { 'Cache-Control': 'no-store, private' } }
      );
    }

    const tokenData = await signedUrlRes.json();
    conversationToken =
      tokenData.signed_url || tokenData.token || tokenData.conversationToken || '';
    if (!conversationToken) {
      return NextResponse.json(
        {
          error: 'ELEVENLABS_TOKEN_FAILED',
          message: 'ElevenLabs response did not contain a conversation signed URL or token.',
        },
        { status: 502, headers: { 'Cache-Control': 'no-store, private' } }
      );
    }
  } catch {
    return NextResponse.json(
      {
        error: 'ELEVENLABS_TOKEN_FAILED',
        message: 'ElevenLabs could not issue a conversation token.',
      },
      { status: 502, headers: { 'Cache-Control': 'no-store, private' } }
    );
  }

  const sessionId = `demo_session_${crypto.randomBytes(12).toString('hex')}`;
  const now = Date.now();
  const expiresAt = now + 180 * 1000 + 30 * 1000; // 180s active + 30s grace

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
      conversationToken,
      expiresAt: new Date(expiresAt).toISOString(),
      agent: {
        displayName: DEFAULT_DEMO_CONFIGURATION.agentDisplayName,
        businessName: DEFAULT_DEMO_CONFIGURATION.businessName,
        language,
      },
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, private',
      },
    }
  );

  response.cookies.set('voxdesk_demo_session', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 210, // 210 seconds
    path: '/',
  });

  return response;
}
