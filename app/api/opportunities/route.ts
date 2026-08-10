import { NextRequest, NextResponse } from 'next/server';
import { OpportunityStage } from '@prisma/client';
import { prisma } from '@/lib/database';
import { requireWorkspaceAccess } from '@/lib/auth/require-session';

export async function GET(request: NextRequest) {
  const correlationId = crypto.randomUUID();
  const workspace = await requireWorkspaceAccess(request, undefined, 'calls:view');
  if ('errorResponse' in workspace) return workspace.errorResponse;

  const requestedStage = new URL(request.url).searchParams.get('stage');
  if (
    requestedStage &&
    !Object.values(OpportunityStage).includes(requestedStage as OpportunityStage)
  ) {
    return NextResponse.json(
      { error: { code: 'VALIDATION', message: 'Opportunity stage is invalid.', correlationId } },
      { status: 400 }
    );
  }

  try {
    const opportunities = await prisma.opportunity.findMany({
      where: {
        workspaceId: workspace.workspaceId,
        stage: requestedStage ? (requestedStage as OpportunityStage) : undefined,
      },
      orderBy: { updatedAt: 'desc' },
      take: 100,
      select: {
        id: true,
        title: true,
        serviceInterest: true,
        stage: true,
        confidence: true,
        recommendation: true,
        ownerId: true,
        updatedAt: true,
        contact: { select: { id: true, name: true, company: true } },
        sourceConversation: { select: { id: true, channel: true, direction: true } },
      },
    });
    return NextResponse.json({ data: opportunities, meta: { correlationId } });
  } catch {
    return NextResponse.json(
      {
        error: {
          code: 'DATABASE_UNAVAILABLE',
          message: 'Opportunity data is temporarily unavailable.',
          correlationId,
        },
      },
      { status: 503 }
    );
  }
}
