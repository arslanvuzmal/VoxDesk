import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '@/lib/database';
import { featureFlags } from '@/lib/features/flags';
import { requireWorkspaceAccess } from '@/lib/auth/require-session';

const CampaignCreateSchema = z.object({
  name: z.string().trim().min(2).max(120),
  businessId: z.string().min(1).optional(),
  workflowType: z.enum([
    'APPOINTMENT_REMINDER',
    'REQUESTED_CALLBACK',
    'CUSTOMER_FOLLOW_UP',
    'MISSING_INFORMATION_REMINDER',
    'SERVICE_UPDATE',
    'CONSENTED_LEAD_FOLLOW_UP',
    'SURVEY_REQUEST',
  ]),
  agentId: z.string().min(1),
  agentVersionId: z.string().min(1),
  callerIdPhoneNumberId: z.string().min(1),
  language: z.string().min(2).max(35).optional(),
  targetSegment: z.string().max(200).optional(),
  callingWindowStart: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  callingWindowEnd: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  timezoneStrategy: z.enum(['LOCAL', 'BUSINESS']).default('LOCAL'),
  maxAttempts: z.number().int().min(1).max(5).default(2),
  retryIntervalMinutes: z.number().int().min(15).max(10080).default(60),
  concurrencyLimit: z.number().int().min(1).max(20).default(1),
  callsPerMinute: z.number().int().min(1).max(60).default(3),
  openingDisclosure: z.string().max(500).optional(),
  supportedCountries: z
    .array(z.string().regex(/^[A-Z]{2}$/))
    .min(1)
    .max(25),
});

async function enabledResponse() {
  if (await featureFlags.isEnabled('OUTBOUND_CAMPAIGNS_ENABLED')) return null;
  return NextResponse.json(
    { error: { code: 'FEATURE_DISABLED', message: 'Campaigns are not enabled.' } },
    { status: 503 }
  );
}

export async function GET(req: NextRequest) {
  const disabled = await enabledResponse();
  if (disabled) return disabled;
  const { searchParams } = new URL(req.url);
  const workspace = await requireWorkspaceAccess(
    req,
    searchParams.get('workspaceId') || undefined,
    'campaigns:view'
  );
  if ('errorResponse' in workspace) return workspace.errorResponse;

  const state = searchParams.get('state');
  const where: Prisma.CampaignWhereInput = { workspaceId: workspace.workspaceId };
  if (state) where.state = state;

  const campaigns = await prisma.campaign.findMany({
    where,
    include: { _count: { select: { recipients: true, attempts: true } } },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  return NextResponse.json({ data: campaigns });
}

export async function POST(req: NextRequest) {
  const disabled = await enabledResponse();
  if (disabled) return disabled;
  const workspace = await requireWorkspaceAccess(req, undefined, 'campaigns:manage');
  if ('errorResponse' in workspace) return workspace.errorResponse;

  const parsed = CampaignCreateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'VALIDATION', message: 'Invalid campaign configuration.' } },
      { status: 400 }
    );
  }
  const input = parsed.data;

  const [agent, callerId, business] = await Promise.all([
    prisma.voiceAgent.findFirst({
      where: { id: input.agentId, workspaceId: workspace.workspaceId },
      select: { id: true, language: true },
    }),
    prisma.phoneNumber.findFirst({
      where: {
        id: input.callerIdPhoneNumberId,
        workspaceId: workspace.workspaceId,
        provider: 'TELNYX',
        status: 'ACTIVE',
      },
      select: { id: true },
    }),
    input.businessId
      ? prisma.businessProfile.findFirst({
          where: { id: input.businessId, workspaceId: workspace.workspaceId },
          select: { id: true, defaultLanguage: true },
        })
      : prisma.businessProfile.findUnique({
          where: { workspaceId: workspace.workspaceId },
          select: { id: true, defaultLanguage: true },
        }),
  ]);

  if (!agent || !callerId || !business) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'Campaign routing configuration was not found.' } },
      { status: 404 }
    );
  }

  const version = await prisma.agentVersion.findFirst({
    where: { id: input.agentVersionId, agentId: agent.id },
    select: { id: true },
  });
  if (!version) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'Agent version was not found.' } },
      { status: 404 }
    );
  }

  const campaign = await prisma.campaign.create({
    data: {
      workspaceId: workspace.workspaceId,
      businessId: business.id,
      name: input.name,
      workflowType: input.workflowType,
      agentId: agent.id,
      agentVersionId: input.agentVersionId,
      language: input.language || business.defaultLanguage || agent.language,
      callerId: callerId.id,
      targetSegment: input.targetSegment,
      callingWindowStart: input.callingWindowStart,
      callingWindowEnd: input.callingWindowEnd,
      timezoneStrategy: input.timezoneStrategy,
      maxAttempts: input.maxAttempts,
      retryIntervalMinutes: input.retryIntervalMinutes,
      concurrencyLimit: input.concurrencyLimit,
      callsPerMinute: input.callsPerMinute,
      openingDisclosure: input.openingDisclosure,
      supportedCountries: input.supportedCountries,
      createdBy: workspace.userId,
      approvalStatus: 'PENDING_APPROVAL',
      dryRunCompleted: false,
      state: 'DRAFT',
    },
  });
  return NextResponse.json({ data: campaign }, { status: 201 });
}

