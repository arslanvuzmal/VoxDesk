import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { requireCampaignAccess } from '@/lib/auth/require-campaign';
import { getCampaignReadiness } from '@/lib/telephony/outbound/campaign-readiness';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const access = await requireCampaignAccess(req, id, 'campaigns:approve');
    if ('errorResponse' in access) return access.errorResponse;

    const readiness = await getCampaignReadiness(id, access.workspaceId);
    const campaign = readiness?.campaign;

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if (campaign.approvalStatus === 'APPROVED') {
      return NextResponse.json({ error: 'Campaign already approved' }, { status: 400 });
    }

    if (campaign.approvalStatus !== 'PENDING_APPROVAL') {
      return NextResponse.json(
        { error: `Cannot approve from status: ${campaign.approvalStatus}` },
        { status: 400 }
      );
    }

    if (!campaign.dryRunCompleted) {
      return NextResponse.json(
        { error: { code: 'DRY_RUN_REQUIRED', message: 'Run campaign readiness before approval.' } },
        { status: 409 }
      );
    }
    if (!readiness || readiness.report.validRecipients === 0) {
      return NextResponse.json(
        {
          error: {
            code: 'NO_ELIGIBLE_RECIPIENTS',
            message: 'No recipients currently pass outbound controls.',
          },
          data: { report: readiness?.report },
        },
        { status: 409 }
      );
    }

    const updated = await prisma.campaign.update({
      where: { id },
      data: {
        approvalStatus: 'APPROVED',
        approvedBy: access.userId,
        approvedAt: new Date(),
        dryRunReport: readiness.report,
      },
    });

    return NextResponse.json({ data: { campaign: updated, report: readiness.report } });
  } catch (error) {
    console.error('[CAMPAIGN APPROVE ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

