import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { requireCampaignAccess } from '@/lib/auth/require-campaign';
import { getCampaignReadiness } from '@/lib/telephony/outbound/campaign-readiness';
import { randomUUID } from 'node:crypto';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const access = await requireCampaignAccess(req, id, 'campaigns:execute');
    if ('errorResponse' in access) return access.errorResponse;

    const readiness = await getCampaignReadiness(id, access.workspaceId);
    const campaign = readiness?.campaign;

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if (campaign.approvalStatus !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Campaign must be approved before starting' },
        { status: 400 }
      );
    }

    if (campaign.state === 'RUNNING') {
      return NextResponse.json({ error: 'Campaign already running' }, { status: 400 });
    }

    if (campaign.state === 'COMPLETED' || campaign.state === 'CANCELLED') {
      return NextResponse.json(
        { error: `Cannot start campaign in state: ${campaign.state}` },
        { status: 400 }
      );
    }

    const eligibleIds = new Set(readiness?.report.eligibleRecipientIds ?? []);
    const pendingRecipients = campaign.recipients.filter(
      r => eligibleIds.has(r.id) && (r.status === 'PENDING' || r.status === 'QUEUED')
    );

    if (pendingRecipients.length === 0) {
      return NextResponse.json(
        {
          error: {
            code: 'NO_ELIGIBLE_RECIPIENTS',
            message: 'No pending recipients currently pass outbound controls.',
          },
          data: { report: readiness?.report },
        },
        { status: 409 }
      );
    }

    const correlationId = randomUUID();
    const updated = await prisma
      .$transaction(async tx => {
        const claimed = await tx.campaign.updateMany({
          where: {
            id,
            workspaceId: access.workspaceId,
            state: { notIn: ['RUNNING', 'COMPLETED', 'CANCELLED'] },
            approvalStatus: 'APPROVED',
          },
          data: { state: 'SCHEDULED', startedAt: null },
        });
        if (claimed.count !== 1) throw new Error('CAMPAIGN_START_CONFLICT');
        await tx.campaignRecipient.updateMany({
          where: {
            campaignId: id,
            workspaceId: access.workspaceId,
            id: { in: pendingRecipients.map(item => item.id) },
          },
          data: { status: 'QUEUED' },
        });
        for (const recipient of pendingRecipients) {
          const attemptNumber = recipient.attempts + 1;
          const attempt = await tx.outboundAttempt.create({
            data: {
              id: `campaign_attempt_${recipient.id}_${attemptNumber}`,
              workspaceId: campaign.workspaceId,
              campaignId: campaign.id,
              recipientId: recipient.id,
              direction: 'OUTBOUND',
              status: 'QUEUED',
              attemptNumber,
            },
          });
          await tx.backgroundJob.create({
            data: {
              workspaceId: campaign.workspaceId,
              type: 'OUTBOUND_CALL_EXECUTE',
              resourceType: 'OUTBOUND_ATTEMPT',
              resourceId: attempt.id,
              status: 'PENDING',
              maxAttempts: 3,
              correlationId,
            },
          });
        }
        await tx.auditLog.create({
          data: {
            workspaceId: campaign.workspaceId,
            userId: access.userId,
            action: 'CAMPAIGN_SCHEDULED',
            entityType: 'CAMPAIGN',
            entityId: campaign.id,
            metadata: { queuedRecipients: pendingRecipients.length, correlationId },
          },
        });
        return tx.campaign.findUniqueOrThrow({ where: { id } });
      })
      .catch(error => {
        if (error instanceof Error && error.message === 'CAMPAIGN_START_CONFLICT') return null;
        throw error;
      });

    if (!updated)
      return NextResponse.json(
        {
          error: {
            code: 'CONFLICT',
            message: 'Campaign state changed before execution was queued.',
          },
        },
        { status: 409 }
      );

    return NextResponse.json({
      data: { campaign: updated, queued: pendingRecipients.length, correlationId },
    });
  } catch (error) {
    console.error('[CAMPAIGN START ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

