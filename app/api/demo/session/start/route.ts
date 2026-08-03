import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createDemoSession, signSessionPayload } from "@/lib/demo/session";

const StartSessionSchema = z.object({
  scenario: z.enum(["BOOKING", "QUALIFICATION", "ESCALATION", "ROUTINE"]),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({ scenario: "BOOKING" }));
    const parsed = StartSessionSchema.safeParse(body);
    const scenario = parsed.success ? parsed.data.scenario : "BOOKING";

    const clientIP = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const session = createDemoSession(scenario, clientIP);
    const signedToken = signSessionPayload(session);

    const response = NextResponse.json({
      success: true,
      session: {
        id: session.id,
        scenario: session.scenario,
        state: session.state,
        maxTurns: session.maxTurns,
        expiresAt: session.expiresAt,
        durationSeconds: parseInt(process.env.DEMO_MAX_DURATION_SECONDS || "180", 10),
      },
    });

    response.cookies.set("voxdesk_demo_session", signedToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
      maxAge: 180,
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: "Failed to start demo session" }, { status: 500 });
  }
}
