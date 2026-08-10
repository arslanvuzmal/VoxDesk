import type { CallContext } from '@/lib/telephony/call-state-machine';
import type { IdentifiedTelnyxEvent } from '@/lib/telephony/events/telnyx-inbox';
import { prisma } from '@/lib/database';
import { hashPhoneNumber } from '@/lib/security/identifiers';
import { encryptSensitiveValue, maskPhone } from '@/lib/security/encryption';
import { syncConversationProjectionIfEnabled } from '@/lib/conversation/persistence';
import type { CallStatus } from '@prisma/client';

function toCallStatus(state: IdentifiedTelnyxEvent['callState']): CallStatus {
  switch (state) {
    case 'CREATED':
    case 'QUEUED':
    case 'INITIATING':
      return 'INITIATED';
    case 'ANSWERED':
    case 'AGENT_CONNECTING':
    case 'ACTIVE':
    case 'HUMAN_TRANSFER_PENDING':
    case 'HUMAN_CONNECTED':
    case 'ENDING':
      return 'IN_PROGRESS';
    case 'VOICEMAIL':
    case 'REJECTED':
    case 'CANCELLED':
      return 'FAILED';
    default:
      return state;
  }
}

export function isOutOfOrderEvent(occurredAt: Date, latestAppliedAt?: Date): boolean {
  return Boolean(latestAppliedAt && occurredAt < latestAppliedAt);
}

