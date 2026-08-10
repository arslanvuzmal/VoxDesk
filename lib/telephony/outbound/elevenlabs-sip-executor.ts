import { z } from 'zod';
import { prisma } from '@/lib/database';
import { env, validateE164PhoneNumber } from '@/lib/config/env';
import { decryptSensitiveValue, maskPhone } from '@/lib/security/encryption';
import { acquireCallLeases, releaseCallLeases } from '@/lib/telephony/concurrency';

const ElevenLabsOutboundResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  conversation_id: z.string().min(1).nullable(),
  sip_call_id: z.string().min(1).nullable(),
});

export type CanonicalOutboundExecutionRequest = {
  attemptId: string;
  campaignId: string;
  recipientId: string;
  workspaceId: string;
  correlationId: string;
  idempotencyKey: string;
};

export type CanonicalOutboundExecutionResult =
  | {
      accepted: true;
      callId: string;
      conversationId: string;
      providerConversationId: string;
      sipCallId: string;
    }
  | {
      accepted: false;
      category:
        | 'VALIDATION'
        | 'AUTHORIZATION'
        | 'NOT_FOUND'
        | 'PROVIDER_UNAVAILABLE'
        | 'NETWORK'
        | 'TIMEOUT'
        | 'CONFLICT';
      retryable: boolean;
    };

type PreparedOutbound = {
  callId: string;
  conversationId: string;
  destination: string;
  voiceAgentId: string;
  voiceProviderPhoneNumberId: string;
  businessId: string;
  agentId: string;
  phoneNumberId: string;
  campaignId: string;
  workspaceId: string;
  contactId: string | null;
  languageCode: string;
};

