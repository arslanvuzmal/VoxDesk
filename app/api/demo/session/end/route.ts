import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/demo/session";

export async function POST(req: NextRequest) {
  const cookieToken = req.cookies.get("voxdesk_demo_session")?.value;
  const session = verifySessionToken(cookieToken || "");

  const callId = `demo_call_${Math.floor(100000 + Math.random() * 900000)}`;
  const activityId = `demo_act_${Math.floor(100000 + Math.random() * 900000)}`;

  const response = NextResponse.json({
    success: true,
    summary: {
      callId,
      crmActivityId: activityId,
      workspaceName: "Northstar Legal Consultations",
      durationSeconds: session ? Math.min(180, Math.floor((Date.now() - session.createdAt) / 1000)) : 120,
      turnsCompleted: session ? session.turnsUsed : 4,
      outcome: "Appointment Booked & CRM Record Synced",
      keyPoints: [
        "Inbound enquiry answered by Receptionist Maya",
        "Caller requested consultation for commercial legal dispute",
        "Real-time Google Calendar slot confirmed for Tuesday 10:00 AM",
        "BANT qualification score calculated as HOT (85/100)",
        "HubSpot CRM contact activity logged",
      ],
      nextAction: "Send automated email reminder 24h prior to appointment",
    },
  });

  response.cookies.delete("voxdesk_demo_session");
  return response;
}
