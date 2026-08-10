import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { requireWorkspaceAccess } from '@/lib/auth/require-session';

function configuredAgentId(value: unknown): string | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const agentId = (value as Record<string, unknown>).agentId;
  return typeof agentId === 'string' && agentId.length > 0 ? agentId : null;
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const access = await requireWorkspaceAccess(request, undefined, 'improvement:approve');
  if ('errorResponse' in access) return access.errorResponse;
  const { id } = await params;
  const proposal = await prisma.improvementProposal.findFirst({
    where: { id, workspaceId: access.workspaceId },
  });
  if (!proposal) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'Proposal not found.' } },
      { status: 404 }
    );
  }
  if (proposal.decision === 'APPROVED' && proposal.deploymentCandidateId) {
    return NextResponse.json({
      data: {
        proposalId: proposal.id,
        candidateId: proposal.deploymentCandidateId,
        status: 'APPROVED',
      },
    });
  }
  if (!['DRAFT', 'PENDING_REVIEW', 'AWAITING_APPROVAL'].includes(proposal.status)) {
    return NextResponse.json(
      {
        error: { code: 'CONFLICT', message: 'Proposal cannot be approved from its current state.' },
      },
      { status: 409 }
    );
  }
  const agentId = configuredAgentId(proposal.changedConfig);
  if (!agentId) {
    return NextResponse.json(
      { error: { code: 'VALIDATION', message: 'Proposal has no persisted target agent.' } },
      { status: 400 }
    );
  }
  const agent = await prisma.voiceAgent.findFirst({
    where: { id: agentId, workspaceId: access.workspaceId },
    select: { id: true },
  });
  if (!agent) {
    return NextResponse.json(
      { error: { code: 'VALIDATION', message: 'Proposal target agent is unavailable.' } },
      { status: 400 }
    );
  }
  const result = await prisma
    .$transaction(async tx => {
      const claim = await tx.improvementProposal.updateMany({
        where: {
          id: proposal.id,
          workspaceId: access.workspaceId,
          status: { in: ['DRAFT', 'PENDING_REVIEW', 'AWAITING_APPROVAL'] },
          NOT: { decision: 'APPROVED' },
        },
        data: { status: 'APPROVING', reviewerId: access.userId },
      });
      if (claim.count !== 1) throw new Error('APPROVAL_CONFLICT');
      const candidate = await tx.deploymentCandidate.create({
        data: {
          workspaceId: access.workspaceId,
          agentId: agent.id,
          proposalId: proposal.id,
          status: 'CANDIDATE',
        },
      });
      await tx.improvementProposal.update({
        where: { id: proposal.id },
        data: {
          decision: 'APPROVED',
          decisionAt: new Date(),
          reviewerId: access.userId,
          deploymentCandidateId: candidate.id,
          status: 'APPROVED',
        },
      });
      await tx.auditLog.create({
        data: {
          workspaceId: access.workspaceId,
          userId: access.userId,
          action: 'IMPROVEMENT_APPROVED',
          entityType: 'IMPROVEMENT_PROPOSAL',
          entityId: proposal.id,
          metadata: { candidateId: candidate.id },
        },
      });
      return candidate;
    })
    .catch(error => {
      if (error instanceof Error && error.message === 'APPROVAL_CONFLICT') return null;
      throw error;
    });
  if (!result) {
    return NextResponse.json(
      { error: { code: 'CONFLICT', message: 'Proposal was already changed by another reviewer.' } },
      { status: 409 }
    );
  }
  return NextResponse.json({
    data: { proposalId: proposal.id, candidateId: result.id, status: 'APPROVED' },
  });
}
