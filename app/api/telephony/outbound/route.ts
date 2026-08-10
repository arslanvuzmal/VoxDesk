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

  const contact = await prisma.contact.findFirst({
    where: { id: parsed.data.contactId, workspaceId: workspace.workspaceId },
    select: { id: true, phoneEncrypted: true },
  });
  if (!contact?.phoneEncrypted) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'An eligible contact phone was not found.' } },
      { status: 404 }
    );
  }

  if (parsed.data.campaignId) {
    const campaign = await prisma.campaign.findFirst({
      where: { id: parsed.data.campaignId, workspaceId: workspace.workspaceId },
      select: { id: true },
    });
    if (!campaign) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Campaign was not found.' } },
        { status: 404 }
      );
    }
  }

  return NextResponse.json(
    {
      error: {
        code: 'CALLER_ID_REQUIRES_CONFIGURATION',
        message:
          'Outbound calling requires a verified encrypted caller-ID configuration. No call was initiated.',
      },
    },
    { status: 503 }
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
