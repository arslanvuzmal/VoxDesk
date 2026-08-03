import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/demo/session";

export async function POST(req: NextRequest) {
  const cookieToken = req.cookies.get("voxdesk_demo_session")?.value;
  const session = verifySessionToken(cookieToken || "");

  if (!session) {
    return NextResponse.json({ error: "Session expired or invalid" }, { status: 401 });
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      available: false,
      mode: "browser_speech_recognition",
      message: "ElevenLabs API key not configured. Using browser Web Speech STT fallback.",
    });
  }

  try {
    const res = await fetch("https://api.elevenlabs.io/v1/single-use-tokens/scribe", {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      return NextResponse.json({
        available: false,
        mode: "browser_speech_recognition",
        message: "Could not issue single-use STT token. Using browser Web Speech STT fallback.",
      });
    }

    const data = await res.json();
    return NextResponse.json({
      available: true,
      token: data.token,
      model: process.env.ELEVENLABS_STT_MODEL || "scribe_v2_realtime",
    });
  } catch (error) {
    return NextResponse.json({
      available: false,
      mode: "browser_speech_recognition",
      message: "Network error requesting STT token. Using browser Web Speech STT fallback.",
    });
  }
}
