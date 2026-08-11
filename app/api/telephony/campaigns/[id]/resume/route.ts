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

    if (campaign.state !== 'PAUSED') {
      return NextResponse.json({ error: 'Campaign is not paused' }, { status: 400 });
    }

    const updated = await prisma.campaign.update({
      where: { id },
      data: {
        state: 'RUNNING',
        pausedAt: null,
      },
    });

    return NextResponse.json({ campaign: updated });
  } catch (error) {
    console.error('[CAMPAIGN RESUME ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
