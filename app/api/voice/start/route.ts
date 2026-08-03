import { NextRequest, NextResponse } from "next/server";
import { getVoiceProvider } from "@/lib/voice/providers/factory";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const provider = getVoiceProvider(body.provider || "DEMO");

    const record = await provider.startCall({
      workspaceId: body.workspaceId || "northstar-legal-ws",
      agentId: body.agentId || "agent-maya",
      callerNumber: body.callerNumber || "+1 (555) 019-2834",
      callerName: body.callerName || "Sarah Miller",
      scenarioId: body.scenarioId,
    });

    return NextResponse.json({
      success: true,
      call: record,
      message: "Call session initiated successfully",
    });
  } catch (error) {
    console.error("Voice Start API Error:", error);
    return NextResponse.json({ error: "Failed to initiate call session" }, { status: 500 });
  }
}
