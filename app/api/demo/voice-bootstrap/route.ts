import { NextResponse } from 'next/server';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { signDemoSessionToken } from '@/lib/security/session-token';
import crypto from 'crypto';

export async function POST(req: Request) {
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'INVALID_JSON', message: 'Invalid JSON request body.' },
      { status: 400, headers: { 'Cache-Control': 'no-store, private' } }
    );
  }

  const { presetKey, language, scenario } = body;

  if (presetKey !== 'LEGAL' || language !== 'en-US') {
    return NextResponse.json(
      {
        error: 'UNSUPPORTED_CONFIGURATION',
        message: 'Only LEGAL preset and en-US language are supported in production.',
      },
      { status: 400, headers: { 'Cache-Control': 'no-store, private' } }
    );
  }

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
    process.env.ELEVENLABS_AGENT_ID_LEGAL_EN?.trim() || process.env.ELEVENLABS_AGENT_ID?.trim();

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
          message: `ElevenLabs agent '${agentId}' could not be retrieved.`,
        },
        { status: 502, headers: { 'Cache-Control': 'no-store, private' } }
      );
    }
  } catch (err: any) {
    return NextResponse.json(
      {
        error: 'ELEVENLABS_AGENT_INVALID',
        message: `ElevenLabs agent validation failed: ${err?.message || 'Unknown error'}`,
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
      const errText = await signedUrlRes.text();
      return NextResponse.json(
        {
          error: 'ELEVENLABS_TOKEN_FAILED',
          message: `Failed to acquire ElevenLabs conversation token: ${errText}`,
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
  } catch (err: any) {
    return NextResponse.json(
      {
        error: 'ELEVENLABS_TOKEN_FAILED',
        message: `Error acquiring conversation token: ${err?.message || err}`,
      },
      { status: 502, headers: { 'Cache-Control': 'no-store, private' } }
    );
  }

  const sessionId = `demo_session_${crypto.randomBytes(12).toString('hex')}`;
  const now = Date.now();
  const expiresAt = now + 180 * 1000 + 30 * 1000; // 180s active + 30s grace

  const sessionToken = signDemoSessionToken({
    sessionId,
    presetKey: 'LEGAL',
    language: 'en-US',
    scenario: scenario || 'QUALIFICATION',
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
        displayName: 'Maya',
        businessName: 'Northstar Legal Consultations',
        language: 'en-US',
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
