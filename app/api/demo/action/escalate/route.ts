import { NextRequest, NextResponse } from "next/server";
import { getDemoSessionFromCookieToken } from "@/lib/demo/session";

export async function POST(req: NextRequest) {
  const cookieToken = req.cookies.get("voxdesk_demo_session")?.value;
  const session = cookieToken
    ? await getDemoSessionFromCookieToken(cookieToken)
    : null;

  if (!session) {
    return NextResponse.json(
      { error: "Session expired or invalid" },
      { status: 401 },
    );
  }

  const briefId = `demo_brief_${Math.floor(100000 + Math.random() * 900000)}`;

  return NextResponse.json({
    success: true,
    transferBrief: {
      id: briefId,
      workspaceId: "northstar-legal-ws",
      callerName: "Priya Shah",
      callerPhone: "+1 (***) ***-9921",
      reason:
        "Urgent partner consultation request regarding contract litigation",
      urgencyLevel: "HIGH",
      recommendedAction: "Call back within 15 minutes",
      assignedPartner: "Arslan Vuzmal Lone",
    },
  });
}
