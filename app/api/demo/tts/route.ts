import { NextRequest, NextResponse } from 'next/server';
import { getDemoSessionFromCookieToken } from '@/lib/demo/session';
import { demoSessionStore } from '@/lib/demo/store';
import { generateCloudflareTTSAudio } from '@/lib/providers/cloudflare/tts.server';
import { isCloudflareAIEnabled } from '@/lib/providers/cloudflare/client.server';
import { generateAgentTTS } from '@/lib/providers/elevenlabs-tts.server';
import { env } from '@/lib/config/env';

export async function POST(req: NextRequest) {
  try {
    const cookieToken = req.cookies.get('voxdesk_demo_session')?.value;
    if (!cookieToken) {
      return NextResponse.json({ error: 'Missing session cookie' }, { status: 401 });
    }

    const session = await getDemoSessionFromCookieToken(cookieToken);
    if (!session) {
      return NextResponse.json({ error: 'Session expired or invalid' }, { status: 401 });
    }

    const body = await req.json();
    const responseId = body.responseId;

    if (!responseId || typeof responseId !== 'string') {
      return NextResponse.json(
        {
          error:
            'Invalid request: Must supply a valid server responseId voucher. Arbitrary browser text is rejected.',
        },
        { status: 400 }
      );
    }

    // Retrieve stored response
    const storedResponse = await demoSessionStore.getStoredResponse(responseId);

    if (!storedResponse) {
      return NextResponse.json({ error: 'Unknown or expired response ID.' }, { status: 404 });
    }

    if (storedResponse.sessionId !== session.sessionId) {
      return NextResponse.json(
        {
          error: 'Unauthorized: Response ID does not belong to active session.',
        },
        { status: 403 }
      );
    }

    if (storedResponse.consumed) {
      return NextResponse.json(
        { error: 'Conflict: Response ID has already been consumed.' },
        { status: 409 }
      );
    }

    // Check TTS Character Budget
    const maxTtsChars = parseInt(env.CLOUDFLARE_MAX_TTS_CHARACTERS_PER_SESSION, 10) || 1800;
    if (session.ttsCharacters + storedResponse.characterCount > maxTtsChars) {
      return NextResponse.json({
        fallbackWebSpeech: true,
        text: storedResponse.text,
        voiceName: 'Maya (Browser Fallback - Session Budget Exceeded)',
      });
    }

    // Consume response ID
    await demoSessionStore.consumeResponse(responseId);

    // Update TTS character usage
    await demoSessionStore.updateSession(session.sessionId, {
      ttsCharacters: session.ttsCharacters + storedResponse.characterCount,
    });

    // Check Cloudflare Workers AI TTS First
    if (isCloudflareAIEnabled()) {
      try {
        const cfResult = await generateCloudflareTTSAudio(storedResponse.text);
        return new NextResponse(new Uint8Array(cfResult.audioBuffer), {
          headers: {
            'Content-Type': cfResult.contentType,
            'Content-Length': cfResult.audioBuffer.length.toString(),
            'Cache-Control': 'no-store, private',
            'X-Content-Type-Options': 'nosniff',
            'Content-Disposition': 'inline',
            'Referrer-Policy': 'no-referrer',
          },
        });
      } catch (cfError) {
        console.warn('[CLOUDFLARE TTS FALLBACK]:', cfError);
      }
    }

    // Check ElevenLabs Secondary Provider
    if (env.DEMO_LIVE_PROVIDER_KILL_SWITCH !== 'true' && env.ELEVENLABS_API_KEY) {
      const result = await generateAgentTTS(storedResponse.text);
      if (!result.fallbackWebSpeech && result.audioBuffer) {
        return new NextResponse(new Uint8Array(result.audioBuffer), {
          headers: {
            'Content-Type': result.mimeType,
            'Content-Length': result.audioBuffer.length.toString(),
            'Cache-Control': 'no-store, private',
            'X-Content-Type-Options': 'nosniff',
            'Content-Disposition': 'inline',
            'Referrer-Policy': 'no-referrer',
          },
        });
      }
    }

    // Default Browser Fallback
    return NextResponse.json({
      fallbackWebSpeech: true,
      text: storedResponse.text,
      voiceName: 'Maya (Browser voice fallback)',
    });
  } catch (error) {
    return NextResponse.json(
      { fallbackWebSpeech: true, error: 'TTS generation failed' },
      { status: 500 }
    );
  }
}
