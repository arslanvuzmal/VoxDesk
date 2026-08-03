import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createDemoSession } from "@/lib/demo/session";
import {
  validateSessionEligibility,
  generateIPHash,
} from "@/lib/demo/rate-limit";
import { getDemoSessionStoreStatus } from "@/lib/demo/store";
import { env } from "@/lib/config/env";

const SessionStartSchema = z.object({
  scenario: z.enum(["BOOKING", "QUALIFICATION", "ESCALATION", "ROUTINE"]),
});

export async function POST(req: NextRequest) {
  const correlationId = `req_${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`;

  try {
    // 1. Check Redis Store Readiness in Production
    const storeStatus = getDemoSessionStoreStatus();
    if (!storeStatus.ready) {
      return NextResponse.json(
        {
          error: "The live demo is temporarily unavailable.",
          code: "DEMO_SESSION_STORE_UNAVAILABLE",
          correlationId,
          recoverable: false,
          guidedDemoUrl: "/demo/story",
        },
        { status: 503 },
      );
    }

    // 2. Check Global Kill Switch
    if (env.DEMO_LIVE_PROVIDER_KILL_SWITCH === "true") {
      return NextResponse.json(
        {
          error:
            "The live voice demo is currently undergoing scheduled maintenance. Please try our guided walkthrough.",
          code: "PROVIDER_KILL_SWITCH",
          correlationId,
          recoverable: false,
          guidedDemoUrl: "/demo/story",
        },
        { status: 503 },
      );
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
    const ua = req.headers.get("user-agent") || "unknown-ua";
    const ipHash = generateIPHash(ip);

    // 3. Rate Limit & Cooldown Validation
    const eligibility = await validateSessionEligibility(ipHash);
    if (!eligibility.eligible) {
      return NextResponse.json(
        {
          error: eligibility.reason,
          code: eligibility.code,
          correlationId,
          recoverable: true,
          guidedDemoUrl: "/demo/story",
        },
        { status: 429 },
      );
    }

    // 4. Validate Request Body
    const body = await req.json().catch(() => ({}));
    const parseResult = SessionStartSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error:
            "Invalid demo scenario. Allowed scenarios are BOOKING, QUALIFICATION, ESCALATION, or ROUTINE.",
          code: "INVALID_SCENARIO",
          correlationId,
          recoverable: true,
          guidedDemoUrl: "/demo/story",
        },
        { status: 400 },
      );
    }

    const scenario = parseResult.data.scenario;
    const { token, session } = await createDemoSession(scenario, ip, ua);

    const response = NextResponse.json({
      success: true,
      sessionId: session.sessionId,
      scenario: session.scenario,
      expiresAt: session.expiresAt,
      maxTurns: session.maxTurns,
      correlationId,
    });

    response.cookies.set("voxdesk_demo_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 180,
    });

    return response;
  } catch (error) {
    console.error(
      `[SESSION START ERROR] correlationId=${correlationId}:`,
      error,
    );
    return NextResponse.json(
      {
        error: "Failed to initialize demo session.",
        code: "SESSION_START_FAILED",
        correlationId,
        recoverable: true,
        guidedDemoUrl: "/demo/story",
      },
      { status: 500 },
    );
  }
}
