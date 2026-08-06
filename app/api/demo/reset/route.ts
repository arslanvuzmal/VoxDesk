import { NextRequest, NextResponse } from "next/server";
import { demoSessionStore } from "@/lib/demo/store";
import { env } from "@/lib/config/env";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const secretKey =
      env.INTERNAL_API_SECRET ||
      "c789123456789abcdef0123456789abcdef0123456789abcdef0123456789abc";

    // In local dev or demo mode, allow reset
    const isAllowed =
      process.env.NODE_ENV !== "production" ||
      env.DEMO_MODE === "true" ||
      authHeader === `Bearer ${secretKey}`;

    if (!isAllowed) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid administrative secret." },
        { status: 401 },
      );
    }

    // Reset rate limits and active session store
    await demoSessionStore.clearAllSessions();

    return NextResponse.json({
      success: true,
      message:
        "Demo session limits, cooldowns, and active session counters cleared.",
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to reset demo store.", message: error?.message },
      { status: 500 },
    );
  }
}
