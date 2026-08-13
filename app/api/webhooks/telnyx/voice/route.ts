import { after, NextRequest, NextResponse } from 'next/server';
import { TelnyxProvider } from '@/lib/telephony/providers/telnyx';
import { CallStateMachine, CallContext } from '@/lib/telephony/call-state-machine';
import { prisma } from '@/lib/database';
import { env } from '@/lib/config/env';
import { syncConversationProjectionIfEnabled } from '@/lib/conversation/persistence';
import type { IdentifiedTelnyxEvent } from '@/lib/telephony/events/telnyx-inbox';
import { queueTelnyxEvent } from '@/lib/telephony/events/telnyx-handler';
import { isOutOfOrderEvent, resolveCallContext } from '@/lib/telephony/events/telnyx-routing';
import { projectProviderHandoffState } from '@/lib/telephony/handoffs/project-handoff-event';
import { reconcileOutboundAttemptFromEvent } from '@/lib/telephony/outbound/reconciliation';

const telnyxProvider = new TelnyxProvider();

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();

    const headersObj: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      headersObj[key.toLowerCase()] = value;
    });

    const isValid = await telnyxProvider.verifyWebhook(headersObj, rawBody);

    if (!isValid) {
      console.warn('[TELNYX WEBHOOK] Invalid signature');
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
    }

    let parsedBody: Record<string, unknown> = {};
    try {
      parsedBody = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const parsedEvent = telnyxProvider.parseWebhookEvent(parsedBody);
    const event = parsedEvent as IdentifiedTelnyxEvent;
    if (!event.providerEventId) {
      return NextResponse.json({ error: 'Provider event ID is required' }, { status: 400 });
    }

    return queueTelnyxEvent(event, after, processTelnyxEvent);
  } catch (error) {
    console.error('[TELNYX WEBHOOK ERROR]', error);
    return NextResponse.json({ error: 'Webhook processing error' }, { status: 500 });
  }
}

async function processTelnyxEvent(
  event: IdentifiedTelnyxEvent
): Promise<{ workspaceId?: string; outOfOrder?: boolean }> {
  const callContext = await resolveCallContext(event);
  if (!callContext) return {};

  const latestEvent = await prisma.callEvent.findFirst({
    where: { callId: callContext.id },
    orderBy: { occurredAt: 'desc' },
    select: { occurredAt: true },
  });
  if (isOutOfOrderEvent(event.timestamp, latestEvent?.occurredAt)) {
    return { workspaceId: callContext.workspaceId, outOfOrder: true };
  }

  const machine = new CallStateMachine(callContext);
  machine.transitionTo(event.callState, {
    type: event.eventType,
    payload: {
      direction: event.direction,
      callState: event.callState,
      terminationReason: event.terminationReason,
      timestamp: event.timestamp.toISOString(),
    },
    providerEventId: event.providerEventId,
  });
  if (event.terminationReason) machine.setTerminationReason(event.terminationReason);
  await persistCallState(machine.getContext());
  if (callContext.direction === 'OUTBOUND') {
    await reconcileOutboundAttemptFromEvent({
      callId: callContext.id,
      workspaceId: callContext.workspaceId,
      state: event.callState,
      occurredAt: event.timestamp,
      terminationReason: event.terminationReason,
    });
  }
  if (
    ['HUMAN_TRANSFER_PENDING', 'HUMAN_CONNECTED', 'FAILED', 'CANCELLED'].includes(event.callState)
  ) {
    await projectProviderHandoffState(
      callContext.id,
      callContext.workspaceId,
      event.callState as 'HUMAN_TRANSFER_PENDING' | 'HUMAN_CONNECTED' | 'FAILED' | 'CANCELLED',
      event.timestamp
    );
  }
  if (isTerminalState(event.callState)) await finalizeCall(machine.getContext());
  return { workspaceId: callContext.workspaceId };
}

async function persistCallState(context: CallContext): Promise<void> {
  try {
    await prisma.call.update({
      where: { id: context.id },
      data: {
        providerCallControlId: context.providerCallControlId,
        providerCallSessionId: context.providerCallSessionId,
        providerCallLegId: context.providerCallLegId,
        status: context.state as any,
        answeredAt: context.answeredAt,
        endedAt: context.endedAt,
        durationSeconds: context.durationSeconds,
        terminationReason: context.terminationReason as any,
        outcome: context.outcome as any,
        updatedAt: new Date(),
      },
    });

    for (const event of context.events) {
      const existing = await prisma.callEvent.findFirst({
        where: { callId: context.id, sequence: context.events.indexOf(event) + 1 },
      });

      if (!existing) {
        await prisma.callEvent.create({
          data: {
            callId: context.id,
            eventType: event.eventType,
            sequence: context.events.indexOf(event) + 1,
            occurredAt: event.providerTimestamp,
            safePayload: JSON.parse(JSON.stringify(event.payload)),
          },
        });
      }
    }

    for (const line of context.transcription || []) {
      await prisma.transcriptSegment.upsert({
        where: { id: line.id },
        update: {
          speaker: line.speaker,
          text: line.text,
          startMs: line.startMs,
          endMs: line.endMs,
          confidence: line.confidence,
          redacted: false,
        },
        create: {
          id: line.id,
          callId: line.callId,
          speaker: line.speaker,
          text: line.text,
          startMs: line.startMs,
          endMs: line.endMs,
          confidence: line.confidence,
          redacted: false,
        },
      });
    }
    await syncConversationProjectionIfEnabled(context.id).catch(() => undefined);
  } catch (error) {
    console.error('[TELNYX WEBHOOK] Persist call state failed:', error);
  }
}

async function finalizeCall(context: CallContext): Promise<void> {
  try {
    // Telnyx only supplies telephony state. CRM actions, summaries and structured
    // outcomes must come from the authorized conversation/tool pipeline or the
    // authoritative ElevenLabs post-call reconciliation.
    await prisma.call.update({
      where: { id: context.id },
      data: {
        status: context.state as any,
        endedAt: context.endedAt,
        durationSeconds: context.durationSeconds,
        outcome: context.outcome as any,
      },
    });
    await syncConversationProjectionIfEnabled(context.id).catch(() => undefined);
  } catch (error) {
    console.error('[TELNYX WEBHOOK] Finalize call failed:', error);
  }
}

function isTerminalState(state: string): boolean {
  return [
    'COMPLETED',
    'BUSY',
    'NO_ANSWER',
    'VOICEMAIL',
    'REJECTED',
    'CANCELLED',
    'FAILED',
  ].includes(state);
}
