import { TelnyxProvider } from '@/lib/telephony/providers/telnyx';
import {
  CallStateMachine,
  CallContext,
  createCallContextFromTelniWebhook,
} from '@/lib/telephony/call-state-machine';
import {
  resolveElevenLabsAgent,
  isVoxDeskPreset,
  SupportedLanguage,
} from '@/lib/elevenlabs/agent-registry.server';
import { prisma } from '@/lib/database';
import { acquireCallLeases, releaseCallLeases } from '@/lib/telephony/concurrency';
import { featureFlags } from '@/lib/features/flags';
import { hashPhoneNumber } from '@/lib/security/identifiers';
import { isWithinCallingWindow } from '@/lib/telephony/outbound/calling-window';

export interface OutboundCallRequest {
  workspaceId: string;
  businessId: string;
  agentId: string;
  agentVersionId: string;
  toNumber: string;
  fromNumber: string;
  workflowType:
    | 'APPOINTMENT_REMINDER'
    | 'REQUESTED_CALLBACK'
    | 'CUSTOMER_FOLLOW_UP'
    | 'MISSING_INFORMATION_REMINDER'
    | 'SERVICE_UPDATE'
    | 'CONSENTED_LEAD_FOLLOW_UP'
    | 'SURVEY_REQUEST';
  language: string;
  trainingPackVersion: number;
  contactId?: string;
  campaignId?: string;
  openingDisclosure?: string;
  maxAttempts?: number;
  retryIntervalMinutes?: number;
  callingWindowStart?: string;
  callingWindowEnd?: string;
  timeZone?: string;
}

export interface OutboundCallResult {
  success: boolean;
  callId?: string;
  error?: string;
  blockedReason?:
    | 'CONSENT_MISSING'
    | 'SUPPRESSED'
    | 'OUTSIDE_WINDOW'
    | 'CAMPAIGN_LIMIT'
    | 'CONCURRENCY_LIMIT'
    | 'INVALID_NUMBER'
    | 'DNC_VIOLATION';
}

export class OutboundTelephonyHandler {
  private telnyx: TelnyxProvider;

  constructor(telnyx?: TelnyxProvider) {
    this.telnyx = telnyx || new TelnyxProvider();
  }

