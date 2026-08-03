import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifySessionToken, signSessionPayload } from "@/lib/demo/session";
import { generateControlledLLMResponse } from "@/lib/providers/openrouter.server";

const TurnInputSchema = z.object({
  transcript: z.string().min(1).max(600),
  clientTurnId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const cookieToken = req.cookies.get("voxdesk_demo_session")?.value;
    const session = verifySessionToken(cookieToken || "");

    if (!session) {
      return NextResponse.json({ error: "Session expired or quota exceeded" }, { status: 401 });
    }

    if (session.turnsUsed >= session.maxTurns) {
      return NextResponse.json({
        turnId: `turn_${Date.now()}`,
        spokenReply: "This demonstration call has reached its 6-turn limit. Thank you for testing VoxDesk AI!",
        conversationState: "CLOSING",
        detectedIntent: "COMPLETE",
        collectedFields: {},
        action: {
          type: "COMPLETE",
          status: "COMPLETED",
          displayMessage: "Call complete",
        },
        shouldEnd: true,
      });
    }

    const body = await req.json();
    const parsedInput = TurnInputSchema.safeParse(body);

    if (!parsedInput.success) {
      return NextResponse.json({ error: "Invalid transcript input" }, { status: 400 });
    }

    const transcript = parsedInput.data.transcript;
    const llmResult = await generateControlledLLMResponse(
      transcript,
      session.scenario,
      session.state,
      {}
    );

    session.turnsUsed += 1;
    session.state = llmResult.suggestedState || "RESPONDING";
    session.userCharCount += transcript.length;
    session.agentCharCount += llmResult.spokenReply.length;

    const updatedCookie = signSessionPayload(session);

    let actionType = llmResult.suggestedAction;
    let actionDisplayMessage = "No business action required";

    if (actionType === "CHECK_CALENDAR") {
      actionDisplayMessage = "Checked Google Calendar availability: Tuesday 10:00 AM available";
    } else if (actionType === "QUALIFY_LEAD") {
      actionDisplayMessage = "BANT qualification calculated: HOT (85/100)";
    } else if (actionType === "ESCALATE") {
      actionDisplayMessage = "Transfer Briefing created for priority human partner handoff";
    }

    const response = NextResponse.json({
      turnId: `turn_${Date.now()}`,
      spokenReply: llmResult.spokenReply,
      conversationState: session.state,
      detectedIntent: llmResult.intent,
      collectedFields: llmResult.extractedFields || {},
      action: {
        type: actionType,
        status: "COMPLETED",
        displayMessage: actionDisplayMessage,
      },
      shouldEnd: session.turnsUsed >= session.maxTurns || llmResult.suggestedAction === "COMPLETE",
    });

    response.cookies.set("voxdesk_demo_session", updatedCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
      maxAge: 180,
    });

    return response;
  } catch (error) {
    console.error("Demo respond endpoint error:", error);
    return NextResponse.json({ error: "Failed to generate conversation response" }, { status: 500 });
  }
}
