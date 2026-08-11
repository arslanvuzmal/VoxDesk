import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { requireWorkspaceAccess } from '@/lib/auth/require-session';

export async function GET(request: NextRequest) {
  const correlationId = crypto.randomUUID();
  const access = await requireWorkspaceAccess(request, undefined, 'analytics:view');
  if ('errorResponse' in access) return access.errorResponse;

  try {
    const [totalConversations, duration, opportunities, appointmentsCount] = await Promise.all([
      prisma.conversation.count({ where: { workspaceId: access.workspaceId } }),
      prisma.conversation.aggregate({
        where: { workspaceId: access.workspaceId },
        _sum: { durationSeconds: true },
      }),
      prisma.opportunity.findMany({
        where: { workspaceId: access.workspaceId },
        select: { stage: true },
      }),
      prisma.appointment.count({ where: { workspaceId: access.workspaceId } }),
    ]);
    const totalDurationSeconds = duration._sum.durationSeconds || 0;
    const stages = opportunities.reduce<Record<string, number>>((counts, opportunity) => {
      counts[opportunity.stage] = (counts[opportunity.stage] || 0) + 1;
      return counts;
    }, {});

    return NextResponse.json({
      data: {
        totalConversations,
        totalDurationSeconds,
        averageDurationSeconds:
          totalConversations > 0 ? Math.round(totalDurationSeconds / totalConversations) : 0,
        appointmentsBooked: appointmentsCount,
        opportunitiesCreated: opportunities.length,
        appointmentRate:
          totalConversations > 0
            ? Math.round((appointmentsCount / totalConversations) * 100)
            : null,
        opportunityStages: stages,
      },
      meta: { correlationId },
    });
  } catch {
    return NextResponse.json(
      {
        error: {
          code: 'DATABASE_UNAVAILABLE',
          message: 'Analytics data is temporarily unavailable.',
          correlationId,
        },
      },
      { status: 503 }
    );
  }
}
