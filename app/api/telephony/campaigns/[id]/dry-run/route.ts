import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { requireCampaignAccess } from '@/lib/auth/require-campaign';
import { getCampaignReadiness } from '@/lib/telephony/outbound/campaign-readiness';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const access = await requireCampaignAccess(req, id, 'campaigns:manage');
    if ('errorResponse' in access) return access.errorResponse;

    const readiness = await getCampaignReadiness(id, access.workspaceId);
    if (!readiness)
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Campaign was not found.' } },
        { status: 404 }
      );

    const updated = await prisma.campaign.update({
      where: { id },
      data: {
        dryRunCompleted: true,
        dryRunReport: readiness.report,
      },
    });

    return NextResponse.json({ data: { campaign: updated, report: readiness.report } });
  } catch (error) {
    console.error('[CAMPAIGN DRY-RUN ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
