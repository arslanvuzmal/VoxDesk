import { NextRequest, NextResponse } from "next/server";
import { getDemoSessionFromCookieToken } from "@/lib/demo/session";
import { demoSessionStore } from "@/lib/demo/store";
import { isCloudflareAIEnabled } from "@/lib/providers/cloudflare/client.server";
import { env } from "@/lib/config/env";

export async function POST(req: NextRequest) {
  try {
    const cookieToken = req.cookies.get("voxdesk_demo_session")?.value;
    if (!cookieToken) {
      return NextResponse.json(
        { error: "Missing session cookie" },
        { status: 401 },
      );
    }

    const session = await getDemoSessionFromCookieToken(cookieToken);
    if (!session) {
      return NextResponse.json(
        { error: "Session expired or invalid" },
        { status: 401 },
      );
    }

    // Check kill switches
    if (
      env.DEMO_LIVE_PROVIDER_KILL_SWITCH === "true" ||
      env.CLOUDFLARE_AI_KILL_SWITCH === "true"
    ) {
      return NextResponse.json({
        fallbackWebSpeech: true,
        reason: "The live provider demonstration is temporarily paused.",
      });
    }

    // Check active connection
    if (session.activeSTTConnection) {
      return NextResponse.json(
        {
          error: "Active STT connection already exists for this session.",
        },
        { status: 409 },
      );
    }

    // Update session active STT state
    await demoSessionStore.updateSession(session.sessionId, {
      activeSTTConnection: true,
      sttTokenIssuedAt: Date.now(),
    });

    if (isCloudflareAIEnabled()) {
      const res = NextResponse.json({
        provider: "cloudflare_flux",
        model: env.CLOUDFLARE_STT_MODEL || "@cf/deepgram/flux",
        fallbackWebSpeech: false,
      });
      res.headers.set("Cache-Control", "no-store, private");
      return res;
    }

    // Check ElevenLabs fallback
    const apiKey = env.ELEVENLABS_API_KEY;
    if (apiKey) {
      const response = await fetch(
        "https://api.elevenlabs.io/v1/single-use-tokens/scribe",
        {
          method: "POST",
          headers: {
            "xi-api-key": apiKey,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        const res = NextResponse.json({
          provider: "elevenlabs_scribe",
          token: data.token,
          fallbackWebSpeech: false,
        });
        res.headers.set("Cache-Control", "no-store, private");
        return res;
      }
    }

    // Browser SpeechRecognition fallback
    return NextResponse.json({
      provider: "browser_speech_recognition",
      fallbackWebSpeech: true,
      reason: "Live provider transcription not configured.",
    });
  } catch {
    return NextResponse.json({
      fallbackWebSpeech: true,
      reason: "Unexpected error during STT token generation.",
    });
  }
}
