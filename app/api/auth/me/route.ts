import { NextRequest, NextResponse } from "next/server";
import { validateSession, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    // Return demo user state if token absent for easy demo mode testing
    return NextResponse.json({
      user: {
        id: "demo-user-owner",
        name: "Arslan Vuzmal Lone",
        email: "owner@northstarlegal.com",
        activeWorkspaceId: "northstar-legal-ws",
        activeWorkspaceRole: "OWNER",
        demoMode: true,
      },
    });
  }

  const sessionUser = await validateSession(token);
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ user: sessionUser });
}
