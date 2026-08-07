import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { featureFlags } from '@/lib/features/flags';

export async function GET(req: NextRequest) {
  try {
    const campaignsEnabled = await featureFlags.isEnabled('OUTBOUND_CAMPAIGNS_ENABLED');

    if (!campaignsEnabled) {
      return NextResponse.json(
        { error: 'Campaigns not enabled', code: 'FEATURE_DISABLED' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId');
    const state = searchParams.get('state');

    const where: any = {};
    if (workspaceId) where.workspaceId = workspaceId;
    if (state) where.state = state;

    const campaigns = await prisma.campaign.findMany({
      where,
      include: {
        _count: {
          select: { recipients: true, attempts: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ campaigns });
  } catch (error) {
    console.error('[CAMPAIGNS GET ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const campaignsEnabled = await featureFlags.isEnabled('OUTBOUND_CAMPAIGNS_ENABLED');

    if (!campaignsEnabled) {
      return NextResponse.json(
        { error: 'Campaigns not enabled', code: 'FEATURE_DISABLED' },
        { status: 503 }
      );
    }

    const body = await req.json();
    const {
      workspaceId,
      businessId,
      name,
      workflowType,
      agentId,
      agentVersionId,
      language,
      callerId,
      targetSegment,
      callingWindowStart,
      callingWindowEnd,
      timezoneStrategy,
      maxAttempts,
      retryIntervalMinutes,
      concurrencyLimit,
      callsPerMinute,
      approvalStatus,
      dryRunCompleted,
      openingDisclosure,
    } = body;

    if (!workspaceId || !name || !workflowType || !agentId || !callerId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const campaign = await prisma.campaign.create({
      data: {
        workspaceId,
        businessId,
        name,
        workflowType,
        agentId,
        agentVersionId,
        language: language || 'en-US',
        callerId,
        targetSegment,
        callingWindowStart,
        callingWindowEnd,
        timezoneStrategy: timezoneStrategy || 'LOCAL',
        maxAttempts: maxAttempts || 3,
        retryIntervalMinutes: retryIntervalMinutes || 60,
        concurrencyLimit: concurrencyLimit || 2,
        callsPerMinute: callsPerMinute || 5,
        approvalStatus: approvalStatus || 'PENDING_APPROVAL',
        dryRunCompleted: dryRunCompleted || false,
        openingDisclosure,
        state: 'DRAFT',
      },
    });

    return NextResponse.json({ campaign }, { status: 201 });
  } catch (error) {
    console.error('[CAMPAIGNS POST ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