export async function resolveCallContext(
  event: IdentifiedTelnyxEvent
): Promise<CallContext | null> {
  const existingCall = await prisma.call.findFirst({
    where: { providerCallControlId: event.providerCallControlId },
    include: {
      workspace: { include: { businessProfile: true } },
      agent: { include: { versions: { orderBy: { versionNumber: 'desc' }, take: 1 } } },
    },
  });
  if (existingCall) {
    const business = existingCall.workspace.businessProfile;
    const agentVersion =
      existingCall.agentVersionId === existingCall.agent.versions[0]?.id
        ? existingCall.agent.versions[0]
        : await prisma.agentVersion.findFirst({
            where: { id: existingCall.agentVersionId || '', agentId: existingCall.agentId },
          });
    const trainingPack = await prisma.businessTrainingPack.findFirst({
      where: { workspaceId: existingCall.workspaceId, agentId: existingCall.agentId },
      orderBy: { versionNumber: 'desc' },
    });
    if (!business || !agentVersion || !trainingPack) return null;
    return {
      id: existingCall.id,
      workspaceId: existingCall.workspaceId,
      businessId: business.id,
      agentId: existingCall.agentId,
      agentVersionId: agentVersion.id,
      direction: event.direction as 'INBOUND' | 'OUTBOUND' | 'WEB',
      channel: 'PHONE',
      provider: 'TELNYX',
      providerCallControlId: event.providerCallControlId,
      providerCallSessionId: event.providerCallSessionId,
      providerCallLegId: event.providerCallLegId,
      callerNumber: event.fromNumber || '',
      callerName: existingCall.callerName || undefined,
      contactId: existingCall.contactId || undefined,
      campaignId: existingCall.campaignId || undefined,
      language: existingCall.language,
      trainingPackVersion: trainingPack.versionNumber,
      state: existingCall.status as CallContext['state'],
      startedAt: existingCall.startedAt,
      answeredAt: existingCall.answeredAt || undefined,
      endedAt: existingCall.endedAt || undefined,
      durationSeconds: existingCall.durationSeconds,
      terminationReason: event.terminationReason,
      outcome: existingCall.outcome || undefined,
      recordingConsent: existingCall.recordingConsent,
      transcription: [],
      events: [],
      metadata: {},
    };
  }

  if (event.direction !== 'INBOUND' || !event.fromNumber || !event.toNumber) return null;
  let destinationHash: string;
  let callerHash: string;
  try {
    destinationHash = hashPhoneNumber(event.toNumber);
    callerHash = hashPhoneNumber(event.fromNumber);
  } catch {
    return null;
  }
  const phoneNumber = await prisma.phoneNumber.findFirst({
    where: { provider: 'TELNYX', numberHash: destinationHash, status: 'ACTIVE' },
    include: {
      workspace: true,
      business: true,
      languageProfile: true,
      trainingPackVersion: true,
      agent: { include: { versions: { orderBy: { versionNumber: 'desc' }, take: 1 } } },
    },
  });
  const agentVersion = phoneNumber?.agent?.versions[0];
  const trainingPack =
    phoneNumber?.trainingPackVersion ||
    (phoneNumber?.agentId
      ? await prisma.businessTrainingPack.findFirst({
          where: { workspaceId: phoneNumber.workspaceId, agentId: phoneNumber.agentId },
          orderBy: { versionNumber: 'desc' },
        })
      : null);
  if (
    !phoneNumber?.workspace ||
    !phoneNumber.business ||
    phoneNumber.business.workspaceId !== phoneNumber.workspaceId ||
    !phoneNumber.agent ||
    !phoneNumber.agentId ||
    phoneNumber.agent.workspaceId !== phoneNumber.workspaceId ||
    !agentVersion ||
    !trainingPack ||
    trainingPack.workspaceId !== phoneNumber.workspaceId ||
    trainingPack.agentId !== phoneNumber.agentId ||
    !phoneNumber.languageProfile ||
    phoneNumber.languageProfile.workspaceId !== phoneNumber.workspaceId ||
    phoneNumber.languageProfile.status !== 'VERIFIED' ||
    !phoneNumber.languageProfile.telephonySupported ||
    !phoneNumber.languageProfile.businessContentComplete ||
    !phoneNumber.languageProfile.disclosureContentComplete ||
    !phoneNumber.languageProfile.pronunciationConfigured ||
    !phoneNumber.languageProfile.lastVerifiedAt ||
    !phoneNumber.languageProfile.voiceAgentId
  ) {
    return null;
  }
  const contact = await prisma.contact.findFirst({
    where: { workspaceId: phoneNumber.workspaceId, phoneHash: callerHash },
    select: { id: true },
  });
  const language = phoneNumber.languageProfile.languageCode;
  const startedAt = new Date();
  const newCall = await prisma.call.create({
    data: {
      workspaceId: phoneNumber.workspaceId,
      agentId: phoneNumber.agentId,
      agentVersionId: agentVersion.id,
      provider: 'TELNYX',
      providerCallControlId: event.providerCallControlId,
      providerCallSessionId: event.providerCallSessionId,
      providerCallLegId: event.providerCallLegId,
      direction: 'INBOUND',
      channel: 'PHONE',
      language,
      fromNumberEncrypted: encryptSensitiveValue(event.fromNumber),
      toNumberEncrypted: encryptSensitiveValue(event.toNumber),
      fromNumberHash: callerHash,
      toNumberHash: destinationHash,
      callerNumberMasked: maskPhone(event.fromNumber),
      contactId: contact?.id,
      status: toCallStatus(event.callState),
      startedAt,
      recordingConsent: false,
      recordingConsentState: 'NOT_REQUESTED',
    },
  });
  await syncConversationProjectionIfEnabled(newCall.id).catch(() => undefined);
  return {
    id: newCall.id,
    workspaceId: phoneNumber.workspaceId,
    businessId: phoneNumber.business.id,
    agentId: phoneNumber.agentId,
    agentVersionId: agentVersion.id,
    direction: 'INBOUND',
    channel: 'PHONE',
    provider: 'TELNYX',
    providerCallControlId: event.providerCallControlId,
    providerCallSessionId: event.providerCallSessionId,
    providerCallLegId: event.providerCallLegId,
    callerNumber: event.fromNumber,
    contactId: contact?.id,
    language,
    trainingPackVersion: trainingPack.versionNumber,
    state: event.callState,
    startedAt,
    durationSeconds: 0,
    recordingConsent: false,
    transcription: [],
    events: [],
    metadata: {},
  };
}

