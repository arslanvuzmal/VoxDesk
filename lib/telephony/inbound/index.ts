import { TelnyxProvider } from '@/lib/telephony/providers/telnyx';
import {
  CallStateMachine,
  CallContext,
  createCallContextFromTelniWebhook,
} from '@/lib/telephony/call-state-machine';
import {
  resolveElevenLabsAgent,
  SupportedLanguage,
  VoxDeskPreset,
} from '@/lib/elevenlabs/agent-registry.server';
import { prisma } from '@/lib/database';
import { acquireCallLeases, releaseCallLeases } from '@/lib/telephony/concurrency';
import { env } from '@/lib/config/env';

export interface InboundCallContext {
  workspaceId: string;
  businessId: string;
  agentId: string;
  agentVersionId: string;
  phoneNumber: string;
  callerNumber: string;
  language: string;
  trainingPackVersion: number;
  campaignId?: string;
  contactId?: string;
}

export class InboundTelephonyHandler {
  private telnyx: TelnyxProvider;

  constructor(telnyx?: TelnyxProvider) {
    this.telnyx = telnyx || new TelnyxProvider();
  }

  async handleInboundCall(event: {
    providerCallControlId: string;
    providerCallSessionId: string;
    providerCallLegId: string;
    fromNumber: string;
    toNumber: string;
    direction: 'incoming';
  }): Promise<{ success: boolean; callId?: string; error?: string }> {
    try {
      const context = await this.resolveInboundContext(event);
      if (!context) {
        return { success: false, error: 'Could not resolve business/agent for incoming call' };
      }

      const leases = await acquireCallLeases(
        context.workspaceId,
        context.businessId,
        context.agentId,
        context.phoneNumber,
        context.campaignId,
        'INBOUND'
      );

      if (!leases.success) {
        return {
          success: false,
          error: `Could not acquire concurrency leases: ${leases.failed.join(', ')}`,
        };
      }

      const callContext = createCallContextFromTelniWebhook({
        eventType: 'CALL_INITIATED',
        providerCallControlId: event.providerCallControlId,
        providerCallSessionId: event.providerCallSessionId,
        providerCallLegId: event.providerCallLegId,
        direction: 'INBOUND',
        fromNumber: event.fromNumber,
        toNumber: event.toNumber,
        callState: 'INITIATING',
      });

      callContext.workspaceId = context.workspaceId;
      callContext.businessId = context.businessId;
      callContext.agentId = context.agentId;
      callContext.agentVersionId = context.agentVersionId;
      callContext.callerNumber = event.fromNumber;
      callContext.language = context.language;
      callContext.trainingPackVersion = context.trainingPackVersion;
      callContext.campaignId = context.campaignId;
      callContext.contactId = context.contactId;
      callContext.providerCallControlId = event.providerCallControlId;
      callContext.providerCallSessionId = event.providerCallSessionId;
      callContext.providerCallLegId = event.providerCallLegId;

      const machine = new CallStateMachine(callContext);
      machine.transitionTo('INITIATING', {
        type: 'CALL_INITIATED',
        payload: { from: event.fromNumber, to: event.toNumber },
        providerEventId: event.providerCallControlId,
      });

      await this.persistCallContext(machine.getContext());

      const elevenLabsAgent = resolveElevenLabsAgent(
        context.agentId as VoxDeskPreset,
        context.language as SupportedLanguage
      );

      if (!elevenLabsAgent) {
        await releaseCallLeases('inbound', leases.leases);
        return { success: false, error: 'ElevenLabs agent not configured' };
      }

      const sipHeaders = this.buildSipHeaders(machine.getContext(), elevenLabsAgent.agentId);

      const callRecord = await this.telnyx.startCall({
        workspaceId: context.workspaceId,
        businessId: context.businessId,
        agentId: context.agentId,
        agentVersionId: context.agentVersionId,
        callerNumber: event.fromNumber,
        direction: 'INBOUND',
        channel: 'PHONE',
        language: context.language,
        trainingPackVersion: context.trainingPackVersion,
        campaignId: context.campaignId,
        contactId: context.contactId,
      });

      machine.transitionTo('RINGING', {
        type: 'CALL_RINGING',
        payload: { providerCallId: callRecord.providerCallControlId },
        providerEventId: event.providerCallControlId,
      });

      await this.persistCallContext(machine.getContext());

      return { success: true, callId: callRecord.providerCallControlId };
    } catch (error) {
      console.error('[INBOUND HANDLER] Error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async handleTelnyxWebhook(event: {
    eventType: string;
    providerCallControlId: string;
    providerCallSessionId?: string;
    providerCallLegId?: string;
    callState: string;
    direction: 'incoming' | 'outgoing';
    fromNumber?: string;
    toNumber?: string;
    terminationReason?: string;
  }): Promise<void> {
    const call = await prisma.call.findFirst({
      where: { providerCallControlId: event.providerCallControlId },
    });

    if (!call) return;

    const callContext = createCallContextFromTelniWebhook({
      eventType: event.eventType as any,
      providerCallControlId: event.providerCallControlId,
      providerCallSessionId: event.providerCallSessionId,
      providerCallLegId: event.providerCallLegId,
      direction: event.direction === 'incoming' ? 'INBOUND' : 'OUTBOUND',
      fromNumber: event.fromNumber || call.callerNumberMasked,
      toNumber: event.toNumber || '',
      callState: event.callState as any,
      terminationReason: event.terminationReason as any,
    });

    callContext.id = call.id;
    callContext.workspaceId = call.workspaceId;
    callContext.businessId = call.workspaceId;
    callContext.agentId = call.agentId;
    callContext.agentVersionId = call.agentId;
    callContext.callerNumber = call.callerNumberMasked;
    callContext.state = call.status as any;
    callContext.startedAt = call.startedAt;
    callContext.answeredAt = call.answeredAt ?? undefined;
    callContext.endedAt = call.endedAt ?? undefined;
    callContext.durationSeconds = call.durationSeconds;

    const machine = new CallStateMachine(callContext);
    machine.transitionTo(event.callState as any, {
      type: event.eventType as any,
      payload: {},
      providerEventId: event.providerCallControlId,
    });

    if (event.terminationReason) {
      machine.setTerminationReason(event.terminationReason as any);
    }

    await this.persistCallContext(machine.getContext());

    if (
      ['COMPLETED', 'BUSY', 'NO_ANSWER', 'VOICEMAIL', 'REJECTED', 'CANCELLED', 'FAILED'].includes(
        event.callState
      )
    ) {
      const leases = await this.getActiveLeasesForCall(call.id);
      if (leases.length > 0) {
        await releaseCallLeases('inbound', leases);
      }
    }
  }

  private async resolveInboundContext(event: {
    fromNumber: string;
    toNumber: string;
  }): Promise<InboundCallContext | null> {
    const phoneNumber = await prisma.phoneNumber.findFirst({
      where: { numberMasked: { contains: event.toNumber.slice(-10) } },
      include: { workspace: true, agent: true },
    });

    if (!phoneNumber?.workspace || !phoneNumber?.agent) {
      return null;
    }

    const agentConfig = phoneNumber.agent;
    const workspace = phoneNumber.workspace;

    return {
      workspaceId: workspace.id,
      businessId: workspace.id,
      agentId:
        agentConfig.name === 'Maya (Northstar Legal Receptionist)' ? 'LEGAL' : agentConfig.name,
      agentVersionId: agentConfig.id,
      phoneNumber: event.toNumber,
      callerNumber: event.fromNumber,
      language: agentConfig.language || 'en-US',
      trainingPackVersion: 1,
    };
  }

  private buildSipHeaders(context: CallContext, elevenLabsAgentId: string): Record<string, string> {
    return {
      'X-VoxDesk-Call-ID': context.id,
      'X-VoxDesk-Tenant-ID': context.workspaceId,
      'X-VoxDesk-Business-ID': context.businessId,
      'X-VoxDesk-Contact-ID': context.contactId || '',
      'X-VoxDesk-Campaign-ID': context.campaignId || '',
      'X-VoxDesk-Direction': context.direction,
      'X-VoxDesk-Language': context.language,
      'X-VoxDesk-Agent-Version': context.agentVersionId,
      'X-VoxDesk-ElevenLabs-Agent-ID': elevenLabsAgentId,
    };
  }

  private async persistCallContext(context: CallContext): Promise<void> {
    await prisma.call.update({
      where: { id: context.id },
      data: {
        status: context.state as any,
        answeredAt: context.answeredAt,
        endedAt: context.endedAt,
        durationSeconds: context.durationSeconds,
        terminationReason: context.terminationReason as any,
        outcome: context.outcome as any,
        providerCallControlId: context.providerCallControlId,
        providerCallSessionId: context.providerCallSessionId,
        providerCallLegId: context.providerCallLegId,
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

  private async getActiveLeasesForCall(callId: string): Promise<string[]> {
    const call = await prisma.call.findUnique({
      where: { id: callId },
      select: { workspaceId: true },
    });
    if (!call) return [];

    const leases = await prisma.callConcurrencyLease.findMany({
      where: { callId, status: 'ACTIVE' },
      select: { id: true },
    });
    return leases.map(l => l.id);
  }
}

export const inboundHandler = new InboundTelephonyHandler();
