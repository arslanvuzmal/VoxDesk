import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/demo/session";
import { generateAgentTTS } from "@/lib/providers/elevenlabs-tts.server";

export async function POST(req: NextRequest) {
  try {
    const cookieToken = req.cookies.get("voxdesk_demo_session")?.value;
    const session = verifySessionToken(cookieToken || "");

    if (!session) {
      return NextResponse.json({ error: "Session expired or invalid" }, { status: 401 });
    }

    const body = await req.json();
    const text = (body.spokenReply || "").slice(0, 350);

    if (!text) {
      return NextResponse.json({ error: "No text provided for TTS" }, { status: 400 });
    }

    const result = await generateAgentTTS(text);

    if (result.fallbackWebSpeech || !result.audioBuffer) {
      return NextResponse.json({
        fallbackWebSpeech: true,
        text: text,
        voiceName: "Maya (Browser Fallback)",
      });
    }

    return new NextResponse(new Uint8Array(result.audioBuffer), {
      headers: {
        "Content-Type": result.mimeType,
        "Content-Length": result.audioBuffer.length.toString(),
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    return NextResponse.json({ fallbackWebSpeech: true, error: "TTS generation failed" });
  }
}
