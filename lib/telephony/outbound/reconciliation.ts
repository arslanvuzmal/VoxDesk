import { prisma } from '@/lib/database';
import { releaseCallLeases } from '@/lib/telephony/concurrency';

const TERMINAL_STATES = new Set([
  'COMPLETED',
  'BUSY',
  'NO_ANSWER',
  'VOICEMAIL',
  'REJECTED',
  'CANCELLED',
  'FAILED',
]);

function recipientState(state: string): string {
  switch (state) {
    case 'RINGING':
      return 'RINGING';
    case 'ANSWERED':
    case 'AGENT_CONNECTING':
    case 'ACTIVE':
      return 'ANSWERED';
    case 'COMPLETED':
      return 'COMPLETED';
    case 'BUSY':
      return 'BUSY';
    case 'NO_ANSWER':
      return 'NO_ANSWER';
    case 'VOICEMAIL':
      return 'VOICEMAIL';
    case 'REJECTED':
    case 'CANCELLED':
    case 'FAILED':
      return 'FAILED';
    default:
      return 'ACTIVE';
  }
}

export async function reconcileOutboundAttemptFromEvent(params: {
  callId: string;
  workspaceId: string;
  state: string;
  occurredAt: Date;
  terminationReason?: string;
}): Promise<void> {
  const attempt = await prisma.outboundAttempt.findFirst({
    where: { callId: params.callId, workspaceId: params.workspaceId },
    select: {
      id: true,
      campaignId: true,
      recipientId: true,
      startedAt: true,
    },
  });
  if (!attempt) return;

  const terminal = TERMINAL_STATES.has(params.state);
  const attemptStatus = terminal
    ? params.state === 'COMPLETED'
      ? 'COMPLETED'
      : 'FAILED'
    : params.state === 'RINGING'
      ? 'RINGING'
      : params.state === 'ANSWERED' || params.state === 'ACTIVE'
        ? 'ACTIVE'
        : 'INITIATING';

  await prisma.$transaction(async tx => {
    await tx.outboundAttempt.update({
      where: { id: attempt.id },
      data: {
        status: attemptStatus,
        startedAt: attempt.startedAt || params.occurredAt,
        endedAt: terminal ? params.occurredAt : undefined,
        terminationReason: terminal ? params.terminationReason || params.state : undefined,
      },
    });
    if (attempt.recipientId) {
      await tx.campaignRecipient.update({
        where: { id: attempt.recipientId },
        data: {
          status: recipientState(params.state),
          completedAt: terminal ? params.occurredAt : undefined,
          outcome: terminal ? params.terminationReason || params.state : undefined,
        },
      });
    }
  });

  if (!terminal) return;

  const activeLeases = await prisma.callConcurrencyLease.findMany({
    where: { callId: params.callId, status: 'ACTIVE', releasedAt: null },
    select: { id: true },
  });
  await releaseCallLeases(
    params.callId,
    activeLeases.map(lease => lease.id)
  );

  if (!attempt.campaignId) return;
  const remaining = await prisma.campaignRecipient.count({
    where: {
      campaignId: attempt.campaignId,
      status: { in: ['PENDING', 'QUEUED', 'ACTIVE', 'RINGING', 'ANSWERED'] },
    },
  });
  if (remaining === 0) {
    await prisma.campaign.updateMany({
      where: {
        id: attempt.campaignId,
        workspaceId: params.workspaceId,
        state: 'RUNNING',
      },
      data: { state: 'COMPLETED', completedAt: params.occurredAt },
    });
  }
}
