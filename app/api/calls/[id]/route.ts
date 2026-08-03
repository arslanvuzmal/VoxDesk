import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  // Detailed call view structure
  return NextResponse.json({
    call: {
      id,
      workspaceId: "northstar-legal-ws",
      agentName: "Maya — Reception",
      provider: "DEMO",
      providerCallId: `demo-prov-${id}`,
      direction: "INBOUND",
      callerNumberMasked: "+1 (555) 019-2834",
      callerName: "Sarah Miller",
      status: "COMPLETED",
      startedAt: new Date(Date.now() - 3600 * 1000).toISOString(),
      endedAt: new Date(Date.now() - 3480 * 1000).toISOString(),
      durationSeconds: 120,
      recordingConsent: true,
      outcome: "APPOINTMENT_SCHEDULED",
      qualificationCategory: "HOT",
      qualificationScore: 85.0,
      estimatedCost: 0.08,
      summary: {
        summary: "Caller Sarah Miller booked a legal consultation appointment for next Tuesday at 2:00 PM EST.",
        intent: "Schedule Legal Consultation",
        sentiment: "positive",
        urgency: "high",
        actionItems: ["Dispatch calendar confirmation invite", "Sync lead record to HubSpot CRM"],
        commitments: ["Appointment confirmed for Tuesday 2:00 PM EST"],
        followUpRecommendation: "Send automated SMS reminder 24 hours prior to appointment slot.",
      },
      transcript: [
        { id: "t1", speaker: "agent", text: "Thank you for calling Northstar Legal Consultations. My name is Maya. How can I assist you today?", startMs: 0, endMs: 4000 },
        { id: "t2", speaker: "caller", text: "Hi, I need to book a legal consultation next Tuesday afternoon.", startMs: 4500, endMs: 8000 },
        { id: "t3", speaker: "agent", text: "I can certainly help with that! We have openings at 2:00 PM EST and 3:30 PM EST. Which works better?", startMs: 8500, endMs: 12000 },
        { id: "t4", speaker: "caller", text: "2:00 PM EST is perfect for me.", startMs: 12500, endMs: 14500 },
        { id: "t5", speaker: "agent", text: "Confirmed! I have booked your Legal Consultation for Tuesday at 2:00 PM EST. Have a wonderful day!", startMs: 15000, endMs: 18000 },
      ],
      events: [
        { id: "e1", eventType: "call.started", sequence: 1, occurredAt: new Date(Date.now() - 3600 * 1000).toISOString() },
        { id: "e2", eventType: "intent.recognized", sequence: 2, occurredAt: new Date(Date.now() - 3590 * 1000).toISOString() },
        { id: "e3", eventType: "calendar.availability_checked", sequence: 3, occurredAt: new Date(Date.now() - 3580 * 1000).toISOString() },
        { id: "e4", eventType: "appointment.confirmed", sequence: 4, occurredAt: new Date(Date.now() - 3550 * 1000).toISOString() },
        { id: "e5", eventType: "call.completed", sequence: 5, occurredAt: new Date(Date.now() - 3480 * 1000).toISOString() },
      ],
    },
  });
}
