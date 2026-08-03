import { NextRequest, NextResponse } from "next/server";
import { getDemoSessionFromCookieToken } from "@/lib/demo/session";
import { demoSessionStore } from "@/lib/demo/store";
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

    // Check kill switch
    if (env.DEMO_LIVE_PROVIDER_KILL_SWITCH === "true") {
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

    const apiKey = env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        fallbackWebSpeech: true,
        reason: "ElevenLabs API key not configured.",
      });
    }

    // Fetch single-use Scribe token from ElevenLabs API
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

    if (!response.ok) {
      return NextResponse.json({
        fallbackWebSpeech: true,
        reason: "ElevenLabs single-use token issuance failed.",
      });
    }

    const data = await response.json();
    const temporaryToken = data.token;

    // Update session state
    await demoSessionStore.updateSession(session.sessionId, {
      activeSTTConnection: true,
      sttTokenIssuedAt: Date.now(),
    });

    const res = NextResponse.json({
      token: temporaryToken,
      fallbackWebSpeech: false,
    });

    res.headers.set("Cache-Control", "no-store, private");
    return res;
  } catch {
    return NextResponse.json({
      fallbackWebSpeech: true,
      reason: "Unexpected error during STT token generation.",
    });
  }
}
