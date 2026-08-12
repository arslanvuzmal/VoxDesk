import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuthUser } from '@/lib/auth/require-session';
import { prisma } from '@/lib/database';
import { hasPermission, type WorkspaceRole } from '@/lib/permissions';

const ApprovalDecisionSchema = z.object({
  decision: z.enum(['APPROVE', 'DENY']),
  comment: z.string().trim().max(1000).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const correlationId = crypto.randomUUID();
  const auth = await requireAuthUser(request);
  if ('errorResponse' in auth) return auth.errorResponse;

  const parsed = ApprovalDecisionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'VALIDATION', message: 'Invalid approval decision.', correlationId } },
      { status: 400 }
    );
  }

  const memberships = await prisma.workspaceMember.findMany({
    where: { userId: auth.user.userId },
    select: { workspaceId: true, role: true },
  });
  const authorizedWorkspaceIds = memberships
    .filter(member => hasPermission(member.role as WorkspaceRole, 'tools:approve'))
    .map(member => member.workspaceId);
  if (authorizedWorkspaceIds.length === 0) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'Resource not found.', correlationId } },
      { status: 404 }
    );
  }

  const { id } = await params;
  const approval = await prisma.toolApprovalRequest.findFirst({
    where: { id, workspaceId: { in: authorizedWorkspaceIds } },
    select: {
      id: true,
      workspaceId: true,
      conversationId: true,
      toolExecutionId: true,
      tool: true,
      status: true,
      expiresAt: true,
      policyVersion: true,
      riskLevel: true,
      riskScore: true,
      triggeredPolicyIds: true,
      reasonCodes: true,
    },
  });
  if (!approval) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'Resource not found.', correlationId } },
      { status: 404 }
    );
  }

  if (approval.expiresAt <= new Date()) {
    await prisma.toolApprovalRequest.updateMany({
      where: { id: approval.id, status: { in: ['PENDING', 'APPROVED'] } },
      data: { status: 'EXPIRED' },
    });
    return NextResponse.json(
      { error: { code: 'APPROVAL_EXPIRED', message: 'Approval request expired.', correlationId } },
      { status: 409 }
    );
  }
  if (approval.status !== 'PENDING') {
    return NextResponse.json(
      {
        error: {
          code: 'APPROVAL_ALREADY_DECIDED',
          message: 'Approval request has already been decided.',
          correlationId,
        },
      },
      { status: 409 }
    );
  }

  const nextStatus = parsed.data.decision === 'APPROVE' ? 'APPROVED' : 'DENIED';
  const updated = await prisma.$transaction(async tx => {
    const changed = await tx.toolApprovalRequest.updateMany({
      where: { id: approval.id, workspaceId: approval.workspaceId, status: 'PENDING' },
      data: {
        status: nextStatus,
        decidedAt: new Date(),
        decidedByUserId: auth.user.userId,
        decisionComment: parsed.data.comment,
      },
    });
    if (changed.count !== 1) return false;

    if (nextStatus === 'DENIED') {
      await tx.conversationToolExecution.updateMany({
        where: { id: approval.toolExecutionId, conversationId: approval.conversationId },
        data: { status: 'BLOCKED', errorCategory: 'POLICY_DENIED' },
      });
    }
    await tx.auditLog.create({
      data: {
        workspaceId: approval.workspaceId,
        userId: auth.user.userId,
        action: nextStatus === 'APPROVED' ? 'TOOL_APPROVAL_APPROVED' : 'TOOL_APPROVAL_DENIED',
        entityType: 'TOOL_APPROVAL_REQUEST',
        entityId: approval.id,
        metadata: {
          sessionId: approval.conversationId,
          tool: approval.tool,
          policyVersion: approval.policyVersion,
          riskLevel: approval.riskLevel,
          riskScore: approval.riskScore,
          triggeredPolicyIds: approval.triggeredPolicyIds,
          reasonCodes: approval.reasonCodes,
          correlationId,
        },
      },
    });
    return true;
  });

  if (!updated) {
    return NextResponse.json(
      {
        error: {
          code: 'APPROVAL_CONFLICT',
          message: 'Approval request changed while the decision was processed.',
          correlationId,
        },
      },
      { status: 409 }
    );
  }

  return NextResponse.json({
    data: {
      approvalRequestId: approval.id,
      status: nextStatus,
      executionRequired: nextStatus === 'APPROVED',
    },
    meta: { correlationId },
  });
}
