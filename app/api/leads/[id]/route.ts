import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    let lead: any = null;
    try {
      lead = await prisma.lead.findUnique({
        where: { id },
        include: {
          call: {
            include: {
              summary: true,
              transcriptSegments: {
                orderBy: { startMs: "asc" },
              },
              appointment: true,
            },
          },
        },
      });
    } catch {
      // Fallback
    }

    if (!lead) {
      lead = {
        id,
        name: "Sarah Jenkins",
        phoneEncrypted: "+1 (555) 234-5678",
        emailEncrypted: "s.jenkins@nexus.demo",
        company: "Nexus Enterprises",
        serviceInterest: "Corporate Litigation & Contract Dispute",
        score: 85,
        category: "HOT",
        status: "QUALIFIED",
        assignedTo: "Arslan Vuzmal Lone (Senior Partner)",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        qualificationBreakdown: [
          {
            criterion: "Retainer & Budget Fit",
            score: 30,
            weight: 30,
            evidence: "Stated commercial litigation budget >$15,000",
            collected: true,
          },
          {
            criterion: "Commercial / Case Substance",
            score: 30,
            weight: 30,
            evidence: "Substantial breach of contract partner dispute",
            collected: true,
          },
          {
            criterion: "Timeline & Court Deadlines",
            score: 25,
            weight: 25,
            evidence: "Filing deadline next Tuesday",
            collected: true,
          },
        ],
        missingInformation: ["Opposing Party Conflict Check Name"],
        recommendedNextAction:
          "Conduct emergency conflict of interest check and send strategy consultation invitation.",
        followUpPriority: "IMMEDIATE",
        call: {
          id: `call_${id}`,
          durationSeconds: 142,
          startedAt: new Date(Date.now() - 3600000).toISOString(),
          endedAt: new Date(Date.now() - 3458000).toISOString(),
          summary: {
            summary:
              "Caller Sarah Jenkins inquired regarding urgent breach of contract representation for partnership dispute. High urgency with court filing deadline next week.",
            intent: "Appointment Scheduling",
            sentiment: "concerned",
            urgency: "high",
            followUpRecommendation:
              "Schedule 45-minute partner consultation for Tuesday 10:00 AM EST.",
          },
          transcriptSegments: [
            {
              speaker: "agent",
              text: "Thank you for calling Northstar Legal Consultations. My name is Maya. How may I assist with your legal matter today?",
              startMs: 0,
              endMs: 5000,
            },
            {
              speaker: "caller",
              text: "Hi Maya, I need urgent legal advice regarding a partner breach of contract dispute.",
              startMs: 5500,
              endMs: 11200,
            },
            {
              speaker: "agent",
              text: "I understand how critical that is. I can reserve a strategy consultation with our senior partner for next Tuesday at 10:00 AM. Does that time work for you?",
              startMs: 11800,
              endMs: 18500,
            },
            {
              speaker: "caller",
              text: "Yes, Tuesday at 10:00 AM works perfectly. Please book it.",
              startMs: 19000,
              endMs: 23000,
            },
          ],
        },
      };
    }

    return NextResponse.json({
      success: true,
      lead,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch lead detail", details: error?.message },
      { status: 500 },
    );
  }
}