async function prepareOutbound(
  request: CanonicalOutboundExecutionRequest
): Promise<PreparedOutbound | null> {
  const attempt = await prisma.outboundAttempt.findFirst({
    where: {
      id: request.attemptId,
      workspaceId: request.workspaceId,
      campaignId: request.campaignId,
      recipientId: request.recipientId,
    },
    include: { campaign: true, recipient: true },
  });
  if (!attempt?.campaign || !attempt.recipient || !attempt.campaign.businessId) return null;

  const campaign = attempt.campaign;
  const recipient = attempt.recipient;
  const businessId = campaign.businessId;
  if (
    campaign.workspaceId !== request.workspaceId ||
    recipient.workspaceId !== request.workspaceId ||
    recipient.campaignId !== campaign.id ||
    !recipient.recipientPhoneEncrypted ||
    !businessId ||
    !campaign.callerId ||
    !campaign.agentVersionId
  ) {
    return null;
  }

  const [business, agentVersion, languageProfile, phoneNumber, trainingPack] = await Promise.all([
    prisma.businessProfile.findFirst({
      where: { id: businessId, workspaceId: request.workspaceId },
      select: { id: true },
    }),
    prisma.agentVersion.findFirst({
      where: { id: campaign.agentVersionId, agentId: campaign.agentId },
      select: { id: true },
    }),
    prisma.languageProfile.findFirst({
      where: {
        workspaceId: request.workspaceId,
        languageCode: campaign.language,
        status: 'VERIFIED',
        telephonySupported: true,
        businessContentComplete: true,
        disclosureContentComplete: true,
        pronunciationConfigured: true,
        lastVerifiedAt: { not: null },
        voiceAgentId: { not: null },
      },
      select: { id: true, voiceAgentId: true, languageCode: true },
    }),
    prisma.phoneNumber.findFirst({
      where: {
        id: campaign.callerId,
        workspaceId: request.workspaceId,
        businessId,
        agentId: campaign.agentId,
        provider: 'TELNYX',
        status: 'ACTIVE',
        voiceProviderPhoneNumberId: { not: null },
      },
      select: {
        id: true,
        numberEncrypted: true,
        voiceProviderPhoneNumberId: true,
        trainingPackVersionId: true,
      },
    }),
    prisma.businessTrainingPack.findFirst({
      where: {
        workspaceId: request.workspaceId,
        agentId: campaign.agentId,
      },
      orderBy: { versionNumber: 'desc' },
      select: { id: true },
    }),
  ]);
  if (
    !business ||
    !agentVersion ||
    !languageProfile?.voiceAgentId ||
    !phoneNumber?.voiceProviderPhoneNumberId ||
    !phoneNumber.numberEncrypted ||
    !trainingPack ||
    (phoneNumber.trainingPackVersionId && phoneNumber.trainingPackVersionId !== trainingPack.id)
  ) {
    return null;
  }

  const voiceAgentId = languageProfile.voiceAgentId;
  const voiceProviderPhoneNumberId = phoneNumber.voiceProviderPhoneNumberId;

  let destination: string;
  try {
    destination = decryptSensitiveValue(recipient.recipientPhoneEncrypted);
  } catch {
    return null;
  }
  if (!validateE164PhoneNumber(destination)) return null;

  if (attempt.callId) {
    const existing = await prisma.call.findFirst({
      where: { id: attempt.callId, workspaceId: request.workspaceId },
      include: { conversation: true },
    });
    if (existing?.conversation) {
      return {
        callId: existing.id,
        conversationId: existing.conversation.id,
        destination,
        voiceAgentId,
        voiceProviderPhoneNumberId,
        businessId: business.id,
        agentId: campaign.agentId,
        phoneNumberId: phoneNumber.id,
        campaignId: campaign.id,
        workspaceId: request.workspaceId,
        contactId: recipient.contactId,
        languageCode: languageProfile.languageCode,
      };
    }
    return null;
  }

  return prisma.$transaction(async tx => {
    const call = await tx.call.create({
      data: {
        workspaceId: request.workspaceId,
        agentId: campaign.agentId,
        agentVersionId: agentVersion.id,
        provider: 'TELNYX',
        direction: 'OUTBOUND',
        channel: 'PHONE',
        language: languageProfile.languageCode,
        fromNumberEncrypted: phoneNumber.numberEncrypted,
        toNumberEncrypted: recipient.recipientPhoneEncrypted,
        callerNumberMasked: maskPhone(destination),
        callerName: recipient.recipientName,
        status: 'INITIATED',
        contactId: recipient.contactId,
        campaignId: campaign.id,
        recordingConsent: false,
        recordingConsentState: 'NOT_REQUESTED',
      },
    });
    const conversation = await tx.conversation.create({
      data: {
        workspaceId: request.workspaceId,
        businessId: business.id,
        contactId: recipient.contactId,
        channel: 'PHONE',
        direction: 'OUTBOUND',
        status: 'CREATED',
        agentId: campaign.agentId,
        agentVersionId: agentVersion.id,
        trainingPackVersionId: trainingPack.id,
        languageProfileId: languageProfile.id,
        languageCode: languageProfile.languageCode,
        provider: 'ELEVENLABS',
        callId: call.id,
        campaignId: campaign.id,
        correlationId: request.correlationId,
      },
    });
    await tx.outboundAttempt.update({
      where: { id: attempt.id },
      data: { callId: call.id },
    });
    return {
      callId: call.id,
      conversationId: conversation.id,
      destination,
      voiceAgentId,
      voiceProviderPhoneNumberId,
      businessId: business.id,
      agentId: campaign.agentId,
      phoneNumberId: phoneNumber.id,
      campaignId: campaign.id,
      workspaceId: request.workspaceId,
      contactId: recipient.contactId,
      languageCode: languageProfile.languageCode,
    };
  });
}

