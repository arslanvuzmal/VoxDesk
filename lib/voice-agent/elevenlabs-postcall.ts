import { z } from 'zod';
import { prisma } from '@/lib/database';
import { encryptSensitiveValue } from '@/lib/security/encryption';
import { syncConversationProjection } from '@/lib/conversation/persistence';
import { reconcileOutboundAttemptFromEvent } from '@/lib/telephony/outbound/reconciliation';

const TranscriptTurnSchema = z.object({
  role: z.enum(['agent', 'user', 'human', 'system']),
  message: z.string(),
  time_in_call_secs: z.number().nonnegative().optional().default(0),
  tool_calls: z.unknown().optional(),
  tool_results: z.unknown().optional(),
});

const PostCallDataSchema = z
  .object({
    agent_id: z.string().min(1),
    conversation_id: z.string().min(1),
    version_id: z.string().nullish(),
    status: z.string().optional(),
    transcript: z.array(TranscriptTurnSchema).optional().default([]),
    metadata: z.record(z.unknown()).optional().default({}),
    analysis: z.record(z.unknown()).nullish(),
    conversation_initiation_client_data: z.record(z.unknown()).nullish(),
    failure_reason: z.string().optional(),
  })
  .passthrough();

export const ElevenLabsPostCallSchema = z.object({
  type: z.enum(['post_call_transcription', 'call_initiation_failure']),
  event_timestamp: z.number().int().positive(),
  data: PostCallDataSchema,
});

export type ElevenLabsPostCall = z.infer<typeof ElevenLabsPostCallSchema>;

export interface ElevenLabsIngestResult {
  providerEventRecordId: string;
  providerEventId: string;
  jobId?: string;
  correlationId: string;
  duplicate: boolean;
}

export function getElevenLabsProviderEventId(event: ElevenLabsPostCall): string {
  return `${event.type}:${event.data.conversation_id}:${event.event_timestamp}`;
}

export async function ingestElevenLabsPostCall(
  rawBody: string,
  event: ElevenLabsPostCall
): Promise<ElevenLabsIngestResult> {
  const providerEventId = getElevenLabsProviderEventId(event);
  const correlationId = `elevenlabs_${event.data.conversation_id}`;
  try {
    return await prisma.$transaction(async tx => {
      const providerEvent = await tx.providerEvent.create({
        data: {
          provider: 'ELEVENLABS',
          providerEventId,
          eventType: event.type,
          occurredAt: new Date(event.event_timestamp * 1000),
          processingState: 'PENDING',
          safePayload: {
            conversationId: event.data.conversation_id,
            agentId: event.data.agent_id,
            versionId: event.data.version_id || null,
            status: event.data.status || null,
            failureReason: event.data.failure_reason || null,
            transcriptTurnCount: event.data.transcript.length,
          },
          encryptedPayload: encryptSensitiveValue(rawBody),
          correlationId,
        },
      });
      const job = await tx.backgroundJob.create({
        data: {
          type: 'ELEVENLABS_POSTCALL_PROCESS',
          resourceType: 'PROVIDER_EVENT',
          resourceId: providerEvent.id,
          status: 'PENDING',
          maxAttempts: 5,
          correlationId,
        },
      });
      return {
        providerEventRecordId: providerEvent.id,
        providerEventId,
        jobId: job.id,
        correlationId,
        duplicate: false,
      };
    });
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
      const existing = await prisma.providerEvent.findUnique({
        where: {
          provider_providerEventId: { provider: 'ELEVENLABS', providerEventId },
        },
        select: { id: true, correlationId: true },
      });
      if (existing) {
        return {
          providerEventRecordId: existing.id,
          providerEventId,
          correlationId: existing.correlationId,
          duplicate: true,
        };
      }
    }
    throw error;
  }
}