  async initiateOutboundCall(request: OutboundCallRequest): Promise<OutboundCallResult> {
    const outboundEnabled = await featureFlags.isEnabled('TELNYX_OUTBOUND_ENABLED');
    const campaignsEnabled = await featureFlags.isEnabled('OUTBOUND_CAMPAIGNS_ENABLED');

    if (!outboundEnabled) {
      return {
        success: false,
        error: 'Outbound telephony not enabled',
        blockedReason: 'CAMPAIGN_LIMIT',
      };
    }

    if (request.campaignId && !campaignsEnabled) {
      return { success: false, error: 'Campaigns not enabled', blockedReason: 'CAMPAIGN_LIMIT' };
    }

    const validation = await this.validateOutboundRequest(request);
    if (!validation.valid) {
      return { success: false, error: validation.reason, blockedReason: validation.blockedReason };
    }

    const leases = await acquireCallLeases(
      request.workspaceId,
      request.businessId,
      request.agentId,
      undefined,
      request.campaignId,
      'OUTBOUND'
    );

    if (!leases.success) {
      return {
        success: false,
        error: `Could not acquire concurrency leases: ${leases.failed.join(', ')}`,
        blockedReason: 'CONCURRENCY_LIMIT',
      };
    }

    try {
      const callContext = createCallContextFromTelniWebhook({
        eventType: 'CALL_INITIATED',
        providerCallControlId: `outbound_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        providerCallSessionId: undefined,
        providerCallLegId: undefined,
        direction: 'OUTBOUND',
        fromNumber: request.fromNumber,
        toNumber: request.toNumber,
        callState: 'INITIATING',
      });

      callContext.workspaceId = request.workspaceId;
      callContext.businessId = request.businessId;
      callContext.agentId = request.agentId;
      callContext.agentVersionId = request.agentVersionId;
      callContext.callerNumber = request.toNumber;
      callContext.language = request.language;
      callContext.trainingPackVersion = request.trainingPackVersion;
      callContext.campaignId = request.campaignId;
      callContext.contactId = request.contactId;
      callContext.providerCallControlId = `outbound_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      callContext.metadata = {
        workflowType: request.workflowType,
        openingDisclosure: request.openingDisclosure,
        maxAttempts: request.maxAttempts || 1,
        retryIntervalMinutes: request.retryIntervalMinutes || 60,
        callingWindowStart: request.callingWindowStart,
        callingWindowEnd: request.callingWindowEnd,
        timeZone: request.timeZone || 'America/New_York',
      };

      const machine = new CallStateMachine(callContext);
      machine.transitionTo('INITIATING', {
        type: 'CALL_INITIATED',
        payload: {
          to: request.toNumber,
          from: request.fromNumber,
          workflowType: request.workflowType,
        },
        providerEventId: callContext.providerCallControlId!,
      });

      await this.persistCallContext(machine.getContext());

      if (!isVoxDeskPreset(request.agentId)) {
        await releaseCallLeases('outbound', leases.leases);
        return {
          success: false,
          error: 'Outbound agent is not mapped to an approved ElevenLabs preset.',
          blockedReason: 'CAMPAIGN_LIMIT',
        };
      }

      const elevenLabsAgent = resolveElevenLabsAgent(
        request.agentId,
        request.language as SupportedLanguage
      );

      if (!elevenLabsAgent) {
        await releaseCallLeases('outbound', leases.leases);
        return {
          success: false,
          error: 'ElevenLabs agent not configured',
          blockedReason: 'CAMPAIGN_LIMIT',
        };
      }

      const sipHeaders = this.buildSipHeaders(machine.getContext(), elevenLabsAgent.agentId);

      const callRecord = await this.telnyx.startCall({
        workspaceId: request.workspaceId,
        businessId: request.businessId,
        agentId: request.agentId,
        agentVersionId: request.agentVersionId,
        callerNumber: request.toNumber,
        callerIdNumber: request.fromNumber,
        direction: 'OUTBOUND',
        channel: 'PHONE',
        language: request.language,
        trainingPackVersion: request.trainingPackVersion,
        campaignId: request.campaignId,
        contactId: request.contactId,
      });

      machine.transitionTo('RINGING', {
        type: 'CALL_RINGING',
        payload: { providerCallId: callRecord.providerCallControlId },
        providerEventId: callRecord.providerCallControlId!,
      });

      await this.persistCallContext(machine.getContext());

      return { success: true, callId: callRecord.providerCallControlId };
    } catch (error) {
      await releaseCallLeases('outbound', leases.leases);
      console.error('[OUTBOUND HANDLER] Error:', error);
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
      include: {
        workspace: {
          select: { businessProfile: { select: { id: true } } },
        },
      },
    });

    if (!call) return;

    const businessId = call.workspace.businessProfile?.id;
    const agentVersionId = call.agentVersionId;
    if (!businessId || !agentVersionId) {
      console.error('[OUTBOUND HANDLER] Call routing metadata is incomplete.');
      return;
    }

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
    callContext.businessId = businessId;
    callContext.agentId = call.agentId;
    callContext.agentVersionId = agentVersionId;
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
        await releaseCallLeases('outbound', leases);
      }
    }
  }

  private async validateOutboundRequest(request: OutboundCallRequest): Promise<{
    valid: boolean;
    reason?: string;
    blockedReason?:
      | 'CONSENT_MISSING'
      | 'SUPPRESSED'
      | 'OUTSIDE_WINDOW'
      | 'CAMPAIGN_LIMIT'
      | 'CONCURRENCY_LIMIT'
      | 'INVALID_NUMBER'
      | 'DNC_VIOLATION';
  }> {
    if (!/^\+[1-9]\d{1,14}$/.test(request.toNumber)) {
      return {
        valid: false,
        reason: 'Invalid phone number format (must be E.164)',
        blockedReason: 'INVALID_NUMBER',
      };
    }

    if (!/^\+[1-9]\d{1,14}$/.test(request.fromNumber)) {
      return {
        valid: false,
        reason: 'Invalid caller ID format (must be E.164)',
        blockedReason: 'INVALID_NUMBER',
      };
    }

    if (request.contactId) {
      const [contact, consent, preference] = await Promise.all([
        prisma.contact.findFirst({
          where: {
            id: request.contactId,
            workspaceId: request.workspaceId,
            phoneHash: hashPhoneNumber(request.toNumber),
          },
          select: { id: true },
        }),
        prisma.consentRecord.findFirst({
          where: {
            workspaceId: request.workspaceId,
            contactId: request.contactId,
            consentType: 'OUTBOUND_CALL',
            consentStatus: 'GRANTED',
            revokedAt: null,
          },
        }),
        prisma.communicationPreference.findFirst({
          where: { workspaceId: request.workspaceId, contactId: request.contactId },
        }),
      ]);

      if (!contact || !consent) {
        return {
          valid: false,
          reason: 'Contact has not granted outbound call consent',
          blockedReason: 'CONSENT_MISSING',
        };
      }
      if (preference?.doNotCall) {
        return {
          valid: false,
          reason: 'Contact communication preference blocks calls',
          blockedReason: 'DNC_VIOLATION',
        };
      }
    } else {
      return {
        valid: false,
        reason: 'Outbound calls require a persisted contact',
        blockedReason: 'CONSENT_MISSING',
      };
    }

    const suppression = await prisma.suppressionEntry.findFirst({
      where: {
        workspaceId: request.workspaceId,
        phoneHash: hashPhoneNumber(request.toNumber),
        OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
      },
    });

    if (suppression) {
      return { valid: false, reason: 'Number is on suppression list', blockedReason: 'SUPPRESSED' };
    }

    if (!request.callingWindowStart || !request.callingWindowEnd || !request.timeZone) {
      return {
        valid: false,
        reason: 'A recipient-local calling window is required',
        blockedReason: 'OUTSIDE_WINDOW',
      };
    }

    if (request.callingWindowStart && request.callingWindowEnd && request.timeZone) {
      if (
        !isWithinCallingWindow(
          request.callingWindowStart,
          request.callingWindowEnd,
          request.timeZone
        )
      ) {
        return {
          valid: false,
          reason: 'Outside permitted calling window',
          blockedReason: 'OUTSIDE_WINDOW',
        };
      }
    }

    if (request.campaignId) {
      const campaign = await prisma.campaign.findFirst({
        where: { id: request.campaignId, workspaceId: request.workspaceId },
      });

      if (!campaign) {
        return { valid: false, reason: 'Campaign not found', blockedReason: 'CAMPAIGN_LIMIT' };
      }

      if (campaign.state !== 'APPROVED' && campaign.state !== 'RUNNING') {
        return {
          valid: false,
          reason: `Campaign not in approved/running state: ${campaign.state}`,
          blockedReason: 'CAMPAIGN_LIMIT',
        };
      }

      if (
        campaign.maxAttempts &&
        request.maxAttempts &&
        request.maxAttempts > campaign.maxAttempts
      ) {
        return {
          valid: false,
          reason: 'Exceeds campaign max attempts',
          blockedReason: 'CAMPAIGN_LIMIT',
        };
      }
    }

    return { valid: true };
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
      'X-VoxDesk-Workflow-Type': (context.metadata.workflowType as string) || '',
      'X-VoxDesk-Opening-Disclosure': (context.metadata.openingDisclosure as string) || '',
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

export const outboundHandler = new OutboundTelephonyHandler();