export async function executeElevenLabsSipOutbound(
  request: CanonicalOutboundExecutionRequest
): Promise<CanonicalOutboundExecutionResult> {
  if (!env.ELEVENLABS_API_KEY) {
    return { accepted: false, category: 'PROVIDER_UNAVAILABLE', retryable: false };
  }

  const prepared = await prepareOutbound(request);
  if (!prepared) return { accepted: false, category: 'VALIDATION', retryable: false };

  const existing = await prisma.call.findUnique({
    where: { id: prepared.callId },
    select: { providerConversationId: true, providerCallSessionId: true },
  });
  if (existing?.providerConversationId && existing.providerCallSessionId) {
    return {
      accepted: true,
      callId: prepared.callId,
      conversationId: prepared.conversationId,
      providerConversationId: existing.providerConversationId,
      sipCallId: existing.providerCallSessionId,
    };
  }

  const leases = await acquireCallLeases(
    prepared.workspaceId,
    prepared.businessId,
    prepared.agentId,
    prepared.phoneNumberId,
    prepared.campaignId,
    'OUTBOUND',
    prepared.callId
  );
  if (!leases.success) {
    return { accepted: false, category: 'CONFLICT', retryable: true };
  }

  let response: Response;
  try {
    response = await fetch('https://api.elevenlabs.io/v1/convai/sip-trunk/outbound-call', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': env.ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        agent_id: prepared.voiceAgentId,
        agent_phone_number_id: prepared.voiceProviderPhoneNumberId,
        to_number: prepared.destination,
        conversation_initiation_client_data: {
          dynamic_variables: {
            voxdesk_conversation_id: prepared.conversationId,
            voxdesk_call_id: prepared.callId,
            voxdesk_workspace_id: prepared.workspaceId,
            voxdesk_campaign_id: prepared.campaignId,
            voxdesk_contact_id: prepared.contactId || '',
            voxdesk_correlation_id: request.correlationId,
            voxdesk_language: prepared.languageCode,
          },
        },
      }),
      cache: 'no-store',
      signal: AbortSignal.timeout(15_000),
    });
  } catch (error) {
    await prisma.$transaction([
      prisma.call.update({
        where: { id: prepared.callId },
        data: { status: 'FAILED', terminationReason: 'FAILED_PROVIDER' },
      }),
      prisma.conversation.update({
        where: { id: prepared.conversationId },
        data: {
          status: 'FAILED',
          requiresReview: true,
          completenessStatus: 'PROVIDER_DATA_MISSING',
        },
      }),
    ]);
    await releaseCallLeases(prepared.callId, leases.leases);
    return {
      accepted: false,
      category:
        error instanceof DOMException && error.name === 'TimeoutError' ? 'TIMEOUT' : 'NETWORK',
      retryable: false,
    };
  }

  const raw = await response.json().catch(() => null);
  const parsed = ElevenLabsOutboundResponseSchema.safeParse(raw);
  if (
    !response.ok ||
    !parsed.success ||
    !parsed.data.success ||
    !parsed.data.conversation_id ||
    !parsed.data.sip_call_id
  ) {
    await prisma.$transaction([
      prisma.call.update({
        where: { id: prepared.callId },
        data: { status: 'FAILED', terminationReason: 'FAILED_PROVIDER' },
      }),
      prisma.conversation.update({
        where: { id: prepared.conversationId },
        data: {
          status: 'FAILED',
          requiresReview: true,
          completenessStatus: 'PROVIDER_DATA_MISSING',
        },
      }),
    ]);
    await releaseCallLeases(prepared.callId, leases.leases);
    return { accepted: false, category: 'PROVIDER_UNAVAILABLE', retryable: false };
  }

  const providerConversationId = parsed.data.conversation_id;
  const sipCallId = parsed.data.sip_call_id;
  await prisma.$transaction([
    prisma.call.update({
      where: { id: prepared.callId },
      data: {
        providerConversationId,
        providerCallSessionId: sipCallId,
        status: 'INITIATED',
      },
    }),
    prisma.conversation.update({
      where: { id: prepared.conversationId },
      data: { providerConversationId, status: 'ACTIVE' },
    }),
    prisma.conversationProviderCorrelation.createMany({
      data: [
        {
          conversationId: prepared.conversationId,
          provider: 'ELEVENLABS',
          identifierType: 'ELEVENLABS_CONVERSATION_ID',
          identifierValue: providerConversationId,
        },
        {
          conversationId: prepared.conversationId,
          provider: 'ELEVENLABS',
          identifierType: 'ELEVENLABS_SIP_CALL_ID',
          identifierValue: sipCallId,
        },
      ],
      skipDuplicates: true,
    }),
  ]);

  return {
    accepted: true,
    callId: prepared.callId,
    conversationId: prepared.conversationId,
    providerConversationId,
    sipCallId,
  };
}
