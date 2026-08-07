import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import {
  CallStateMachine,
  CallContext,
  createCallContextFromTelniWebhook,
} from '@/lib/telephony/call-state-machine';
import { inboundHandler } from '@/lib/telephony/inbound';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();

    const headersObj: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      headersObj[key.toLowerCase()] = value;
    });

    let parsedBody: Record<string, unknown> = {};
    try {
      parsedBody = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const eventType = parsedBody.type as string;
    const payload = parsedBody.payload as Record<string, unknown>;

    const providerCallId = (payload.call_id || payload.callId || payload.conversation_id) as string;
    const providerConversationId = (payload.conversation_id || payload.call_id) as string;

    console.log('[ELEVENLABS SIP] Webhook received:', { eventType, providerCallId });

    switch (eventType) {
      case 'conversation.started':
      case 'call.started':
        await handleCallStarted(providerCallId, providerConversationId, payload);
        break;
      case 'conversation.ended':
      case 'call.ended':
        await handleCallEnded(providerCallId, providerConversationId, payload);
        break;
      case 'tool.called':
      case 'function.called':
        await handleToolCalled(providerCallId, payload);
        break;
      case 'transcript.updated':
      case 'conversation.transcript':
        await handleTranscript(providerCallId, payload);
        break;
      case 'error':
        await handleError(providerCallId, payload);
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[ELEVENLABS SIP WEBHOOK ERROR]', error);
    return NextResponse.json({ error: 'Webhook processing error' }, { status: 500 });
  }
}

async function handleCallStarted(
  providerCallId: string,
  providerConversationId: string,
  payload: Record<string, unknown>
): Promise<void> {
  const call = await prisma.call.findFirst({
    where: { providerCallControlId: providerCallId },
  });

  if (!call) return;

  const callContext = createCallContextFromTelniWebhook({
    eventType: 'CALL_ANSWERED',
    providerCallControlId: providerCallId,
    providerCallSessionId: undefined,
    providerCallLegId: undefined,
    direction: 'INBOUND',
    fromNumber: call.callerNumberMasked,
    toNumber: '',
    callState: 'ANSWERED',
  });

  callContext.id = call.id;
  callContext.workspaceId = call.workspaceId;
  callContext.businessId = call.workspaceId;
  callContext.agentId = call.agentId;
  callContext.agentVersionId = call.agentId;
  callContext.callerNumber = call.callerNumberMasked;
  callContext.providerConversationId = providerConversationId;
  callContext.state = 'ANSWERED';

  const machine = new CallStateMachine(callContext);
  machine.transitionTo('ANSWERED', {
    type: 'CALL_ANSWERED',
    payload: { providerConversationId },
    providerEventId: providerCallId,
  });

  await persistCallContext(machine.getContext());
}

async function handleCallEnded(
  providerCallId: string,
  providerConversationId: string,
  payload: Record<string, unknown>
): Promise<void> {
  const call = await prisma.call.findFirst({
    where: { providerCallControlId: providerCallId },
  });

  if (!call) return;

  const terminationReason = mapEndReason((payload.termination_reason || payload.reason) as string);
  const duration = (payload.duration_seconds || payload.duration) as number;

  const callContext = createCallContextFromTelniWebhook({
    eventType: 'CALL_HANGUP',
    providerCallControlId: providerCallId,
    providerCallSessionId: undefined,
    providerCallLegId: undefined,
    direction: 'INBOUND',
    fromNumber: '',
    toNumber: '',
    callState: 'COMPLETED',
    terminationReason,
  });

  callContext.id = call.id;
  callContext.workspaceId = call.workspaceId;
  callContext.businessId = call.workspaceId;
  callContext.agentId = call.agentId;
  callContext.agentVersionId = call.agentId;
  callContext.callerNumber = call.callerNumberMasked;
  callContext.providerConversationId = providerConversationId;
  callContext.state = 'COMPLETED';
  callContext.durationSeconds = duration || 0;
  callContext.terminationReason = terminationReason;

  const machine = new CallStateMachine(callContext);
  machine.transitionTo('COMPLETED', {
    type: 'CALL_HANGUP',
    payload: {
      duration,
      terminationReason: mapEndReason((payload.termination_reason || payload.reason) as string),
    },
    providerEventId: providerCallId,
  });
  machine.setTerminationReason(terminationReason);

  await persistCallContext(machine.getContext());

  await finalizeCall(machine.getContext());
}

