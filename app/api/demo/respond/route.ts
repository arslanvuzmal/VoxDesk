import { NextRequest, NextResponse } from "next/server";
import { getDemoSessionFromCookieToken } from "@/lib/demo/session";
import { demoSessionStore } from "@/lib/demo/store";
import { generateAgentTurn } from "@/lib/providers/openrouter.server";
import { checkAndRecordUsage, recordTurnUsage } from "@/lib/demo/usage-ledger";
import { withSessionLock } from "@/lib/demo/request-lock";

export async function POST(req: NextRequest) {
  try {
    const cookieToken = req.cookies.get("voxdesk_demo_session")?.value;
    if (!cookieToken) {
      return NextResponse.json(
        { error: "Missing session cookie" },
        { status: 401 },
      );
    }

    const session = await getDemoSessionFromCookieToken(cookieToken);
    if (!session) {
      return NextResponse.json(
        { error: "Session expired or invalid" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const transcript = (body.transcript || "").trim().slice(0, 600);
    const clientTurnId = (
      body.clientTurnId ||
      `turn_${Date.now()}_${Math.random().toString(36).slice(2)}`
    ).slice(0, 64);

    if (!transcript) {
      return NextResponse.json(
        { error: "No transcript provided" },
        { status: 400 },
      );
    }

    // Process turn with session lock
    const result = await withSessionLock(session.sessionId, async () => {
      // Check duplicate turn ID
      const isDuplicate = await demoSessionStore.hasProcessedTurnId(
        session.sessionId,
        clientTurnId,
      );
      if (isDuplicate) {
        return NextResponse.json(
          {
            duplicateTurn: true,
            message: "Turn ID already processed. Idempotent result returned.",
          },
          { status: 409 },
        );
      }

      // Check quotas
      const usageCheck = await checkAndRecordUsage(
        session.sessionId,
        transcript.length,
      );
      if (!usageCheck.allowed) {
        return NextResponse.json({ error: usageCheck.reason }, { status: 429 });
      }

      // Record Turn ID
      await demoSessionStore.recordTurnId(session.sessionId, clientTurnId);

      // Generate Agent Turn
      const turnResult = await generateAgentTurn(session.scenario, transcript);

      // Store Response ID Voucher for TTS
      const storedResponse = await demoSessionStore.storeResponseId(
        session.sessionId,
        turnResult.data.spokenReply,
      );

      // Record Usage
      await recordTurnUsage(
        session.sessionId,
        transcript.length,
        turnResult.data.spokenReply.length,
        turnResult.usage?.inputTokens || 40,
        turnResult.usage?.outputTokens || 80,
      );

      // Update State in Session Store
      await demoSessionStore.updateSession(session.sessionId, {
        state: turnResult.data.conversationState,
      });

      let actionNotice = null;
      if (turnResult.data.suggestedAction === "CONFIRM_APPOINTMENT") {
        actionNotice =
          "Google Calendar availability verified. Fictional appointment reserved for Tuesday 10:00 AM.";
      } else if (turnResult.data.suggestedAction === "QUALIFY_LEAD") {
        actionNotice = "BANT qualification processed. Category: HOT (85/100).";
      } else if (turnResult.data.suggestedAction === "ESCALATE_HUMAN") {
        actionNotice =
          "Urgent Partner Transfer Brief created for Arslan Vuzmal Lone.";
      }

      return NextResponse.json({
        responseId: storedResponse.responseId,
        spokenReply: turnResult.data.spokenReply,
        detectedIntent: turnResult.data.detectedIntent,
        conversationState: turnResult.data.conversationState,
        extractedFields: turnResult.data.extractedFields,
        shouldEnd: turnResult.data.shouldEnd,
        fallbackUsed: turnResult.fallbackUsed,
        action: actionNotice
          ? {
              displayMessage: actionNotice,
              type: turnResult.data.suggestedAction,
            }
          : null,
      });
    });

    return result;
  } catch (error: any) {
    if (error.message?.includes("CONCURRENT_REQUEST_BLOCKED")) {
      return NextResponse.json(
        { error: "Concurrent request blocked for session." },
        { status: 429 },
      );
    }
    return NextResponse.json(
      { error: "Failed to process conversation turn." },
      { status: 500 },
    );
  }
}
