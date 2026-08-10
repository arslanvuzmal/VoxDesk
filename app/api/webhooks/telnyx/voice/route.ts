import { after, NextRequest, NextResponse } from 'next/server';
import { TelnyxProvider } from '@/lib/telephony/providers/telnyx';
import { CallStateMachine, CallContext } from '@/lib/telephony/call-state-machine';
import { prisma } from '@/lib/database';
import { env } from '@/lib/config/env';
import { syncConversationProjectionIfEnabled } from '@/lib/conversation/persistence';
import type { IdentifiedTelnyxEvent } from '@/lib/telephony/events/telnyx-inbox';
import { queueTelnyxEvent } from '@/lib/telephony/events/telnyx-handler';
import { isOutOfOrderEvent, resolveCallContext } from '@/lib/telephony/events/telnyx-routing';
import { hashPhoneNumber } from '@/lib/security/identifiers';
import { projectProviderHandoffState } from '@/lib/telephony/handoffs/project-handoff-event';

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
  if (
    ['HUMAN_TRANSFER_PENDING', 'HUMAN_CONNECTED', 'FAILED', 'CANCELLED'].includes(event.callState)
  ) {
    await projectProviderHandoffState(
      callContext.id,
      callContext.workspaceId,
      event.callState as
        | 'HUMAN_TRANSFER_PENDING'
        | 'HUMAN_CONNECTED'
        | 'FAILED'
        | 'CANCELLED',
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
    const existingCall = await prisma.call.findUnique({
      where: { id: context.id },
      include: { transcriptSegments: true, events: true },
    });

    if (!existingCall) return;

    const summary = generateCallSummary(context);

    await prisma.call.update({
      where: { id: context.id },
      data: {
        status: context.state as any,
        endedAt: context.endedAt,
        durationSeconds: context.durationSeconds,
        outcome: context.outcome as any,
        summary: summary
          ? {
              create: {
                summary: summary.summary,
                intent: summary.intent,
                sentiment: summary.sentiment,
                urgency: summary.urgency,
                actionItems: JSON.parse(JSON.stringify(summary.actionItems)),
                commitments: JSON.parse(JSON.stringify(summary.commitments)),
                followUpRecommendation: summary.followUpRecommendation,
              },
            }
          : undefined,
      },
    });

    if (context.outcome === 'APPOINTMENT_SCHEDULED' && context.contactId) {
      await createAppointmentFromCall(context);
    }

    if (context.outcome === 'LEAD_QUALIFIED' && context.contactId) {
      await createLeadFromCall(context);
    }

    if (
      context.terminationReason &&
      (context.terminationReason === 'OPT_OUT_FAILURE' ||
        context.terminationReason === 'OUTBOUND_DISCLOSURE_FAILURE')
    ) {
      await handleComplianceIssue(context);
    }

    await createImprovementObservations(context);
  } catch (error) {
    console.error('[TELNYX WEBHOOK] Finalize call failed:', error);
  }
}

function generateCallSummary(context: CallContext): {
  summary: string;
  intent: string;
  sentiment: string;
  urgency: string;
  actionItems: Record<string, unknown>;
  commitments: Record<string, unknown>;
  followUpRecommendation?: string;
} | null {
  if (!context.transcription || context.transcription.length === 0) return null;

  const transcriptText = context.transcription.map(t => `${t.speaker}: ${t.text}`).join('\n');

  return {
    summary: `Call completed with ${context.terminationReason || 'normal'} termination. ${transcriptText.slice(0, 500)}`,
    intent: 'General inquiry',
    sentiment: 'neutral',
    urgency: 'medium',
    actionItems: {},
    commitments: {},
    followUpRecommendation:
      context.terminationReason === 'CALLER_HANGUP' ? 'Follow up if needed' : undefined,
  };
}

async function createAppointmentFromCall(context: CallContext): Promise<void> {
  const appointmentData = context.metadata.appointment as
    { service?: string; startTime?: string; timezone?: string } | undefined;

  if (!appointmentData?.service || !appointmentData?.startTime) return;

  await prisma.appointment.create({
    data: {
      workspaceId: context.workspaceId,
      callId: context.id,
      callerName: context.callerName || 'Unknown',
      service: appointmentData.service,
      startTime: new Date(appointmentData.startTime),
      endTime: new Date(new Date(appointmentData.startTime).getTime() + 30 * 60 * 1000),
      timezone: appointmentData.timezone || 'America/New_York',
      status: 'CONFIRMED',
      confirmationStatus: 'CONFIRMED',
    },
  });
}

async function createLeadFromCall(context: CallContext): Promise<void> {
  const leadData = context.metadata.lead as
    { name?: string; company?: string; email?: string; phone?: string } | undefined;

  if (!leadData?.name) return;

  await prisma.lead.create({
    data: {
      workspaceId: context.workspaceId,
      callId: context.id,
      name: leadData.name,
      company: leadData.company,
      emailEncrypted: leadData.email,
      phoneEncrypted: leadData.phone,
      status: 'NEW',
      category: 'WARM',
    },
  });
}

async function handleComplianceIssue(context: CallContext): Promise<void> {
  if (context.callerNumber) {
    await prisma.suppressionEntry.create({
      data: {
        workspaceId: context.workspaceId,
        phoneHash: hashPhoneNumber(context.callerNumber),
        reason:
          context.terminationReason === 'OPT_OUT_FAILURE' ? 'DO_NOT_CALL' : 'COMPLIANCE_VIOLATION',
        notes: `Auto-suppressed due to ${context.terminationReason} on call ${context.id}`,
      },
    });
  }
}

async function createImprovementObservations(context: CallContext): Promise<void> {
  const observations = [];

  if (context.transcription && context.transcription.length === 0 && context.durationSeconds > 30) {
    observations.push({
      category: 'UNANSWERED_BUSINESS_QUESTION',
      description: 'Call had duration but no transcript captured',
    });
  }

  if (
    context.terminationReason &&
    (context.terminationReason === 'FAILED_PROVIDER' ||
      context.terminationReason === 'FAILED_AGENT')
  ) {
    observations.push({
      category: 'PROVIDER_FAILURE',
      description: `Call terminated due to ${context.terminationReason}`,
    });
  }

  if (context.terminationReason === 'OPT_OUT_FAILURE') {
    observations.push({
      category: 'OPT_OUT_FAILURE',
      description: 'Caller requested opt-out but was not honored',
    });
  }

  for (const obs of observations) {
    await prisma.improvementObservation.create({
      data: {
        workspaceId: context.workspaceId,
        callId: context.id,
        category: obs.category,
        description: obs.description,
        evidence: JSON.parse(
          JSON.stringify({ callId: context.id, terminationReason: context.terminationReason })
        ),
        affectedCalls: 1,
        status: 'OPEN',
      },
    });
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

