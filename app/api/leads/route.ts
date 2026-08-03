import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category");
    const status = searchParams.get("status");

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

    try {
      const leads = await prisma.lead.findMany({
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

      return NextResponse.json({
        success: true,
        count: leads.length,
        leads,
      });
    } catch {
      return NextResponse.json(
        {
          success: false,
          code: "DATABASE_UNAVAILABLE",
          message: "Lead data is temporarily unavailable.",
        },
        { status: 503 },
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        code: "INTERNAL_ERROR",
        message: error?.message || "Failed to fetch leads",
      },
      { status: 500 },
    );
  }
}
