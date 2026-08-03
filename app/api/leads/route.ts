import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const urgency = searchParams.get("urgency");

    const whereClause: any = {
      workspaceId: "ws_demo_default",
    };

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { company: { contains: search, mode: "insensitive" } },
        { serviceInterest: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category && category !== "ALL") {
      whereClause.category = category;
    }

    if (status && status !== "ALL") {
      whereClause.status = status;
    }

    if (urgency && urgency !== "ALL") {
      whereClause.urgency = urgency;
    }

    let leads = [];
    try {
      leads = await prisma.lead.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
          call: {
            include: {
              summary: true,
            },
          },
        },
      });
    } catch {
      // Fallback demo leads if local DB is offline or not seeded
      leads = [
        {
          id: "lead_demo_101",
          name: "Sarah Jenkins",
          company: "Nexus Enterprises",
          serviceInterest: "Corporate Litigation & Dispute",
          score: 85,
          category: "HOT",
          status: "QUALIFIED",
          urgency: "HIGH",
          assignedTo: "Partner On-Call",
          createdAt: new Date().toISOString(),
          call: {
            durationSeconds: 142,
            summary: {
              summary:
                "Caller requested urgent partnership dispute advice for contract filing next Tuesday.",
              sentiment: "concerned",
              followUpRecommendation:
                "Assign to Senior Partner for 10:00 AM strategy session.",
            },
          },
        },
        {
          id: "lead_demo_102",
          name: "Dr. Robert Vance",
          company: "Vance Dental Care",
          serviceInterest: "Preventative & Hygiene Checkup",
          score: 65,
          category: "WARM",
          status: "NEW",
          urgency: "MEDIUM",
          assignedTo: "Reception Queue",
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          call: {
            durationSeconds: 98,
            summary: {
              summary:
                "Inquired about insurance coverage for Delta Dental PPO and booked routine hygiene visit.",
              sentiment: "positive",
              followUpRecommendation:
                "Send confirmation SMS and insurance verification form.",
            },
          },
        },
        {
          id: "lead_demo_103",
          name: "Elena Rostova",
          company: "Urban Living Real Estate",
          serviceInterest: "Luxury Home Buyer Tour",
          score: 92,
          category: "HOT",
          status: "APPOINTMENT_SCHEDULED",
          urgency: "HIGH",
          assignedTo: "Marcus (Broker)",
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          call: {
            durationSeconds: 180,
            summary: {
              summary:
                "Pre-approved cash buyer seeking private tour of $1.8M suburban residence.",
              sentiment: "enthusiastic",
              followUpRecommendation:
                "Send showing confirmation and MLS disclosure packet.",
            },
          },
        },
      ];
    }

    return NextResponse.json({
      success: true,
      count: leads.length,
      leads,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch voice leads", details: error?.message },
      { status: 500 },
    );
  }
}
