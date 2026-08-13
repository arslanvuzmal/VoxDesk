import type {
  CallDirection,
  CallStatus,
  ConversationChannel,
  ConversationDirection,
  ConversationStatus,
  ProviderType,
} from '@prisma/client';
import { prisma } from '@/lib/database';
import { featureFlags } from '@/lib/features/flags';

export interface ConversationSyncResult {
  synced: boolean;
  conversationId?: string;
  reason?: 'DISABLED' | 'CALL_NOT_FOUND' | 'BUSINESS_NOT_CONFIGURED';
}

export function mapCallChannel(channel: string): ConversationChannel {
  if (channel === 'WEB' || channel === 'WEB_VOICE') return 'WEB_VOICE';
  return 'PHONE';
}

export function mapCallDirection(
  direction: CallDirection,
  channel?: string
): ConversationDirection {
  if (channel === 'WEB' || channel === 'WEB_VOICE') return 'INTERACTIVE';
  return direction === 'OUTBOUND' ? 'OUTBOUND' : 'INBOUND';
}

export function mapCallStatus(status: CallStatus): ConversationStatus {
  if (status === 'INITIATED') return 'CREATED';
  if (status === 'FAILED') return 'FAILED';
  if (status === 'TRANSFERRED') return 'HUMAN_HANDOFF';
  if (['COMPLETED', 'BUSY', 'NO_ANSWER'].includes(status)) return 'COMPLETED';
  return 'ACTIVE';
}

