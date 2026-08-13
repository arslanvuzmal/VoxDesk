import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/database';
import { featureFlags } from '@/lib/features/flags';
import { requireWorkspaceAccess } from '@/lib/auth/require-session';
import { OutboundTelephonyHandler } from '@/lib/telephony/outbound';
import { decryptSensitiveValue } from '@/lib/security/encryption';

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
    select: { id: true, phoneEncrypted: true, preferredLanguage: true },
  });
  if (!contact?.phoneEncrypted) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'An eligible contact phone was not found.' } },
      { status: 404 }
    );
  }

  const business = await prisma.businessProfile.findUnique({
    where: { workspaceId: workspace.workspaceId },
    select: { id: true, defaultLanguage: true, timezone: true },
  });
  const agent = await prisma.voiceAgent.findFirst({
    where: { workspaceId: workspace.workspaceId, status: 'ACTIVE' },
    orderBy: { createdAt: 'asc' },
    select: { id: true, language: true },
  });
  if (!business || !agent) {
    return NextResponse.json(
      { error: { code: 'NOT_CONFIGURED', message: 'Outbound business routing is not configured.' } },
      { status: 503 }
    );
  }
  const [agentVersion, trainingPack, preference] = await Promise.all([
    prisma.agentVersion.findFirst({ where: { agentId: agent.id }, orderBy: { versionNumber: 'desc' } }),
    prisma.businessTrainingPack.findFirst({ where: { workspaceId: workspace.workspaceId, agentId: agent.id }, orderBy: { versionNumber: 'desc' } }),
    prisma.communicationPreference.findUnique({ where: { contactId: contact.id }, select: { timeZone: true } }),
  ]);
  if (!agentVersion || !trainingPack) {
    return NextResponse.json(
      { error: { code: 'NOT_CONFIGURED', message: 'A published agent version and training pack are required.' } },
      { status: 503 }
    );
  }

  let toNumber: string;
  try {
    toNumber = decryptSensitiveValue(contact.phoneEncrypted);
  } catch {
    return NextResponse.json(
      { error: { code: 'PII_UNAVAILABLE', message: 'The contact phone could not be decrypted.' } },
      { status: 503 }
    );
  }

  const campaign = parsed.data.campaignId
    ? await prisma.campaign.findFirst({ where: { id: parsed.data.campaignId, workspaceId: workspace.workspaceId }, select: { id: true, state: true, callingWindowStart: true, callingWindowEnd: true, maxAttempts: true, retryIntervalMinutes: true, timezoneStrategy: true } })
    : null;
  if (parsed.data.campaignId && !campaign) {
    return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Campaign was not found.' } }, { status: 404 });
  }
  const handler = new OutboundTelephonyHandler();
  const result = await handler.initiateOutboundCall({
    workspaceId: workspace.workspaceId,
    businessId: business.id,
    agentId: agent.id,
    agentVersionId: agentVersion.id,
    toNumber,
    fromNumber: process.env.TELNYX_PRIMARY_PHONE_NUMBER || '',
    workflowType: parsed.data.workflowType,
    language: contact.preferredLanguage || agent.language || business.defaultLanguage,
    trainingPackVersion: trainingPack.versionNumber,
    contactId: contact.id,
    campaignId: campaign?.id,
    maxAttempts: campaign?.maxAttempts,
    retryIntervalMinutes: campaign?.retryIntervalMinutes,
    callingWindowStart: campaign?.callingWindowStart || undefined,
    callingWindowEnd: campaign?.callingWindowEnd || undefined,
    timeZone: preference?.timeZone || business.timezone,
  });
  if (!result.success) {
    return NextResponse.json({ error: { code: result.blockedReason || 'OUTBOUND_BLOCKED', message: result.error || 'Outbound call was not started.' } }, { status: 409 });
  }
  return NextResponse.json({ data: { callId: result.callId, status: 'INITIATING' } }, { status: 202 });
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
