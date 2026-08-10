import 'server-only';
import { prisma } from '@/lib/database';

export type ProviderHandoffState =
  | 'HUMAN_TRANSFER_PENDING'
  | 'HUMAN_CONNECTED'
  | 'FAILED'
  | 'CANCELLED';

export async function projectProviderHandoffState(
  callId: string,
  workspaceId: string,
  state: ProviderHandoffState,
  occurredAt: Date
): Promise<void> {
  const handoff = await prisma.handoff.findFirst({
    where: { callId, workspaceId, result: { in: ['REQUESTED', 'INITIATED', 'RINGING'] } },
    orderBy: { createdAt: 'desc' },
    select: { id: true, result: true },
  });
  if (!handoff) return;

  if (state === 'HUMAN_TRANSFER_PENDING') {
    await prisma.handoff.update({
      where: { id: handoff.id },
      data: {
        result: 'RINGING',
        attemptCount: { increment: handoff.result === 'REQUESTED' ? 1 : 0 },
        transferStartedAt: occurredAt,
      },
    });
    return;
  }

  const connected = state === 'HUMAN_CONNECTED';
  await prisma.$transaction([
    prisma.handoff.update({
      where: { id: handoff.id },
      data: {
        result: connected ? 'CONNECTED' : 'FAILED',
        transferEndedAt: occurredAt,
      },
    }),
    prisma.auditLog.create({
      data: {
        workspaceId,
        action: connected ? 'HANDOFF_COMPLETED' : 'HANDOFF_FAILED',
        entityType: 'HANDOFF',
        entityId: handoff.id,
        metadata: { providerConfirmed: true, state },
      },
    }),
  ]);
}

