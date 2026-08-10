import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/database';
import { requireWorkspaceAccess } from '@/lib/auth/require-session';

const RejectProposalSchema = z.object({
  reason: z.string().trim().min(10).max(2000),
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const correlationId = crypto.randomUUID();
  const access = await requireWorkspaceAccess(request, undefined, 'improvement:approve');
  if ('errorResponse' in access) return access.errorResponse;

  const parsed = RejectProposalSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION',
          message: 'A reviewer rationale of at least 10 characters is required.',
          correlationId,
        },
      },
      { status: 400 }
    );
  }

  const { id } = await params;
  const proposal = await prisma.improvementProposal.findFirst({
    where: { id, workspaceId: access.workspaceId },
    select: { id: true, status: true, decision: true },
  });
  if (!proposal) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'Proposal not found.', correlationId } },
      { status: 404 }
    );
  }
  if (proposal.decision === 'REJECTED') {
    return NextResponse.json({
      data: { proposalId: proposal.id, status: 'REJECTED' },
      meta: { correlationId },
    });
  }
  if (!['DRAFT', 'PENDING_REVIEW', 'AWAITING_APPROVAL'].includes(proposal.status)) {
    return NextResponse.json(
      {
        error: {
          code: 'CONFLICT',
          message: 'Proposal cannot be rejected from its current state.',
          correlationId,
        },
      },
      { status: 409 }
    );
  }

  const rejected = await prisma.$transaction(async tx => {
    const claim = await tx.improvementProposal.updateMany({
      where: {
        id: proposal.id,
        workspaceId: access.workspaceId,
        status: { in: ['DRAFT', 'PENDING_REVIEW', 'AWAITING_APPROVAL'] },
        NOT: { decision: { in: ['APPROVED', 'REJECTED'] } },
      },
      data: {
        status: 'REJECTED',
        decision: 'REJECTED',
        decisionAt: new Date(),
        reviewerId: access.userId,
      },
    });
    if (claim.count !== 1) return false;
    await tx.auditLog.create({
      data: {
        workspaceId: access.workspaceId,
        userId: access.userId,
        action: 'IMPROVEMENT_REJECTED',
        entityType: 'IMPROVEMENT_PROPOSAL',
        entityId: proposal.id,
        metadata: { reason: parsed.data.reason },
      },
    });
    return true;
  });

  if (!rejected) {
    return NextResponse.json(
      {
        error: {
          code: 'CONFLICT',
          message: 'Proposal was already changed by another reviewer.',
          correlationId,
        },
      },
      { status: 409 }
    );
  }
  return NextResponse.json({
    data: { proposalId: proposal.id, status: 'REJECTED' },
    meta: { correlationId },
  });
}
