import { NextRequest, NextResponse } from "next/server";
import { getDemoSessionFromCookieToken } from "@/lib/demo/session";
import { demoSessionStore } from "@/lib/demo/store";
import { generateAgentTurn } from "@/lib/providers/openrouter.server";
import { checkAndRecordUsage, recordTurnUsage } from "@/lib/demo/usage-ledger";
import { withSessionLock } from "@/lib/demo/request-lock";

export async function POST(req: NextRequest) {
  const correlationId = `req_${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`;

  try {
    const cookieToken = req.cookies.get("voxdesk_demo_session")?.value;
    if (!cookieToken) {
      return NextResponse.json(
        {
          error: "Missing session cookie. Please start a demo session.",
          code: "MISSING_SESSION_COOKIE",
          correlationId,
          recoverable: false,
          guidedDemoUrl: "/demo/story",
        },
        { status: 401 },
      );
    }

    const session = await getDemoSessionFromCookieToken(cookieToken);
    if (!session) {
      return NextResponse.json(
        {
          error:
            "This short demo session ended. Start a new session to continue.",
          code: "SESSION_EXPIRED",
          correlationId,
          recoverable: false,
          guidedDemoUrl: "/demo/story",
        },
        { status: 401 },
      );
    }

    const body = await req.json().catch(() => ({}));
    const transcript = (body.transcript || "").trim().slice(0, 600);
    const clientTurnId = (
      body.clientTurnId ||
      `turn_${Date.now()}_${Math.random().toString(36).slice(2)}`
    ).slice(0, 64);

    if (!transcript) {
      return NextResponse.json(
        {
          error: "No transcript provided. Please speak or type your input.",
          code: "INVALID_TRANSCRIPT",
          correlationId,
          recoverable: true,
        },
        { status: 400 },
      );
    }

    // Process turn with session lock
    const result = await withSessionLock(session.sessionId, async () => {
      // 1. Idempotency Check
      const isDuplicate = await demoSessionStore.hasProcessedTurnId(
        session.sessionId,
        clientTurnId,
      );
      if (isDuplicate) {
        return NextResponse.json(
          {
            success: true,
            duplicateTurn: true,
            code: "DUPLICATE_TURN",
            message: "Turn ID already processed. Idempotent result returned.",
            correlationId,
          },
          { status: 409 },
        );
      }

      // 2. Usage Quotas & Limits
      const usageCheck = await checkAndRecordUsage(
        session.sessionId,
        transcript.length,
      );
      if (!usageCheck.allowed) {
        return NextResponse.json(
          {
            error: usageCheck.reason,
            code: "SESSION_LIMIT_REACHED",
            correlationId,
            recoverable: false,
            guidedDemoUrl: "/demo/story",
          },
          { status: 429 },
        );
      }

      // 3. Record Turn ID
      await demoSessionStore.recordTurnId(session.sessionId, clientTurnId);

      // 4. Generate Agent Turn with History
      const turnResult = await generateAgentTurn(
        session.scenario,
        transcript,
        session.history || [],
      );

      // 5. Store Response ID Voucher for TTS
      const storedResponse = await demoSessionStore.storeResponseId(
        session.sessionId,
        turnResult.data.spokenReply,
      );

      // 6. Record Usage Ledger
      await recordTurnUsage(
        session.sessionId,
        transcript.length,
        turnResult.data.spokenReply.length,
        turnResult.usage?.inputTokens || 40,
        turnResult.usage?.outputTokens || 80,
      );

      // 7. Update Session History & State
      const updatedHistory = [
        ...(session.history || []),
        { role: "CALLER" as const, text: transcript },
        { role: "AGENT" as const, text: turnResult.data.spokenReply },
      ].slice(-10);

      await demoSessionStore.updateSession(session.sessionId, {
        state: turnResult.data.conversationState,
        turnsUsed: session.turnsUsed + 1,
        history: updatedHistory,
      });

      // 8. Scenario Action Notice Generation
      let actionNotice: string | null = null;
      if (turnResult.data.suggestedAction === "CONFIRM_APPOINTMENT") {
        actionNotice =
          "Fictional demo appointment reserved for Tuesday 10:00 AM in demo workspace.";
      } else if (turnResult.data.suggestedAction === "QUALIFY_LEAD") {
        const cat = turnResult.data.extractedFields?.category || "HOT";
        actionNotice = `BANT lead qualification evaluated. Category assigned: ${cat}.`;
      } else if (turnResult.data.suggestedAction === "ESCALATE_HUMAN") {
        actionNotice =
          "Urgent human handoff Transfer Brief generated for duty attorney.";
      }

      return NextResponse.json({
        success: true,
        responseId: storedResponse.responseId,
        spokenReply: turnResult.data.spokenReply,
        detectedIntent: turnResult.data.detectedIntent,
        conversationState: turnResult.data.conversationState,
        extractedFields: turnResult.data.extractedFields,
        shouldEnd: turnResult.data.shouldEnd,
        fallbackUsed: turnResult.fallbackUsed,
        providerLabel: turnResult.fallbackUsed
          ? "Deterministic conversation fallback"
          : "OpenRouter LLM",
        turnsRemaining: Math.max(0, session.maxTurns - (session.turnsUsed + 1)),
        actionTaken: actionNotice,
        correlationId,
      });
    });

    return result;
  } catch (error: any) {
    if (error.message?.includes("CONCURRENT_REQUEST_BLOCKED")) {
      return NextResponse.json(
        {
          error:
            "Concurrent request blocked for session. Please wait a moment.",
          code: "CONCURRENT_REQUEST",
          correlationId,
          recoverable: true,
        },
        { status: 429 },
      );
    }

    console.error(
      `[RESPOND ROUTE ERROR] correlationId=${correlationId}:`,
      error,
    );
    return NextResponse.json(
      {
        error: "Failed to process conversation turn.",
        code: "OPENROUTER_UNAVAILABLE",
        correlationId,
        recoverable: true,
      },
      { status: 500 },
    );
  }
}
