import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function GET(req: NextRequest) {
  try {
    const workspaceId = 'ws_demo_default';

    try {
      const [totalCalls, callsWithDuration, leads, appointmentsCount] = await Promise.all([
        prisma.call.count({ where: { workspaceId } }),
        prisma.call.aggregate({
          where: { workspaceId },
          _sum: { durationSeconds: true },
        }),
        prisma.lead.findMany({
          where: { workspaceId },
          select: { category: true, score: true },
        }),
        prisma.appointment.count({ where: { workspaceId } }),
      ]);

      const totalDurationSeconds = callsWithDuration._sum.durationSeconds || 0;
      const hotLeads = leads.filter((l: any) => l.category === 'HOT').length;
      const warmLeads = leads.filter((l: any) => l.category === 'WARM').length;
      const reviewLeads = leads.filter((l: any) => l.category === 'REVIEW').length;
      const coldLeads = leads.filter((l: any) => l.category === 'COLD').length;

      const conversionRate =
        totalCalls > 0 ? Math.round((appointmentsCount / totalCalls) * 100) : 0;

      return NextResponse.json({
        success: true,
        metrics: {
          totalCalls,
          totalDurationSeconds,
          averageDurationSeconds:
            totalCalls > 0 ? Math.round(totalDurationSeconds / totalCalls) : 0,
          appointmentsBooked: appointmentsCount,
          leadsCreated: leads.length,
          conversionRate,
          leadCategories: {
            hot: hotLeads,
            warm: warmLeads,
            review: reviewLeads,
            cold: coldLeads,
          },
        },
      });
    } catch {
      return NextResponse.json(
        {
          success: false,
          code: 'DATABASE_UNAVAILABLE',
          message: 'Analytics data is temporarily unavailable.',
        },
        { status: 503 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        code: 'INTERNAL_ERROR',
        message: error?.message || 'Failed to calculate analytics',
      },
      { status: 500 }
    );
  }
}
