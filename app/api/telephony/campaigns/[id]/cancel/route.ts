import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { requireCampaignAccess } from '@/lib/auth/require-campaign';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const access = await requireCampaignAccess(req, id, 'campaigns:execute');
    if ('errorResponse' in access) return access.errorResponse;

    const campaign = await prisma.campaign.findFirst({
      where: { id, workspaceId: access.workspaceId },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if (campaign.state === 'COMPLETED' || campaign.state === 'CANCELLED') {
      return NextResponse.json(
        { error: `Campaign already ${campaign.state.toLowerCase()}` },
        { status: 400 }
      );
    }

    const updated = await prisma.campaign.update({
      where: { id },
      data: {
        state: 'CANCELLED',
        cancelledAt: new Date(),
        recipients: {
          updateMany: {
            where: {
              campaignId: id,
              status: { in: ['PENDING', 'QUEUED', 'DIALING', 'RINGING'] },
            },
            data: { status: 'CANCELLED' },
          },
        },
        attempts: {
          updateMany: {
            where: {
              campaignId: id,
              status: { in: ['PENDING', 'QUEUED', 'DIALING', 'RINGING'] },
            },
            data: { status: 'CANCELLED', outcome: 'Campaign cancelled' },
          },
        },
      },
    });

    return NextResponse.json({ campaign: updated });
  } catch (error) {
    console.error('[CAMPAIGN CANCEL ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
