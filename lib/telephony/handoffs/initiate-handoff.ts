import 'server-only';
import { prisma } from '@/lib/database';
import { decryptSensitiveValue } from '@/lib/security/encryption';
import { normalizePhoneNumber } from '@/lib/security/identifiers';
import { TelnyxProvider } from '@/lib/telephony/providers/telnyx';

export interface HandoffInitiationResult {
  handoffId: string;
  status: 'INITIATED' | 'FAILED';
  providerTransferConfirmed: false;
}

export async function initiateConfiguredHandoff(
  handoffId: string,
  workspaceId: string,
  agentId: string,
  callId: string,
  commandId: string,
  provider: Pick<TelnyxProvider, 'transferCall'> = new TelnyxProvider()
): Promise<HandoffInitiationResult> {
  const [handoff, call, agent] = await Promise.all([
    prisma.handoff.findFirst({ where: { id: handoffId, workspaceId }, select: { id: true } }),
    prisma.call.findFirst({
      where: { id: callId, workspaceId, provider: 'TELNYX' },
      select: { providerCallControlId: true },
    }),
    prisma.voiceAgent.findFirst({
      where: { id: agentId, workspaceId },
      include: { escalationPolicy: true },
    }),
  ]);
  const encryptedTarget = agent?.escalationPolicy?.targetPhoneEnc;
  if (!handoff || !call?.providerCallControlId || !encryptedTarget) {
    return markFailed(handoffId, workspaceId, 'HANDOFF_CONFIGURATION_MISSING');
  }

  let target: string;
  try {
    target = normalizePhoneNumber(decryptSensitiveValue(encryptedTarget));
  } catch {
    return markFailed(handoffId, workspaceId, 'HANDOFF_DESTINATION_INVALID');
  }

  const accepted = await provider.transferCall(call.providerCallControlId, target, commandId);
  if (!accepted) return markFailed(handoffId, workspaceId, 'PROVIDER_TRANSFER_REJECTED');

  await prisma.handoff.update({
    where: { id: handoffId },
    data: { result: 'INITIATED', attemptCount: { increment: 1 }, transferStartedAt: new Date() },
  });
  return { handoffId, status: 'INITIATED', providerTransferConfirmed: false };
}

async function markFailed(
  handoffId: string,
  workspaceId: string,
  reason: string
): Promise<HandoffInitiationResult> {
  await prisma.$transaction([
    prisma.handoff.update({
      where: { id: handoffId },
      data: { result: 'FAILED', transferEndedAt: new Date() },
    }),
    prisma.auditLog.create({
      data: {
        workspaceId,
        action: 'HANDOFF_FAILED',
        entityType: 'HANDOFF',
        entityId: handoffId,
        metadata: { reason },
      },
    }),
  ]);
  return { handoffId, status: 'FAILED', providerTransferConfirmed: false };
}
