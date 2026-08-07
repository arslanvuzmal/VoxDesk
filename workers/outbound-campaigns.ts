import { prisma } from '@/lib/database';
import { outboundHandler } from '@/lib/telephony/outbound';
import { featureFlags } from '@/lib/features/flags';

interface QueuedAttempt {
  id: string;
  workspaceId: string;
  campaignId: string | null;
  recipientId: string | null;
  status: string;
  direction: string;
  startedAt: Date | null;
  endedAt: Date | null;
  durationSeconds: number;
  terminationReason: string | null;
  recordingConsent: boolean;
  outcome: string | null;
  notes: string | null;
  attemptNumber: number;
  createdAt: Date;
  updatedAt: Date;
  campaign?: {
    id: string;
    workspaceId: string;
    businessId: string | null;
    name: string;
    workflowType: string;
    agentId: string;
    agentVersionId: string | null;
    language: string;
    callerId: string | null;
    targetSegment: string | null;
    callingWindowStart: string | null;
    callingWindowEnd: string | null;
    timezoneStrategy: string;
    maxAttempts: number;
    retryIntervalMinutes: number;
    concurrencyLimit: number;
    callsPerMinute: number;
    approvalStatus: string;
    dryRunCompleted: boolean;
    dryRunReport: any;
    state: string;
    createdBy: string | null;
    approvedBy: string | null;
    approvedAt: Date | null;
    startedAt: Date | null;
    pausedAt: Date | null;
    completedAt: Date | null;
    cancelledAt: Date | null;
    failedReason: string | null;
    openingDisclosure: string | null;
    createdAt: Date;
    updatedAt: Date;
  } | null;
  recipient?: {
    id: string;
    workspaceId: string | null;
    campaignId: string;
    contactId: string | null;
    recipientName: string | null;
    recipientPhoneEncrypted: string | null;
    recipientPhoneHash: string | null;
    recipientEmailEncrypted: string | null;
    countryCode: string;
    status: string;
    attempts: number;
    lastAttemptAt: Date | null;
    completedAt: Date | null;
    outcome: string | null;
    optOutRequested: boolean;
    optOutAt: Date | null;
    suppressedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    campaign: {
      id: string;
      workspaceId: string;
      businessId: string | null;
      name: string;
      workflowType: string;
      agentId: string;
      agentVersionId: string | null;
      language: string;
      callerId: string | null;
      targetSegment: string | null;
      callingWindowStart: string | null;
      callingWindowEnd: string | null;
      timezoneStrategy: string;
      maxAttempts: number;
      retryIntervalMinutes: number;
      concurrencyLimit: number;
      callsPerMinute: number;
      approvalStatus: string;
      dryRunCompleted: boolean;
      dryRunReport: any;
      state: string;
      createdBy: string | null;
      approvedBy: string | null;
      approvedAt: Date | null;
      startedAt: Date | null;
      pausedAt: Date | null;
      completedAt: Date | null;
      cancelledAt: Date | null;
      failedReason: string | null;
      openingDisclosure: string | null;
      createdAt: Date;
      updatedAt: Date;
    } | null;
    workspace: {
      id: string;
      name: string;
      slug: string;
      industry: string;
      timezone: string;
      plan: string;
      status: string;
      createdAt: Date;
      updatedAt: Date;
    } | null;
  } | null;
}

