import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { requireWorkspaceAccess } from '@/lib/auth/require-session';

function recordValue(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function configuredAgentId(value: unknown): string | null {
  const config = recordValue(value);
  return typeof config?.agentId === 'string' && config.agentId.length > 0 ? config.agentId : null;
}

function configuredString(value: unknown, key: string, fallback: string): string {
  const config = recordValue(value);
  const candidate = config?.[key];
  return typeof candidate === 'string' && candidate.trim() ? candidate.trim() : fallback;
}

function configuredSuiteIds(value: unknown): string[] {
  const requirements = recordValue(value);
  if (!Array.isArray(requirements?.suiteIds)) return [];
  return [
    ...new Set(
      requirements.suiteIds.filter(
        (suiteId): suiteId is string => typeof suiteId === 'string' && suiteId.length > 0
      )
    ),
  ];
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const correlationId = crypto.randomUUID();
  const access = await requireWorkspaceAccess(request, undefined, 'improvement:approve');
  if ('errorResponse' in access) return access.errorResponse;
  const { id } = await params;
  const proposal = await prisma.improvementProposal.findFirst({
    where: { id, workspaceId: access.workspaceId },
  });
  if (!proposal) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'Proposal not found.', correlationId } },
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
      meta: { correlationId },
    });
  }
  if (!['DRAFT', 'PENDING_REVIEW', 'AWAITING_APPROVAL'].includes(proposal.status)) {
    return NextResponse.json(
      {
        error: {
          code: 'CONFLICT',
          message: 'Proposal cannot be approved from its current state.',
          correlationId,
        },
      },
      { status: 409 }
    );
  }

  const agentId = configuredAgentId(proposal.changedConfig);
  const suiteIds = configuredSuiteIds(proposal.evaluationRequirements);
  if (!agentId || suiteIds.length === 0) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION',
          message: 'A target agent and at least one golden evaluation suite are required.',
          correlationId,
        },
      },
      { status: 400 }
    );
  }
  const [agent, suites] = await Promise.all([
    prisma.voiceAgent.findFirst({
      where: { id: agentId, workspaceId: access.workspaceId },
      include: { versions: { orderBy: { versionNumber: 'desc' }, take: 1 } },
    }),
    prisma.evaluationSuite.findMany({
      where: { id: { in: suiteIds }, workspaceId: access.workspaceId },
      select: { id: true },
    }),
  ]);
  if (!agent || suites.length !== suiteIds.length) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION',
          message: 'The target agent or one of its evaluation suites is unavailable.',
          correlationId,
        },
      },
      { status: 400 }
    );
  }
  const baseVersion = agent.versions[0];
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

      const candidateVersion = await tx.agentVersion.create({
        data: {
          agentId: agent.id,
          versionNumber: (baseVersion?.versionNumber || 0) + 1,
          greeting: configuredString(
            proposal.changedConfig,
            'greeting',
            baseVersion?.greeting || agent.greeting
          ),
          systemInstructions: configuredString(
            proposal.changedConfig,
            'systemInstructions',
            baseVersion?.systemInstructions || agent.systemInstructions
          ),
          voiceId: configuredString(
            proposal.changedConfig,
            'voiceId',
            baseVersion?.voiceId || agent.voiceId
          ),
        },
      });
      const candidate = await tx.deploymentCandidate.create({
        data: {
          workspaceId: access.workspaceId,
          agentId: agent.id,
          agentVersionId: candidateVersion.id,
          proposalId: proposal.id,
          status: 'CANDIDATE',
          evaluationSuiteIds: suiteIds,
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
          metadata: {
            candidateId: candidate.id,
            candidateVersionId: candidateVersion.id,
            evaluationSuiteIds: suiteIds,
          },
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
    data: { proposalId: proposal.id, candidateId: result.id, status: 'APPROVED' },
    meta: { correlationId },
  });
}
