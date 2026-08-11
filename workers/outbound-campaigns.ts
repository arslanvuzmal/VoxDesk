import { prisma } from '@/lib/database';
import { featureFlags } from '@/lib/features/flags';
import { getCampaignReadiness } from '@/lib/telephony/outbound/campaign-readiness';
import { executeElevenLabsSipOutbound } from '@/lib/telephony/outbound/elevenlabs-sip-executor';

export type OutboundExecutionRequest = {
  attemptId: string;
  campaignId: string;
  recipientId: string;
  workspaceId: string;
  correlationId: string;
  idempotencyKey: string;
};

export type OutboundExecutionResult =
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

export type OutboundExecutor = (
  request: OutboundExecutionRequest
) => Promise<OutboundExecutionResult>;

const canonicalExecutor: OutboundExecutor = executeElevenLabsSipOutbound;

export async function claimOutboundJobs(limit = 10, now = new Date()) {
  const candidates = await prisma.backgroundJob.findMany({
    where: {
      type: 'OUTBOUND_CALL_EXECUTE',
      status: 'PENDING',
      availableAt: { lte: now },
      lockedAt: null,
    },
    orderBy: { availableAt: 'asc' },
    take: Math.min(Math.max(limit, 1), 50),
  });
  const claimed = [];
  for (const candidate of candidates) {
    if (candidate.attempt >= candidate.maxAttempts) {
      await prisma.backgroundJob.updateMany({
        where: { id: candidate.id, status: 'PENDING', lockedAt: null },
        data: { status: 'FAILED', errorCategory: 'RETRY_EXHAUSTED', completedAt: now },
      });
      continue;
    }
    const result = await prisma.backgroundJob.updateMany({
      where: {
        id: candidate.id,
        type: 'OUTBOUND_CALL_EXECUTE',
        status: 'PENDING',
        lockedAt: null,
        availableAt: { lte: now },
      },
      data: { status: 'RUNNING', lockedAt: now, attempt: { increment: 1 } },
    });
    if (result.count === 1) claimed.push({ ...candidate, status: 'RUNNING', lockedAt: now });
  }
  return claimed;
}

async function finishJob(
  jobId: string,
  status: 'COMPLETED' | 'FAILED' | 'PENDING',
  errorCategory?: string,
  availableAt?: Date
) {
  await prisma.backgroundJob.update({
    where: { id: jobId },
    data: {
      status,
      errorCategory,
      availableAt,
      lockedAt: null,
      completedAt: status === 'COMPLETED' || status === 'FAILED' ? new Date() : null,
    },
  });
}

export async function processOutboundJob(
  job: Awaited<ReturnType<typeof claimOutboundJobs>>[number],
  executor: OutboundExecutor = canonicalExecutor
): Promise<'SUCCEEDED' | 'RETRY' | 'BLOCKED'> {
  const attempt = await prisma.outboundAttempt.findFirst({
    where: { id: job.resourceId, workspaceId: job.workspaceId || undefined, status: 'QUEUED' },
    include: { campaign: true, recipient: true },
  });
  if (!attempt?.campaign || !attempt.recipient || !attempt.campaignId || !attempt.recipientId) {
    await finishJob(job.id, 'FAILED', 'NOT_FOUND');
    return 'BLOCKED';
  }
  const campaign = attempt.campaign;
  if (
    campaign.workspaceId !== attempt.workspaceId ||
    attempt.recipient.workspaceId !== attempt.workspaceId ||
    attempt.recipient.campaignId !== campaign.id ||
    campaign.approvalStatus !== 'APPROVED' ||
    !['SCHEDULED', 'RUNNING'].includes(campaign.state)
  ) {
    await finishJob(job.id, 'FAILED', 'AUTHORIZATION');
    return 'BLOCKED';
  }

  const readiness = await getCampaignReadiness(campaign.id, campaign.workspaceId);
  if (!readiness?.report.eligibleRecipientIds.includes(attempt.recipient.id)) {
    await prisma.$transaction([
      prisma.outboundAttempt.update({
        where: { id: attempt.id },
        data: { status: 'BLOCKED', outcome: 'Outbound controls blocked execution.' },
      }),
      prisma.campaignRecipient.update({
        where: { id: attempt.recipient.id },
        data: { status: 'BLOCKED' },
      }),
    ]);
    await finishJob(job.id, 'FAILED', 'COMPLIANCE_BLOCK');
    return 'BLOCKED';
  }

  const attemptClaim = await prisma.outboundAttempt.updateMany({
    where: { id: attempt.id, workspaceId: campaign.workspaceId, status: 'QUEUED' },
    data: { status: 'PROVIDER_REQUESTING' },
  });
  if (attemptClaim.count !== 1) {
    await finishJob(job.id, 'FAILED', 'CONFLICT');
    return 'BLOCKED';
  }

  let result: OutboundExecutionResult;
  try {
    result = await executor({
      attemptId: attempt.id,
      campaignId: campaign.id,
      recipientId: attempt.recipient.id,
      workspaceId: campaign.workspaceId,
      correlationId: job.correlationId,
      idempotencyKey: attempt.id,
    });
  } catch {
    result = { accepted: false, category: 'NETWORK', retryable: true };
  }
  if (!result.accepted) {
    const exhausted = job.attempt + 1 >= job.maxAttempts;
    await prisma.outboundAttempt.update({
      where: { id: attempt.id },
      data: { status: exhausted || !result.retryable ? 'FAILED' : 'QUEUED' },
    });
    await finishJob(
      job.id,
      result.retryable && !exhausted ? 'PENDING' : 'FAILED',
      result.category,
      result.retryable && !exhausted ? new Date(Date.now() + 30_000) : undefined
    );
    return result.retryable && !exhausted ? 'RETRY' : 'BLOCKED';
  }

  await prisma.$transaction([
    prisma.outboundAttempt.update({
      where: { id: attempt.id },
      data: {
        status: 'INITIATING',
        callId: result.callId,
        startedAt: new Date(),
        notes: `provider-conversation:${result.providerConversationId}`,
      },
    }),
    prisma.campaignRecipient.update({
      where: { id: attempt.recipient.id },
      data: { status: 'ACTIVE', attempts: { increment: 1 }, lastAttemptAt: new Date() },
    }),
    prisma.campaign.update({
      where: { id: campaign.id },
      data: { state: 'RUNNING', startedAt: campaign.startedAt || new Date() },
    }),
  ]);
  await finishJob(job.id, 'COMPLETED');
  return 'SUCCEEDED';
}

export async function processOutboundQueue(executor: OutboundExecutor = canonicalExecutor) {
  if (
    !(await featureFlags.isEnabled('OUTBOUND_CAMPAIGNS_ENABLED')) ||
    !(await featureFlags.isEnabled('TELNYX_OUTBOUND_ENABLED'))
  )
    return { processed: 0, succeeded: 0, retried: 0, blocked: 0 };

  const jobs = await claimOutboundJobs();
  const totals = { processed: jobs.length, succeeded: 0, retried: 0, blocked: 0 };
  for (const job of jobs) {
    const result = await processOutboundJob(job, executor);
    if (result === 'SUCCEEDED') totals.succeeded += 1;
    else if (result === 'RETRY') totals.retried += 1;
    else totals.blocked += 1;
  }
  return totals;
}

export async function startOutboundWorker(executor: OutboundExecutor = canonicalExecutor) {
  const run = () => processOutboundQueue(executor).catch(() => undefined);
  await run();
  const interval = setInterval(run, 30_000);
  process.once('SIGTERM', () => clearInterval(interval));
}

if (require.main === module) void startOutboundWorker();
