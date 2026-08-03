import { NextRequest, NextResponse } from "next/server";
import { getDemoSessionFromCookieToken } from "@/lib/demo/session";
import { demoSessionStore } from "@/lib/demo/store";
import { prisma } from "@/lib/database";
import { env } from "@/lib/config/env";

export async function POST(req: NextRequest) {
  try {
    const cookieToken = req.cookies.get("voxdesk_demo_session")?.value;
    const session = cookieToken
      ? await getDemoSessionFromCookieToken(cookieToken)
      : null;

    const callId = `demo_call_${Math.floor(100000 + Math.random() * 900000)}`;
    const activityId = `demo_act_${Math.floor(100000 + Math.random() * 900000)}`;
    const duration = session
      ? Math.min(180, Math.floor((Date.now() - session.createdAt) / 1000))
      : 120;
    const turns = session ? session.turnsUsed : 4;

    const scenario = session?.scenario || "BOOKING";

    let businessOutcome = "Inbound Enquiry Completed";
    let keyPoints: string[] = [];
    let appointmentData = null;
    let leadData = null;
    let escalationData = null;

    if (scenario === "BOOKING") {
      businessOutcome = "Demo Consultation Confirmed & Calendar Reserved";
      keyPoints = [
        "Inbound enquiry answered by Receptionist Maya",
        "Caller requested consultation for legal matter",
        "Fictional Demo Calendar slot reserved for Tuesday 10:00 AM",
        "Demo CRM activity record created",
      ];
      appointmentData = {
        id: `apt_${callId}`,
        callerName: "Sarah Miller",
        service: "Legal Consultation",
        startTime: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
        status: "CONFIRMED",
      };
    } else if (scenario === "QUALIFICATION") {
      businessOutcome = "Lead BANT Score Calculated as HOT (85/100)";
      keyPoints = [
        "Inbound commercial enquiry answered by Maya",
        "Assessed budget ($10k-$25k), timeline (Immediate), and authority",
        "BANT qualification score: HOT (85/100)",
        "Demo CRM lead contact created",
      ];
      leadData = {
        id: `lead_${callId}`,
        name: "David Vance",
        company: "Vance Enterprises",
        score: 85,
        category: "HOT",
      };
    } else if (scenario === "ESCALATION") {
      businessOutcome = "Urgent Partner Transfer Brief Created";
      keyPoints = [
        "Urgent inbound call flagged regarding contract litigation",
        "Generated Senior Partner Brief for Arslan Vuzmal Lone",
        "Callback task scheduled within 15 minutes",
      ];
      escalationData = {
        id: `esc_${callId}`,
        urgency: "HIGH",
        reason: "Contract litigation emergency",
        assignedPartner: "Arslan Vuzmal Lone",
      };
    } else {
      businessOutcome = "Approved Business Knowledge Answered";
      keyPoints = [
        "Routine enquiry answered from approved knowledge base",
        "Business opening hours and consultation options provided",
      ];
    }

    // Persist records to database if database is connected
    try {
      if (prisma) {
        const workspace = await prisma.workspace.findFirst();
        const agent = workspace
          ? await prisma.voiceAgent.findFirst({
              where: { workspaceId: workspace.id },
            })
          : null;

        if (workspace && agent) {
          const createdCall = await prisma.call.create({
            data: {
              workspaceId: workspace.id,
              agentId: agent.id,
              provider: "DEMO",
              callerNumberMasked: "+1 (555) ***-9921",
              callerName:
                appointmentData?.callerName || leadData?.name || "Demo Caller",
              durationSeconds: duration,
              outcome:
                scenario === "BOOKING"
                  ? "APPOINTMENT_SCHEDULED"
                  : scenario === "QUALIFICATION"
                    ? "LEAD_QUALIFIED"
                    : scenario === "ESCALATION"
                      ? "ESCALATED_HUMAN"
                      : "QUESTION_ANSWERED",
              qualificationCategory: leadData ? "HOT" : "WARM",
              qualificationScore: leadData ? 85 : 70,
            },
          });

          await prisma.callSummary.create({
            data: {
              callId: createdCall.id,
              summary: keyPoints.join(". "),
              intent: scenario,
              sentiment: "positive",
              urgency: scenario === "ESCALATION" ? "high" : "medium",
              actionItems: keyPoints,
              commitments: ["Send confirmation notice"],
            },
          });

          if (appointmentData) {
            await prisma.appointment.create({
              data: {
                workspaceId: workspace.id,
                callId: createdCall.id,
                callerName: appointmentData.callerName,
                service: appointmentData.service,
                startTime: new Date(appointmentData.startTime),
                endTime: new Date(
                  new Date(appointmentData.startTime).getTime() +
                    30 * 60 * 1000,
                ),
                status: "CONFIRMED",
              },
            });
          }

          if (leadData) {
            await prisma.lead.create({
              data: {
                workspaceId: workspace.id,
                callId: createdCall.id,
                name: leadData.name,
                company: leadData.company,
                score: leadData.score,
                category: "HOT",
                status: "NEW",
              },
            });
          }

          await prisma.cRMActivity.create({
            data: {
              workspaceId: workspace.id,
              activityType: "CALL_LOG",
              details: {
                scenario,
                duration,
                turns,
                keyPoints,
              },
            },
          });
        }
      }
    } catch {
      // Database write error handled gracefully
    }

    if (session) {
      await demoSessionStore.endSession(session.sessionId, "CALL_COMPLETED");
    }

    const response = NextResponse.json({
      success: true,
      summary: {
        callId,
        crmActivityId: activityId,
        workspaceName: "Northstar Legal Consultations",
        durationSeconds: duration,
        turnsCompleted: turns,
        scenario,
        problemPresented:
          scenario === "BOOKING"
            ? "After-hours consultation booking"
            : scenario === "QUALIFICATION"
              ? "Unqualified lead intake"
              : scenario === "ESCALATION"
                ? "Urgent partner handoff"
                : "Routine question Q&A",
        businessOutcome,
        keyPoints,
        appointment: appointmentData,
        lead: leadData,
        escalation: escalationData,
        providerModes: {
          stt:
            env.ELEVENLABS_API_KEY &&
            env.DEMO_LIVE_PROVIDER_KILL_SWITCH !== "true"
              ? "ElevenLabs Scribe Realtime"
              : "Browser Web Speech",
          llm:
            env.OPENROUTER_API_KEY &&
            env.DEMO_LIVE_PROVIDER_KILL_SWITCH !== "true"
              ? `OpenRouter (${env.OPENROUTER_MODEL})`
              : "Deterministic Fallback",
          tts:
            env.ELEVENLABS_API_KEY &&
            env.DEMO_LIVE_PROVIDER_KILL_SWITCH !== "true"
              ? "ElevenLabs Flash TTS"
              : "Browser Web Speech",
        },
      },
    });

    response.cookies.delete("voxdesk_demo_session");
    return response;
  } catch {
    return NextResponse.json(
      { error: "Failed to end demo session." },
      { status: 500 },
    );
  }
}