function nestedString(value: unknown, path: string[]): string | undefined {
  let current: unknown = value;
  for (const key of path) {
    if (!current || typeof current !== 'object' || !(key in current)) return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return typeof current === 'string' && current.length > 0 ? current : undefined;
}

async function resolveCall(event: ElevenLabsPostCall) {
  const conversationId = event.data.conversation_id;
  const direct = await prisma.call.findFirst({
    where: { providerConversationId: conversationId },
  });
  if (direct) return direct;

  const correlation = await prisma.conversationProviderCorrelation.findUnique({
    where: {
      provider_identifierType_identifierValue: {
        provider: 'ELEVENLABS',
        identifierType: 'ELEVENLABS_CONVERSATION_ID',
        identifierValue: conversationId,
      },
    },
    include: { conversation: { include: { call: true } } },
  });
  if (correlation?.conversation.call) return correlation.conversation.call;

  const initiation = event.data.conversation_initiation_client_data;
  const dynamicCallId =
    nestedString(initiation, ['dynamic_variables', 'voxdesk_call_id']) ||
    nestedString(initiation, ['dynamic_variables', 'callId']);
  if (dynamicCallId) {
    const byId = await prisma.call.findUnique({ where: { id: dynamicCallId } });
    if (byId) return byId;
  }

  const sipCallId =
    nestedString(event.data.metadata, ['sip_call_id']) ||
    nestedString(event.data.metadata, ['phone_call', 'sip_call_id']);
  if (sipCallId) {
    return prisma.call.findFirst({
      where: {
        OR: [
          { providerCallControlId: sipCallId },
          { providerCallSessionId: sipCallId },
          { providerCallLegId: sipCallId },
        ],
      },
    });
  }
  return null;
}

async function resolveConversation(event: ElevenLabsPostCall) {
  const conversationId = event.data.conversation_id;
  const direct = await prisma.conversation.findFirst({
    where: { providerConversationId: conversationId },
    select: { id: true, workspaceId: true, startedAt: true },
  });
  if (direct) return direct;

  const initiation = event.data.conversation_initiation_client_data;
  const dynamicConversationId = nestedString(initiation, [
    'dynamic_variables',
    'voxdesk_conversation_id',
  ]);
  if (dynamicConversationId) {
    return prisma.conversation.findFirst({
      where: { id: dynamicConversationId },
      select: { id: true, workspaceId: true, startedAt: true },
    });
  }

  const correlation = await prisma.conversationProviderCorrelation.findUnique({
    where: {
      provider_identifierType_identifierValue: {
        provider: 'ELEVENLABS',
        identifierType: 'ELEVENLABS_CONVERSATION_ID',
        identifierValue: conversationId,
      },
    },
    select: { conversation: { select: { id: true, workspaceId: true, startedAt: true } } },
  });
  return correlation?.conversation || null;
}

async function reconcileStandaloneConversation(
  event: ElevenLabsPostCall,
  providerEventId: string,
  conversation: { id: string; workspaceId: string; startedAt: Date }
): Promise<void> {
  const failed = event.type === 'call_initiation_failure';
  const durationSeconds = getDurationSeconds(event);
  const summary = getProviderSummary(event);

  await prisma.$transaction(async tx => {
    for (const [index, turn] of event.data.transcript.entries()) {
      const startedAt = new Date(conversation.startedAt.getTime() + turn.time_in_call_secs * 1000);
      const nextTurn = event.data.transcript[index + 1];
      const endedAt = nextTurn
        ? new Date(conversation.startedAt.getTime() + nextTurn.time_in_call_secs * 1000)
        : new Date(event.event_timestamp * 1000);
      await tx.conversationMessage.upsert({
        where: {
          conversationId_sequence: { conversationId: conversation.id, sequence: index + 1 },
        },
        create: {
          conversationId: conversation.id,
          speaker:
            turn.role === 'agent'
              ? 'AGENT'
              : turn.role === 'human'
                ? 'HUMAN'
                : turn.role === 'system'
                  ? 'SYSTEM'
                  : 'CUSTOMER',
          type: 'TRANSCRIPT',
          text: turn.message,
          providerEventId,
          sequence: index + 1,
          startedAt,
          endedAt,
          redacted: false,
        },
        update: { text: turn.message, providerEventId, startedAt, endedAt },
      });
    }

    await tx.conversation.update({
      where: { id: conversation.id },
      data: {
        status: failed ? 'FAILED' : 'COMPLETED',
        provider: 'ELEVENLABS',
        providerConversationId: event.data.conversation_id,
        summary,
        endedAt: new Date(event.event_timestamp * 1000),
        durationSeconds: durationSeconds ?? undefined,
        completenessStatus: 'NEEDS_REVIEW',
        requiresReview: true,
      },
    });
    await tx.conversationProviderCorrelation.createMany({
      data: [
        {
          conversationId: conversation.id,
          provider: 'ELEVENLABS',
          identifierType: 'ELEVENLABS_CONVERSATION_ID',
          identifierValue: event.data.conversation_id,
        },
      ],
      skipDuplicates: true,
    });
  });
}

function getDurationSeconds(event: ElevenLabsPostCall): number | null {
  const metadataDuration = event.data.metadata.call_duration_secs;
  if (typeof metadataDuration === 'number' && metadataDuration >= 0) {
    return Math.round(metadataDuration);
  }
  if (event.data.transcript.length === 0) return null;
  return Math.ceil(Math.max(...event.data.transcript.map(turn => turn.time_in_call_secs || 0)));
}

function getProviderSummary(event: ElevenLabsPostCall): string | undefined {
  const summary = event.data.analysis?.transcript_summary;
  return typeof summary === 'string' && summary.trim() ? summary.trim() : undefined;
}

function getProviderAnalysisField(
  event: ElevenLabsPostCall,
  key: 'intent' | 'sentiment' | 'urgency'
): string {
  const value = event.data.analysis?.[key];
  return typeof value === 'string' && value.trim() ? value.trim() : 'Not provided';
}

export async function reconcileElevenLabsPostCall(
  event: ElevenLabsPostCall,
  providerEventId: string
): Promise<{ workspaceId?: string; callId?: string; resolved: boolean }> {
  const call = await resolveCall(event);
  if (!call) {
    const conversation = await resolveConversation(event);
    if (!conversation) return { resolved: false };
    await reconcileStandaloneConversation(event, providerEventId, conversation);
    return { workspaceId: conversation.workspaceId, resolved: true };
  }

  const durationSeconds = getDurationSeconds(event);
  const summary = getProviderSummary(event);
  const failed = event.type === 'call_initiation_failure';
  await prisma.call.update({
    where: { id: call.id },
    data: {
      providerConversationId: event.data.conversation_id,
      status: failed ? 'FAILED' : 'COMPLETED',
      terminationReason: failed ? 'AGENT_FAILURE' : call.terminationReason,
      endedAt: call.endedAt || new Date(event.event_timestamp * 1000),
      durationSeconds: durationSeconds ?? call.durationSeconds,
      summary: summary
        ? {
            upsert: {
              create: {
                summary,
                intent: getProviderAnalysisField(event, 'intent'),
                sentiment: getProviderAnalysisField(event, 'sentiment'),
                urgency: getProviderAnalysisField(event, 'urgency'),
                actionItems: {},
                commitments: {},
              },
              update: { summary },
            },
          }
        : undefined,
    },
  });

  if (call.direction === 'OUTBOUND') {
    await reconcileOutboundAttemptFromEvent({
      callId: call.id,
      workspaceId: call.workspaceId,
      state: failed ? 'FAILED' : 'COMPLETED',
      occurredAt: new Date(event.event_timestamp * 1000),
      terminationReason: failed ? 'FAILED_AGENT' : call.terminationReason || undefined,
    });
  }

  const projected = await syncConversationProjection(call.id);
  if (!projected.synced || !projected.conversationId) {
    return { workspaceId: call.workspaceId, callId: call.id, resolved: true };
  }
  const conversationId = projected.conversationId;
  await prisma.$transaction(async tx => {
    if (!failed) {
      for (const [index, turn] of event.data.transcript.entries()) {
        const startedAt = new Date(call.startedAt.getTime() + turn.time_in_call_secs * 1000);
        const nextTurn = event.data.transcript[index + 1];
        const endedAt = nextTurn
          ? new Date(call.startedAt.getTime() + nextTurn.time_in_call_secs * 1000)
          : call.endedAt;
        await tx.conversationMessage.upsert({
          where: { conversationId_sequence: { conversationId, sequence: index + 1 } },
          create: {
            conversationId,
            speaker:
              turn.role === 'agent'
                ? 'AGENT'
                : turn.role === 'human'
                  ? 'HUMAN'
                  : turn.role === 'system'
                    ? 'SYSTEM'
                    : 'CUSTOMER',
            type: 'TRANSCRIPT',
            text: turn.message,
            providerEventId,
            sequence: index + 1,
            startedAt,
            endedAt,
            redacted: false,
          },
          update: {
            text: turn.message,
            providerEventId,
            startedAt,
            endedAt,
          },
        });
      }
      await tx.conversationMessage.deleteMany({
        where: {
          conversationId,
          type: 'TRANSCRIPT',
          sequence: { gt: event.data.transcript.length },
        },
      });
    }
    await tx.conversation.update({
      where: { id: conversationId },
      data: {
        status: failed ? 'FAILED' : 'COMPLETED',
        provider: 'ELEVENLABS',
        providerConversationId: event.data.conversation_id,
        summary,
        endedAt: call.endedAt || new Date(event.event_timestamp * 1000),
        durationSeconds,
        completenessStatus: 'NEEDS_REVIEW',
        requiresReview: true,
      },
    });
    await tx.conversationProviderCorrelation.createMany({
      data: [
        {
          conversationId,
          provider: 'ELEVENLABS',
          identifierType: 'ELEVENLABS_CONVERSATION_ID',
          identifierValue: event.data.conversation_id,
        },
        ...(event.data.version_id
          ? [
              {
                conversationId,
                provider: 'ELEVENLABS' as const,
                identifierType: 'ELEVENLABS_VERSION_ID',
                identifierValue: event.data.version_id,
              },
            ]
          : []),
      ],
      skipDuplicates: true,
    });
  });
  return { workspaceId: call.workspaceId, callId: call.id, resolved: true };
}

export async function markElevenLabsJobRunning(
  jobId: string,
  providerEventRecordId: string
): Promise<void> {
  await prisma.$transaction([
    prisma.backgroundJob.update({
      where: { id: jobId },
      data: { status: 'RUNNING', lockedAt: new Date(), attempt: { increment: 1 } },
    }),
    prisma.providerEvent.update({
      where: { id: providerEventRecordId },
      data: { processingState: 'PROCESSING' },
    }),
  ]);
}

export async function markElevenLabsJobCompleted(
  jobId: string,
  providerEventRecordId: string,
  workspaceId?: string
): Promise<void> {
  const completedAt = new Date();
  await prisma.$transaction([
    prisma.backgroundJob.update({
      where: { id: jobId },
      data: { status: 'COMPLETED', workspaceId, completedAt, lockedAt: null },
    }),
    prisma.providerEvent.update({
      where: { id: providerEventRecordId },
      data: { processingState: 'PROCESSED', workspaceId, processedAt: completedAt },
    }),
  ]);
}

export async function markElevenLabsJobFailed(
  jobId: string,
  providerEventRecordId: string,
  errorCategory = 'UNKNOWN'
): Promise<void> {
  const job = await prisma.backgroundJob.findUnique({
    where: { id: jobId },
    select: { attempt: true, maxAttempts: true },
  });
  const exhausted = !job || job.attempt >= job.maxAttempts;
  await prisma.$transaction([
    prisma.backgroundJob.update({
      where: { id: jobId },
      data: {
        status: exhausted ? 'DEAD_LETTER' : 'RETRYABLE',
        errorCategory,
        lockedAt: null,
        availableAt: new Date(Date.now() + 30_000),
      },
    }),
    prisma.providerEvent.update({
      where: { id: providerEventRecordId },
      data: { processingState: 'FAILED', errorCategory },
    }),
  ]);
}
