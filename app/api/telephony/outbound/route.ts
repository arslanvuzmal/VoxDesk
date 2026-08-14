import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/database';
import { featureFlags } from '@/lib/features/flags';
import { requireWorkspaceAccess } from '@/lib/auth/require-session';

const OutboundRequestSchema = z.object({
  contactId: z.string().min(1),
  workflowType: z.enum([
    'APPOINTMENT_REMINDER',
    'REQUESTED_CALLBACK',
    'CUSTOMER_FOLLOW_UP',
    'MISSING_INFORMATION_REMINDER',
    'SERVICE_UPDATE',
    'CONSENTED_LEAD_FOLLOW_UP',
    'SURVEY_REQUEST',
  ]),
  campaignId: z.string().min(1).optional(),
});

export async function POST(req: NextRequest) {
  const workspace = await requireWorkspaceAccess(req, undefined, 'outbound:execute');
  if ('errorResponse' in workspace) return workspace.errorResponse;

  if (!(await featureFlags.isEnabled('TELNYX_OUTBOUND_ENABLED'))) {
    return NextResponse.json(
      { error: { code: 'FEATURE_DISABLED', message: 'Outbound telephony is not enabled.' } },
      { status: 503 }
    );
  }

  const parsed = OutboundRequestSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'VALIDATION', message: 'Invalid outbound request.' } },
      { status: 400 }
    );
  }

  // Direct browser-originated dialing is intentionally not supported. All
  // outbound execution must be queued by an approved campaign so that consent,
  // suppression, calling-window, attempt-limit, caller-ID, and concurrency
  // controls are evaluated by the durable worker.
  if (!parsed.data.campaignId) {
    return NextResponse.json(
      {
        error: {
          code: 'CAMPAIGN_REQUIRED',
          message: 'Outbound calls must be queued through an approved campaign.',
        },
      },
      { status: 409 }
    );
  }

  const [contact, campaign] = await Promise.all([
    prisma.contact.findFirst({
      where: { id: parsed.data.contactId, workspaceId: workspace.workspaceId },
      select: { id: true },
    }),
    prisma.campaign.findFirst({
      where: { id: parsed.data.campaignId, workspaceId: workspace.workspaceId },
      select: { id: true, approvalStatus: true, state: true },
    }),
  ]);

  if (!contact || !campaign) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'The contact or campaign was not found.' } },
      { status: 404 }
    );
  }

  if (
    campaign.approvalStatus !== 'APPROVED' ||
    !['SCHEDULED', 'RUNNING'].includes(campaign.state)
  ) {
    return NextResponse.json(
      {
        error: {
          code: 'CAMPAIGN_NOT_READY',
          message: 'The campaign must be approved and queued before execution.',
        },
      },
      { status: 409 }
    );
  }

  const recipient = await prisma.campaignRecipient.findFirst({
    where: {
      campaignId: campaign.id,
      workspaceId: workspace.workspaceId,
      contactId: contact.id,
    },
    select: {
      id: true,
      outboundAttempts: {
        where: { status: 'QUEUED' },
        orderBy: { attemptNumber: 'asc' },
        take: 1,
        select: { id: true, status: true },
      },
    },
  });
  const attempt = recipient?.outboundAttempts[0];
  if (!attempt) {
    return NextResponse.json(
      {
        error: {
          code: 'RECIPIENT_NOT_QUEUED',
          message: 'This recipient has no queued campaign attempt.',
        },
      },
      { status: 409 }
    );
  }

  return NextResponse.json(
    {
      data: {
        attemptId: attempt.id,
        recipientId: recipient.id,
        workflowType: parsed.data.workflowType,
        status: 'QUEUED',
        execution: 'BACKGROUND_WORKER',
      },
    },
    { status: 202 }
  );
}

export async function GET(req: NextRequest) {
  const workspace = await requireWorkspaceAccess(req, undefined, 'campaigns:view');
  if ('errorResponse' in workspace) return workspace.errorResponse;

  return NextResponse.json({
    data: {
      outboundEnabled: await featureFlags.isEnabled('TELNYX_OUTBOUND_ENABLED'),
      campaignsEnabled: await featureFlags.isEnabled('OUTBOUND_CAMPAIGNS_ENABLED'),
      telnyxEnabled: await featureFlags.isEnabled('TELNYX_TELEPHONY_ENABLED'),
      provider: 'TELNYX',
    },
  });
}
