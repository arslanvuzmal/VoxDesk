import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: { recipients: true },
    });

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

    const pendingRecipients = campaign.recipients.filter(
      r => r.status === 'PENDING' || r.status === 'QUEUED'
    );

    if (pendingRecipients.length === 0) {
      return NextResponse.json({ error: 'No pending recipients to call' }, { status: 400 });
    }

    const now = new Date();
    const updated = await prisma.campaign.update({
      where: { id },
      data: {
        state: 'RUNNING',
        startedAt: now,
        recipients: {
          updateMany: {
            where: { id: { in: pendingRecipients.map(r => r.id) } },
            data: { status: 'QUEUED' },
          },
        },
        attempts: {
          createMany: {
            data: pendingRecipients.map(r => ({
              workspaceId: campaign.workspaceId,
              campaignId: campaign.id,
              recipientId: r.id,
              direction: 'OUTBOUND',
              status: 'PENDING',
              attemptNumber: 1,
              startedAt: now,
            })),
            skipDuplicates: true,
          },
        },
      },
    });

    return NextResponse.json({ campaign: updated });
  } catch (error) {
    console.error('[CAMPAIGN START ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
