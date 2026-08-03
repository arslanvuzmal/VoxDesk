import { NextRequest, NextResponse } from "next/server";
import { getDemoSessionFromCookieToken } from "@/lib/demo/session";
import { demoSessionStore } from "@/lib/demo/store";
import { isCloudflareAIEnabled } from "@/lib/providers/cloudflare/client.server";
import { generateCloudflareResponse } from "@/lib/providers/cloudflare/llm.server";
import { getDeterministicRoutineAnswer } from "@/lib/conversation/knowledge/northstar-legal";
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

      let spokenReply = "";
      let detectedIntent:
        "BOOKING" | "QUALIFICATION" | "ESCALATION" | "ROUTINE" | "UNKNOWN" =
        session.scenario;
      let conversationState = session.state;
      let extractedFields: Record<string, any> = {};
      let providerLabel = "Deterministic Knowledge Engine";
      let fallbackUsed = false;
      let actionTakenNotice: string | null = null;

      // 4. Check Routine Deterministic Matcher First
      const routineMatch = getDeterministicRoutineAnswer(transcript);

      if (routineMatch && session.scenario === "ROUTINE") {
        spokenReply = routineMatch.spokenReply;
        detectedIntent = "ROUTINE";
        conversationState = "ANSWERING_ROUTINE_QUESTION";
        providerLabel = "Approved Knowledge Engine";
      } else if (isCloudflareAIEnabled()) {
        // 5. Cloudflare Workers AI Primary LLM Provider
        try {
          const cfResult = await generateCloudflareResponse({
            userMessage: transcript,
            scenario: session.scenario,
            currentState: session.state,
            history: session.history || [],
          });

          spokenReply = cfResult.spokenReply;
          detectedIntent = cfResult.intent;
          conversationState = cfResult.suggestedState || session.state;
          extractedFields = cfResult.extractedFields || {};
          providerLabel = "Cloudflare Workers AI (@cf/moonshotai/kimi-k2.6)";

          if (cfResult.suggestedAction === "CONFIRM_DEMO_APPOINTMENT") {
            actionTakenNotice =
              "Fictional demo appointment reserved for Tuesday 10:00 AM in demo workspace.";
          } else if (cfResult.suggestedAction === "SCORE_LEAD") {
            actionTakenNotice =
              "BANT lead qualification evaluated. Category assigned: HOT.";
          } else if (cfResult.suggestedAction === "PREPARE_HANDOFF") {
            actionTakenNotice =
              "Urgent human handoff Transfer Brief generated for duty attorney.";
          }
        } catch (cfError) {
          console.warn("[CLOUDFLARE LLM FALLBACK]:", cfError);
          fallbackUsed = true;
        }
      }

      // 6. Secondary OpenRouter or Deterministic Fallback if Cloudflare not used or failed
      if (!spokenReply) {
        const turnResult = await generateAgentTurn(
          session.scenario,
          transcript,
          session.history || [],
        );

        spokenReply = turnResult.data.spokenReply;
        detectedIntent = turnResult.data.detectedIntent as any;
        conversationState = turnResult.data.conversationState;
        extractedFields = turnResult.data.extractedFields || {};
        fallbackUsed = true;
        providerLabel = turnResult.fallbackUsed
          ? "Deterministic conversation fallback"
          : "OpenRouter LLM";
      }

      // 7. Store Response ID Voucher for TTS
      const storedResponse = await demoSessionStore.storeResponseId(
        session.sessionId,
        spokenReply,
      );

      // 8. Record Usage Ledger
      await recordTurnUsage(
        session.sessionId,
        transcript.length,
        spokenReply.length,
        40,
        80,
      );

      // 9. Update Session History & State
      const updatedHistory = [
        ...(session.history || []),
        { role: "CALLER" as const, text: transcript },
        { role: "AGENT" as const, text: spokenReply },
      ].slice(-10);

      await demoSessionStore.updateSession(session.sessionId, {
        state: conversationState,
        turnsUsed: session.turnsUsed + 1,
        history: updatedHistory,
      });

      return NextResponse.json({
        success: true,
        responseId: storedResponse.responseId,
        spokenReply,
        detectedIntent,
        conversationState,
        extractedFields,
        shouldEnd: session.turnsUsed + 1 >= session.maxTurns,
        fallbackUsed,
        providerLabel,
        turnsRemaining: Math.max(0, session.maxTurns - (session.turnsUsed + 1)),
        actionTaken: actionTakenNotice,
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
        code: "PROVIDER_UNAVAILABLE",
        correlationId,
        recoverable: true,
      },
      { status: 500 },
    );
  }
}
