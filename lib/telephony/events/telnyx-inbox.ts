import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/database';
import type { WebhookEventPayload } from '@/lib/telephony/contracts';
import { encryptSensitiveValue, maskPhone } from '@/lib/security/encryption';

export type IdentifiedTelnyxEvent = WebhookEventPayload & { providerEventId: string };

export interface TelnyxIngestResult {
  providerEventRecordId: string;
  jobId?: string;
  correlationId: string;
  duplicate: boolean;
}

function safePayload(event: IdentifiedTelnyxEvent): Prisma.InputJsonObject {
  return {
    direction: event.direction,
    callState: event.callState,
    terminationReason: event.terminationReason || null,
    fromMasked: event.fromNumber ? maskPhone(event.fromNumber) : null,
    toMasked: event.toNumber ? maskPhone(event.toNumber) : null,
  };
}

export async function ingestTelnyxEvent(event: IdentifiedTelnyxEvent): Promise<TelnyxIngestResult> {
  const correlationId = `telnyx_${event.providerEventId}`;
  try {
    return await prisma.$transaction(async tx => {
      const providerEvent = await tx.providerEvent.create({
        data: {
          provider: 'TELNYX',
          providerEventId: event.providerEventId,
          eventType: event.eventType,
          occurredAt: event.timestamp,
          providerCallControlId: event.providerCallControlId,
          providerCallSessionId: event.providerCallSessionId,
          providerCallLegId: event.providerCallLegId,
          connectionId: event.connectionId,
          processingState: 'PENDING',
          safePayload: safePayload(event),
          encryptedPayload: encryptSensitiveValue(JSON.stringify(event.rawPayload)),
          correlationId,
        },
      });
      const job = await tx.backgroundJob.create({
        data: {
          type: 'TELNYX_EVENT_PROCESS',
          resourceType: 'PROVIDER_EVENT',
          resourceId: providerEvent.id,
          status: 'PENDING',
          maxAttempts: 5,
          correlationId,
        },
      });
      return {
        providerEventRecordId: providerEvent.id,
        jobId: job.id,
        correlationId,
        duplicate: false,
      };
    });
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
      const existing = await prisma.providerEvent.findUnique({
        where: {
          provider_providerEventId: { provider: 'TELNYX', providerEventId: event.providerEventId },
        },
        select: { id: true, correlationId: true },
      });
      if (existing) {
        return {
          providerEventRecordId: existing.id,
          correlationId: existing.correlationId,
          duplicate: true,
        };
      }
    }
    throw error;
  }
}

export async function markTelnyxJobRunning(jobId: string, providerEventId: string): Promise<void> {
  await prisma.$transaction([
    prisma.backgroundJob.update({
      where: { id: jobId },
      data: { status: 'RUNNING', lockedAt: new Date(), attempt: { increment: 1 } },
    }),
    prisma.providerEvent.update({
      where: { id: providerEventId },
      data: { processingState: 'PROCESSING' },
    }),
  ]);
}

export async function markTelnyxJobCompleted(
  jobId: string,
  providerEventId: string,
  workspaceId?: string
): Promise<void> {
  const completedAt = new Date();
  await prisma.$transaction([
    prisma.backgroundJob.update({
      where: { id: jobId },
      data: { status: 'COMPLETED', workspaceId, completedAt, lockedAt: null },
    }),
    prisma.providerEvent.update({
      where: { id: providerEventId },
      data: { processingState: 'PROCESSED', workspaceId, processedAt: completedAt },
    }),
  ]);
}

export async function markTelnyxJobFailed(jobId: string, providerEventId: string): Promise<void> {
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
        errorCategory: 'UNKNOWN',
        lockedAt: null,
        availableAt: new Date(Date.now() + 30_000),
      },
    }),
    prisma.providerEvent.update({
      where: { id: providerEventId },
      data: { processingState: 'FAILED', errorCategory: 'UNKNOWN' },
    }),
  ]);
}

