import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/demo/session";

export async function GET(req: NextRequest) {
  const cookieToken = req.cookies.get("voxdesk_demo_session")?.value;
  const session = verifySessionToken(cookieToken || "");

  if (!session) {
    return NextResponse.json({ active: false, reason: "No active or valid session" });
  }

  const remainingMs = Math.max(0, session.expiresAt - Date.now());

  return NextResponse.json({
    active: true,
    sessionId: session.id,
    scenario: session.scenario,
    state: session.state,
    turnsRemaining: session.maxTurns - session.turnsUsed,
    remainingSeconds: Math.floor(remainingMs / 1000),
    hasElevenLabsKey: !!process.env.ELEVENLABS_API_KEY,
    hasOpenRouterKey: !!process.env.OPENROUTER_API_KEY,
  });
}
