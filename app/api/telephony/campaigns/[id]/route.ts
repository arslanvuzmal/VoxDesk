import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        recipients: {
          include: { outboundAttempts: true },
          orderBy: { createdAt: 'desc' },
        },
        attempts: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    return NextResponse.json({ campaign });
  } catch (error) {
    console.error('[CAMPAIGN GET ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const campaign = await prisma.campaign.update({
      where: { id },
      data: {
        name: body.name,
        workflowType: body.workflowType,
        agentId: body.agentId,
        agentVersionId: body.agentVersionId,
        language: body.language,
        callerId: body.callerId,
        targetSegment: body.targetSegment,
        callingWindowStart: body.callingWindowStart,
        callingWindowEnd: body.callingWindowEnd,
        timezoneStrategy: body.timezoneStrategy,
        maxAttempts: body.maxAttempts,
        retryIntervalMinutes: body.retryIntervalMinutes,
        concurrencyLimit: body.concurrencyLimit,
        callsPerMinute: body.callsPerMinute,
        approvalStatus: body.approvalStatus,
        dryRunCompleted: body.dryRunCompleted,
        dryRunReport: body.dryRunReport,
        openingDisclosure: body.openingDisclosure,
        state: body.state,
        pausedAt: body.state === 'PAUSED' ? new Date() : undefined,
        completedAt: body.state === 'COMPLETED' ? new Date() : undefined,
        cancelledAt: body.state === 'CANCELLED' ? new Date() : undefined,
        failedReason: body.failedReason,
      },
    });

    return NextResponse.json({ campaign });
  } catch (error) {
    console.error('[CAMPAIGN PATCH ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    await prisma.campaign.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[CAMPAIGN DELETE ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
