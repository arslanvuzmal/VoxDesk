import { NextRequest, NextResponse } from "next/server";
import { getDemoSessionFromCookieToken } from "@/lib/demo/session";

export async function GET(req: NextRequest) {
  const cookieToken = req.cookies.get("voxdesk_demo_session")?.value;
  const session = cookieToken
    ? await getDemoSessionFromCookieToken(cookieToken)
    : null;

  if (!session) {
    return NextResponse.json({
      active: false,
      reason: "Session expired or invalid",
    });
  }

  const secondsRemaining = Math.max(
    0,
    Math.floor((session.expiresAt - Date.now()) / 1000),
  );
  const turnsRemaining = Math.max(0, session.maxTurns - session.turnsUsed);

  return NextResponse.json({
    active: true,
    sessionId: session.sessionId,
    scenario: session.scenario,
    state: session.state,
    turnsUsed: session.turnsUsed,
    turnsRemaining,
    secondsRemaining,
    completed: session.completed,
  });
}
