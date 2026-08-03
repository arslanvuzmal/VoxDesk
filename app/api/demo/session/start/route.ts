import { NextRequest, NextResponse } from "next/server";
import { createDemoSession } from "@/lib/demo/session";
import { validateSessionEligibility } from "@/lib/demo/rate-limit";
import { generateIPHash } from "@/lib/demo/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
    const ua = req.headers.get("user-agent") || "unknown-ua";
    const ipHash = generateIPHash(ip);

    // Validate eligibility & rate limits
    const eligibility = await validateSessionEligibility(ipHash);
    if (!eligibility.eligible) {
      return NextResponse.json(
        {
          error: eligibility.reason,
          code: eligibility.code,
        },
        { status: 429 },
      );
    }

    const body = await req.json();
    const scenario = body.scenario || "BOOKING";

    const { token, session } = await createDemoSession(scenario, ip, ua);

    const response = NextResponse.json({
      success: true,
      sessionId: session.sessionId,
      scenario: session.scenario,
      expiresAt: session.expiresAt,
      maxTurns: session.maxTurns,
    });

    response.cookies.set("voxdesk_demo_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 180,
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to initialize demo session." },
      { status: 500 },
    );
  }
}