export async function syncConversationProjection(callId: string): Promise<ConversationSyncResult> {
  return prisma.$transaction(async tx => {
    const call = await tx.call.findUnique({
      where: { id: callId },
      include: {
        workspace: { include: { businessProfile: true } },
        summary: true,
        transcriptSegments: { orderBy: [{ startMs: 'asc' }, { id: 'asc' }] },
      },
    });
    if (!call) return { synced: false, reason: 'CALL_NOT_FOUND' };

    const business = call.workspace.businessProfile;
    if (!business) return { synced: false, reason: 'BUSINESS_NOT_CONFIGURED' };

    const [agentVersion, trainingPack, languageProfile] = await Promise.all([
      call.agentVersionId
        ? tx.agentVersion.findFirst({
            where: { id: call.agentVersionId, agentId: call.agentId },
            select: { id: true },
          })
        : null,
      tx.businessTrainingPack.findFirst({
        where: { workspaceId: call.workspaceId, agentId: call.agentId },
        orderBy: { versionNumber: 'desc' },
        select: { id: true },
      }),
      tx.languageProfile.findFirst({
        where: { workspaceId: call.workspaceId, languageCode: call.language },
        select: { id: true },
      }),
    ]);

    const hasTranscript = call.transcriptSegments.length > 0;
    const completed = ['COMPLETED', 'BUSY', 'NO_ANSWER', 'FAILED'].includes(call.status);
    const completenessStatus = completed
      ? hasTranscript && call.summary && agentVersion && languageProfile
        ? 'COMPLETE'
        : call.providerConversationId
          ? 'NEEDS_REVIEW'
          : 'PROVIDER_DATA_MISSING'
      : 'PARTIAL';

    const conversation = await tx.conversation.upsert({
      where: { callId: call.id },
      create: {
        workspaceId: call.workspaceId,
        businessId: business.id,
        contactId: call.contactId,
        channel: mapCallChannel(call.channel),
        direction: mapCallDirection(call.direction, call.channel),
        status: mapCallStatus(call.status),
        agentId: call.agentId,
        agentVersionId: agentVersion?.id,
        trainingPackVersionId: trainingPack?.id,
        languageProfileId: languageProfile?.id,
        languageCode: call.language,
        provider: call.provider,
        providerConversationId: call.providerConversationId,
        callId: call.id,
        campaignId: call.campaignId,
        intent: call.summary?.intent,
        urgency: call.summary?.urgency,
        sentiment: call.summary?.sentiment,
        summary: call.summary?.summary,
        outcome: call.outcome,
        startedAt: call.startedAt,
        endedAt: call.endedAt,
        durationSeconds: call.durationSeconds || null,
        requiresReview: completenessStatus === 'NEEDS_REVIEW',
        completenessStatus,
        correlationId: `call_${call.id}`,
      },
      update: {
        contactId: call.contactId,
        status: mapCallStatus(call.status),
        agentVersionId: agentVersion?.id,
        trainingPackVersionId: trainingPack?.id,
        languageProfileId: languageProfile?.id,
        languageCode: call.language,
        provider: call.provider,
        providerConversationId: call.providerConversationId,
        campaignId: call.campaignId,
        intent: call.summary?.intent,
        urgency: call.summary?.urgency,
        sentiment: call.summary?.sentiment,
        summary: call.summary?.summary,
        outcome: call.outcome,
        endedAt: call.endedAt,
        durationSeconds: call.durationSeconds || null,
        requiresReview: completenessStatus === 'NEEDS_REVIEW',
        completenessStatus,
      },
      select: { id: true },
    });

    for (const [index, segment] of call.transcriptSegments.entries()) {
      await tx.conversationMessage.upsert({
        where: {
          conversationId_sequence: { conversationId: conversation.id, sequence: index + 1 },
        },
        create: {
          conversationId: conversation.id,
          speaker: segment.speaker.toLowerCase() === 'agent' ? 'AGENT' : 'CUSTOMER',
          type: 'TRANSCRIPT',
          text: segment.text,
          sequence: index + 1,
          startedAt: new Date(call.startedAt.getTime() + segment.startMs),
          endedAt: new Date(call.startedAt.getTime() + segment.endMs),
          confidence: segment.confidence,
          language: call.language,
          redacted: segment.redacted,
        },
        update: {
          text: segment.text,
          confidence: segment.confidence,
          redacted: segment.redacted,
        },
      });
    }

    const correlations: Array<{
      provider: ProviderType;
      identifierType: string;
      identifierValue: string;
    }> = [];
    const isSimulation = call.provider === 'SIMULATION';
    const telephonyProvider = isSimulation ? 'SIMULATION' : 'TELNYX';
    const telephonyPrefix = isSimulation ? 'SIMULATION' : 'TELNYX';
    if (call.providerCallControlId)
      correlations.push({
        provider: telephonyProvider,
        identifierType: `${telephonyPrefix}_CALL_CONTROL_ID`,
        identifierValue: call.providerCallControlId,
      });
    if (call.providerCallSessionId)
      correlations.push({
        provider: telephonyProvider,
        identifierType: `${telephonyPrefix}_CALL_SESSION_ID`,
        identifierValue: call.providerCallSessionId,
      });
    if (call.providerCallLegId)
      correlations.push({
        provider: telephonyProvider,
        identifierType: `${telephonyPrefix}_CALL_LEG_ID`,
        identifierValue: call.providerCallLegId,
      });
    if (call.providerConversationId)
      correlations.push({
        provider: isSimulation ? 'SIMULATION' : 'ELEVENLABS',
        identifierType: isSimulation
          ? 'SIMULATION_CONVERSATION_ID'
          : 'ELEVENLABS_CONVERSATION_ID',
        identifierValue: call.providerConversationId,
      });
    if (correlations.length > 0) {
      await tx.conversationProviderCorrelation.createMany({
        data: correlations.map(correlation => ({
          conversationId: conversation.id,
          ...correlation,
        })),
        skipDuplicates: true,
      });
    }

    await tx.conversationState.upsert({
      where: { conversationId: conversation.id },
      create: {
        conversationId: conversation.id,
        currentIntent: call.summary?.intent,
        conversationSummary: call.summary?.summary,
      },
      update: {
        currentIntent: call.summary?.intent,
        conversationSummary: call.summary?.summary,
      },
    });

    return { synced: true, conversationId: conversation.id };
  });
}

export async function syncConversationProjectionIfEnabled(
  callId: string
): Promise<ConversationSyncResult> {
  if (!(await featureFlags.isEnabled('CONVERSATION_DUAL_WRITE_ENABLED'))) {
    return { synced: false, reason: 'DISABLED' };
  }
  return syncConversationProjection(callId);
}
