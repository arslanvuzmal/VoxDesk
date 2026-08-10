import crypto from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/database';
import { env } from '@/lib/config/env';
import { requireWorkspaceAccess } from '@/lib/auth/require-session';
import { signConversationContext } from '@/lib/security/conversation-context';
import { enforceWorkspaceRateLimit } from '@/lib/security/workspace-rate-limit';

const StartSchema = z.object({
  businessId: z.string().min(1),
  agentId: z.string().min(1),
  languageCode: z.string().min(2).max(35),
  contactId: z.string().min(1).optional(),
});

export async function POST(request: NextRequest) {
  const authorization = await requireWorkspaceAccess(request, undefined, 'conversations:start');
  if ('errorResponse' in authorization) return authorization.errorResponse;

  const parsed = StartSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'VALIDATION', message: 'Invalid conversation configuration.' } },
      { status: 400 }
    );
  }
  const { workspaceId } = authorization;
  const { businessId, agentId, languageCode, contactId } = parsed.data;
  const rateLimit = await enforceWorkspaceRateLimit(
    'voice-start',
    workspaceId,
    Number(env.VOICE_STARTS_PER_WORKSPACE_PER_MINUTE),
    60
  );
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: 'RATE_LIMIT',
          message: 'Voice conversation capacity is temporarily limited.',
        },
      },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) } }
    );
  }

  const [business, agent, languageProfile, trainingPack, contact] = await Promise.all([
    prisma.businessProfile.findFirst({
      where: { id: businessId, workspaceId },
      select: { id: true },
    }),
    prisma.voiceAgent.findFirst({
      where: { id: agentId, workspaceId, businessProfileId: businessId, status: 'ACTIVE' },
      include: { versions: { orderBy: { versionNumber: 'desc' }, take: 1 } },
    }),
    prisma.languageProfile.findFirst({
      where: {
        workspaceId,
        languageCode,
        status: 'VERIFIED',
        webSupported: true,
        businessContentComplete: true,
        disclosureContentComplete: true,
        pronunciationConfigured: true,
        lastVerifiedAt: { not: null },
      },
    }),
    prisma.businessTrainingPack.findFirst({
      where: { workspaceId, agentId },
      orderBy: { versionNumber: 'desc' },
    }),
    contactId
      ? prisma.contact.findFirst({ where: { id: contactId, workspaceId }, select: { id: true } })
      : null,
  ]);
  const agentVersion = agent?.versions[0];

  if (
    !business ||
    !agent ||
    agent.voiceProvider !== 'ELEVENLABS' ||
    !agentVersion ||
    !languageProfile?.voiceAgentId ||
    !trainingPack ||
    (contactId && !contact)
  ) {
    return NextResponse.json(
      {
        error: {
          code: 'REQUIRES_CONFIGURATION',
          message: 'The requested business, agent, language, or training version is not verified.',
        },
      },
      { status: 409 }
    );
  }
  if (!env.ELEVENLABS_API_KEY) {
    return NextResponse.json(
      { error: { code: 'PROVIDER_NOT_CONFIGURED', message: 'Website voice is not configured.' } },
      { status: 503 }
    );
  }

  const correlationId = crypto.randomUUID();
  const conversation = await prisma.conversation.create({
    data: {
      workspaceId,
      businessId,
      contactId: contact?.id,
      channel: 'WEB_VOICE',
      direction: 'INTERACTIVE',
      status: 'CREATED',
      agentId,
      agentVersionId: agentVersion.id,
      trainingPackVersionId: trainingPack.id,
      languageProfileId: languageProfile.id,
      languageCode,
      provider: 'ELEVENLABS',
      correlationId,
    },
  });

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${encodeURIComponent(languageProfile.voiceAgentId)}`,
      { headers: { 'xi-api-key': env.ELEVENLABS_API_KEY }, cache: 'no-store' }
    );
    if (!response.ok) throw new Error('provider unavailable');
    const provider = (await response.json()) as { signed_url?: string };
    if (!provider.signed_url) throw new Error('provider token missing');

    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { status: 'ACTIVE' },
    });
    const conversationContext = signConversationContext({
      conversationId: conversation.id,
      workspaceId,
      businessId,
      contactId: contact?.id || null,
      agentId,
      agentVersionId: agentVersion.id,
      trainingPackVersionId: trainingPack.id,
      channel: 'WEB_VOICE',
      direction: 'INTERACTIVE',
      language: languageCode,
    });

    return NextResponse.json({
      data: {
        conversationId: conversation.id,
        signedUrl: provider.signed_url,
        conversationContext,
        expiresInSeconds: 300,
      },
      meta: { correlationId },
    });
  } catch {
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { status: 'FAILED', requiresReview: true },
    });
    return NextResponse.json(
      {
        error: {
          code: 'PROVIDER_UNAVAILABLE',
          message: 'The realtime voice provider could not start this conversation.',
          correlationId,
        },
      },
      { status: 503 }
    );
  }
}