async function handleToolCalled(
  providerCallId: string,
  payload: Record<string, unknown>
): Promise<void> {
  const toolName = (payload.name || payload.tool_name) as string;
  const parameters = (payload.parameters || payload.arguments) as Record<string, unknown>;
  const result = payload.result as Record<string, unknown> | undefined;
  const success = (payload.success ?? true) as boolean;
  const error = payload.error as string | undefined;

  const call = await prisma.call.findFirst({
    where: { providerCallControlId: providerCallId },
  });

  if (!call) return;

  await prisma.callToolExecution.create({
    data: {
      callId: call.id,
      toolName,
      parameters: JSON.parse(JSON.stringify(parameters)),
      result: result ? JSON.parse(JSON.stringify(result)) : null,
      success,
      errorMessage: error,
      executedAt: new Date(),
    },
  });

  console.log('[ELEVENLABS TOOL] Tool executed:', { toolName, success, callId: call.id });
}

async function handleTranscript(
  providerCallId: string,
  payload: Record<string, unknown>
): Promise<void> {
  const call = await prisma.call.findFirst({
    where: { providerCallControlId: providerCallId },
  });

  if (!call) return;

  const transcript = (payload.transcript || payload.text) as string;
  const speaker = (payload.speaker || payload.role || 'AGENT') as string;
  const isFinal = (payload.final || payload.is_final) as boolean;

  if (!transcript || !isFinal) return;

  await prisma.transcriptSegment.create({
    data: {
      callId: call.id,
      speaker: speaker.toUpperCase() === 'CALLER' ? 'CALLER' : 'AGENT',
      text: transcript,
      startMs: (payload.start_ms || payload.startMs || 0) as number,
      endMs: (payload.end_ms || payload.endMs || 0) as number,
      confidence: (payload.confidence || 1.0) as number,
      redacted: false,
    },
  });
}

async function handleError(
  providerCallId: string,
  payload: Record<string, unknown>
): Promise<void> {
  const call = await prisma.call.findFirst({
    where: { providerCallControlId: providerCallId },
  });

  if (!call) return;

  const errorMessage = (payload.message || payload.error) as string;

  const callContext = createCallContextFromTelniWebhook({
    eventType: 'CALL_FAILED',
    providerCallControlId: providerCallId,
    providerCallSessionId: undefined,
    providerCallLegId: undefined,
    direction: 'INBOUND',
    fromNumber: '',
    toNumber: '',
    callState: 'FAILED',
  });

  callContext.id = call.id;
  callContext.workspaceId = call.workspaceId;
  callContext.businessId = call.workspaceId;
  callContext.agentId = call.agentId;
  callContext.agentVersionId = call.agentId;
  callContext.callerNumber = call.callerNumberMasked;
  callContext.state = 'FAILED';
  callContext.terminationReason = 'FAILED_PROVIDER';

  const machine = new CallStateMachine(callContext);
  machine.transitionTo('FAILED', {
    type: 'CALL_FAILED',
    payload: { error: errorMessage },
    providerEventId: providerCallId,
  });

  await persistCallContext(machine.getContext());
  await finalizeCall(machine.getContext());
}

function mapEndReason(
  reason: string
):
  | 'CALLER_HANGUP'
  | 'RECIPIENT_HANGUP'
  | 'AGENT_HANGUP'
  | 'HUMAN_HANGUP'
  | 'NO_ANSWER'
  | 'BUSY'
  | 'VOICEMAIL'
  | 'FAILED_PROVIDER'
  | 'FAILED_AGENT'
  | 'FAILED_TOOL'
  | 'TIME_LIMIT'
  | 'COMPLIANCE_BLOCK'
  | 'ADMIN_CANCELLED' {
  const reasonMap: Record<string, any> = {
    caller_hangup: 'CALLER_HANGUP',
    recipient_hangup: 'RECIPIENT_HANGUP',
    agent_hangup: 'AGENT_HANGUP',
    human_hangup: 'HUMAN_HANGUP',
    no_answer: 'NO_ANSWER',
    busy: 'BUSY',
    voicemail: 'VOICEMAIL',
    failed_provider: 'FAILED_PROVIDER',
    failed_agent: 'FAILED_AGENT',
    failed_tool: 'FAILED_TOOL',
    time_limit: 'TIME_LIMIT',
    compliance_block: 'COMPLIANCE_BLOCK',
    admin_cancelled: 'ADMIN_CANCELLED',
  };
  return reasonMap[reason.toLowerCase()] || 'CALLER_HANGUP';
}

async function persistCallContext(context: CallContext): Promise<void> {
  await prisma.call.update({
    where: { id: context.id },
    data: {
      status: context.state as any,
      answeredAt: context.answeredAt,
      endedAt: context.endedAt,
      durationSeconds: context.durationSeconds,
      terminationReason: context.terminationReason as any,
      outcome: context.outcome as any,
      providerConversationId: context.providerConversationId,
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
}

async function finalizeCall(context: CallContext): Promise<void> {
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

function hashPhoneNumber(phone: string): string {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(phone).digest('hex');
}