export async function processOutboundQueue(): Promise<{
  processed: number;
  succeeded: number;
  failed: number;
}> {
  const campaignsEnabled = await featureFlags.isEnabled('OUTBOUND_CAMPAIGNS_ENABLED');
  const outboundEnabled = await featureFlags.isEnabled('TELNYX_OUTBOUND_ENABLED');

  if (!outboundEnabled || !campaignsEnabled) {
    return { processed: 0, succeeded: 0, failed: 0 };
  }

  let processed = 0;
  let succeeded = 0;
  let failed = 0;

  const now = new Date();
  const batchSize = 10;

  const queuedAttempts = await prisma.outboundAttempt.findMany({
    where: {
      status: 'PENDING',
      startedAt: { lte: now },
      attemptNumber: { lt: 3 }, // Default max attempts
    },
    take: batchSize,
    orderBy: { startedAt: 'asc' },
    include: {
      campaign: true,
      recipient: true,
    },
  });

  for (const attempt of queuedAttempts) {
    try {
      if (!attempt.campaign || attempt.campaign.state !== 'RUNNING') {
        await prisma.outboundAttempt.update({
          where: { id: attempt.id },
          data: { status: 'FAILED', outcome: 'Campaign not running' },
        });
        failed++;
        continue;
      }

      const campaign = attempt.campaign;

      if (
        campaign.callingWindowStart &&
        campaign.callingWindowEnd &&
        campaign.timezoneStrategy === 'LOCAL'
      ) {
        const recipientTimeZone =
          campaign.timezoneStrategy === 'LOCAL' ? 'America/New_York' : 'UTC';
        if (
          !isWithinCallingWindow(
            campaign.callingWindowStart,
            campaign.callingWindowEnd,
            recipientTimeZone
          )
        ) {
          await prisma.outboundAttempt.update({
            where: { id: attempt.id },
            data: {
              status: 'PENDING',
              startedAt: calculateNextWindow(
                campaign.callingWindowStart,
                campaign.callingWindowEnd
              ),
            },
          });
          continue;
        }
      }

      const consent = await prisma.consentRecord.findFirst({
        where: {
          contactId: attempt.recipientId,
          consentType: 'OUTBOUND_CALL',
          consentStatus: 'GRANTED',
          revokedAt: null,
        },
      });

      if (!consent) {
        await prisma.outboundAttempt.update({
          where: { id: attempt.id },
          data: { status: 'FAILED', outcome: 'Consent missing' },
        });
        failed++;
        continue;
      }

      const suppression = await prisma.suppressionEntry.findFirst({
        where: {
          workspaceId: campaign.workspaceId,
          phoneHash: attempt.recipient?.recipientPhoneHash || '',
          expiresAt: { gte: new Date() },
        },
      });

      if (suppression) {
        await prisma.outboundAttempt.update({
          where: { id: attempt.id },
          data: { status: 'FAILED', outcome: 'Suppressed' },
        });
        await prisma.campaignRecipient.update({
          where: { id: attempt.recipientId! },
          data: { status: 'SUPPRESSED' },
        });
        failed++;
        continue;
      }

      const result = await outboundHandler.initiateOutboundCall({
        workspaceId: campaign.workspaceId,
        businessId: campaign.businessId || '',
        agentId: campaign.agentId,
        agentVersionId: campaign.agentVersionId || '',
        toNumber: attempt.recipient?.recipientPhoneEncrypted || '',
        fromNumber: campaign.callerId || '',
        workflowType: campaign.workflowType as any,
        language: campaign.language,
        trainingPackVersion: 1,
        contactId: attempt.recipient?.contactId ?? undefined,
        campaignId: campaign.id,
        openingDisclosure: campaign.openingDisclosure ?? undefined,
        maxAttempts: campaign.maxAttempts,
        retryIntervalMinutes: campaign.retryIntervalMinutes,
        callingWindowStart: campaign.callingWindowStart ?? undefined,
        callingWindowEnd: campaign.callingWindowEnd ?? undefined,
        timeZone: campaign.timezoneStrategy === 'LOCAL' ? 'America/New_York' : undefined,
      });

      if (result.success) {
        await prisma.outboundAttempt.update({
          where: { id: attempt.id },
          data: {
            status: 'DIALING',
            attemptNumber: { increment: 1 },
            startedAt: new Date(),
          },
        });
        succeeded++;
      } else {
        await handleFailedAttempt(attempt, campaign, result.blockedReason || 'UNKNOWN');
        failed++;
      }
    } catch (error) {
      console.error('[OUTBOUND WORKER] Error processing attempt:', error);
      await prisma.outboundAttempt.update({
        where: { id: attempt.id },
        data: {
          status: 'FAILED',
          outcome: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      failed++;
    }

    processed++;
  }

  return { processed, succeeded, failed };
}

function isWithinCallingWindow(start: string, end: string, timeZone: string): boolean {
  try {
    const now = new Date();
    const tzOffset = getTimezoneOffset(timeZone);
    const localNow = new Date(now.getTime() + tzOffset * 60 * 1000);
    const currentMinutes = localNow.getHours() * 60 + localNow.getMinutes();

    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    if (startMinutes <= endMinutes) {
      return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
    } else {
      return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
    }
  } catch {
    return true;
  }
}

function getTimezoneOffset(timeZone: string): number {
  try {
    const date = new Date();
    const utc = date.toLocaleString('en-US', { timeZone: 'UTC', hour12: false });
    const local = date.toLocaleString('en-US', { timeZone, hour12: false });
    return (new Date(local).getTime() - new Date(utc).getTime()) / (1000 * 60);
  } catch {
    return 0;
  }
}

function calculateNextWindow(start: string, end: string): Date {
  const now = new Date();
  const [startHour, startMin] = start.split(':').map(Number);
  const next = new Date(now);
  next.setHours(startHour, startMin, 0, 0);
  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }
  return next;
}

async function handleFailedAttempt(attempt: any, campaign: any, reason: string): Promise<void> {
  const nextAttemptNumber = attempt.attemptNumber + 1;
  const maxAttempts = campaign.maxAttempts || 3;
  const retryInterval = campaign.retryIntervalMinutes || 60;

  if (nextAttemptNumber >= maxAttempts) {
    await prisma.outboundAttempt.update({
      where: { id: attempt.id },
      data: { status: 'FAILED', outcome: `Max attempts reached: ${reason}` },
    });
    await prisma.campaignRecipient.update({
      where: { id: attempt.recipientId },
      data: { status: 'FAILED' },
    });
  } else {
    const nextAttemptAt = new Date(Date.now() + retryInterval * 60 * 1000);
    await prisma.outboundAttempt.update({
      where: { id: attempt.id },
      data: {
        status: 'PENDING',
        attemptNumber: nextAttemptNumber,
        startedAt: nextAttemptAt,
      },
    });
  }
}

export async function startOutboundWorker(): Promise<void> {
  console.log('[OUTBOUND WORKER] Starting outbound call worker...');

  const interval = setInterval(async () => {
    try {
      const result = await processOutboundQueue();
      if (result.processed > 0) {
        console.log('[OUTBOUND WORKER] Batch processed:', result);
      }
    } catch (error) {
      console.error('[OUTBOUND WORKER] Error:', error);
    }
  }, 30000);

  process.on('SIGTERM', () => {
    clearInterval(interval);
    console.log('[OUTBOUND WORKER] Stopped');
    process.exit(0);
  });
}

if (require.main === module) {
  startOutboundWorker().catch(console.error);
}
