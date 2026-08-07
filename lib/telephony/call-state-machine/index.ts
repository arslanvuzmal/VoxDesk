import {
  CallState,
  CallDirection,
  CallChannel,
  CallTerminationReason,
  NormalizedEventType,
  CALL_STATE_TRANSITIONS,
  isValidStateTransition,
  isTerminalState,
} from '@/lib/telephony/contracts';

export interface CallContext {
  id: string;
  workspaceId: string;
  businessId: string;
  agentId: string;
  agentVersionId: string;
  direction: CallDirection;
  channel: CallChannel;
  provider: string;
  providerCallControlId: string;
  providerCallSessionId?: string;
  providerCallLegId?: string;
  providerConversationId?: string;
  callerNumber: string;
  callerName?: string;
  contactId?: string;
  campaignId?: string;
  language: string;
  trainingPackVersion: number;
  state: CallState;
  startedAt: Date;
  answeredAt?: Date;
  endedAt?: Date;
  durationSeconds: number;
  terminationReason?: CallTerminationReason;
  outcome?: string;
  recordingConsent: boolean;
  recordingUrl?: string;
  transcription?: CallTranscriptLine[];
  events: CallEventRecord[];
  metadata: Record<string, unknown>;
}

export interface CallEventRecord {
  id: string;
  callId: string;
  eventType: NormalizedEventType;
  providerEventId: string;
  providerTimestamp: Date;
  receivedAt: Date;
  processedAt?: Date;
  stateBefore: CallState;
  stateAfter: CallState;
  payload: Record<string, unknown>;
  idempotencyKey: string;
}

export interface CallTranscriptLine {
  id: string;
  callId: string;
  speaker: 'AGENT' | 'CALLER' | 'SYSTEM';
  text: string;
  startMs: number;
  endMs: number;
  confidence: number;
  final: boolean;
  providerEventId?: string;
  createdAt: Date;
}

export interface CallToolExecution {
  id: string;
  callId: string;
  toolName: string;
  parameters: Record<string, unknown>;
  result?: Record<string, unknown>;
  success: boolean;
  errorMessage?: string;
  executedAt: Date;
  durationMs?: number;
}

export class CallStateMachine {
  private context: CallContext;

  constructor(context: CallContext) {
    this.context = context;
  }

  getContext(): CallContext {
    return { ...this.context };
  }

  getState(): CallState {
    return this.context.state;
  }

  transitionTo(
    newState: CallState,
    event?: { type: NormalizedEventType; payload: Record<string, unknown>; providerEventId: string }
  ): boolean {
    if (!isValidStateTransition(this.context.state, newState)) {
      return false;
    }

    const previousState = this.context.state;
    this.context.state = newState;

    if (event) {
      this.recordEvent(event.type, event.payload, event.providerEventId, previousState, newState);
    }

    this.updateTimestamps(newState);
    return true;
  }

  private updateTimestamps(state: CallState): void {
    const now = new Date();

    switch (state) {
      case 'ANSWERED':
        if (!this.context.answeredAt) {
          this.context.answeredAt = now;
        }
        break;
      case 'COMPLETED':
      case 'BUSY':
      case 'NO_ANSWER':
      case 'VOICEMAIL':
      case 'REJECTED':
      case 'CANCELLED':
      case 'FAILED':
        if (!this.context.endedAt) {
          this.context.endedAt = now;
          if (this.context.startedAt) {
            this.context.durationSeconds = Math.floor(
              (now.getTime() - this.context.startedAt.getTime()) / 1000
            );
          }
        }
        break;
    }
  }

  private recordEvent(
    eventType: NormalizedEventType,
    payload: Record<string, unknown>,
    providerEventId: string,
    stateBefore: CallState,
    stateAfter: CallState
  ): void {
    const idempotencyKey = `${this.context.providerCallControlId}:${providerEventId}`;

    const event: CallEventRecord = {
      id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      callId: this.context.id,
      eventType,
      providerEventId,
      providerTimestamp: new Date((payload.timestamp as string) || Date.now()),
      receivedAt: new Date(),
      processedAt: new Date(),
      stateBefore,
      stateAfter,
      payload,
      idempotencyKey,
    };

    this.context.events.push(event);
  }

  addTranscript(line: Omit<CallTranscriptLine, 'id' | 'callId' | 'createdAt'>): CallTranscriptLine {
    const transcriptLine: CallTranscriptLine = {
      id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      callId: this.context.id,
      createdAt: new Date(),
      ...line,
    };

    if (!this.context.transcription) {
      this.context.transcription = [];
    }
    this.context.transcription.push(transcriptLine);
    return transcriptLine;
  }

  addToolExecution(
    execution: Omit<CallToolExecution, 'id' | 'callId' | 'executedAt'>
  ): CallToolExecution {
    const toolExecution: CallToolExecution = {
      id: `tool_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      callId: this.context.id,
      executedAt: new Date(),
      ...execution,
    };

    return toolExecution;
  }

  setTerminationReason(reason: CallTerminationReason): void {
    this.context.terminationReason = reason;
  }

  setOutcome(outcome: string): void {
    this.context.outcome = outcome;
  }

  setRecordingConsent(consent: boolean): void {
    this.context.recordingConsent = consent;
  }

  setRecordingUrl(url: string): void {
    this.context.recordingUrl = url;
  }

  setProviderConversationId(conversationId: string): void {
    this.context.providerConversationId = conversationId;
  }

  isActive(): boolean {
    return !isTerminalState(this.context.state);
  }

  isTerminal(): boolean {
    return isTerminalState(this.context.state);
  }

  getDuration(): number {
    if (this.context.endedAt && this.context.startedAt) {
      return this.context.durationSeconds;
    }
    if (this.context.startedAt) {
      return Math.floor((Date.now() - this.context.startedAt.getTime()) / 1000);
    }
    return 0;
  }

  static createInitialContext(params: {
    id: string;
    workspaceId: string;
    businessId: string;
    agentId: string;
    agentVersionId: string;
    direction: CallDirection;
    channel: CallChannel;
    provider: string;
    providerCallControlId: string;
    providerCallSessionId?: string;
    providerCallLegId?: string;
    callerNumber: string;
    callerName?: string;
    contactId?: string;
    campaignId?: string;
    language: string;
    trainingPackVersion: number;
    recordingConsent: boolean;
  }): CallContext {
    return {
      id: params.id,
      workspaceId: params.workspaceId,
      businessId: params.businessId,
      agentId: params.agentId,
      agentVersionId: params.agentVersionId,
      direction: params.direction,
      channel: params.channel,
      provider: params.provider,
      providerCallControlId: params.providerCallControlId,
      providerCallSessionId: params.providerCallSessionId,
      providerCallLegId: params.providerCallLegId,
      callerNumber: params.callerNumber,
      callerName: params.callerName,
      contactId: params.contactId,
      campaignId: params.campaignId,
      language: params.language,
      trainingPackVersion: params.trainingPackVersion,
      state: 'CREATED',
      startedAt: new Date(),
      durationSeconds: 0,
      recordingConsent: params.recordingConsent,
      events: [],
      transcription: [],
      metadata: {},
    };
  }
}

export function createCallContextFromTelniWebhook(
  event: {
    eventType: NormalizedEventType;
    providerCallControlId: string;
    providerCallSessionId?: string;
    providerCallLegId?: string;
    direction: CallDirection;
    fromNumber: string;
    toNumber: string;
    callState: CallState;
    terminationReason?: CallTerminationReason;
  },
  existingContext?: CallContext
): CallContext {
  if (existingContext) {
    const machine = new CallStateMachine(existingContext);
    machine.transitionTo(event.callState, {
      type: event.eventType,
      payload: { terminationReason: event.terminationReason },
      providerEventId: event.providerCallControlId,
    });
    if (event.terminationReason) {
      machine.setTerminationReason(event.terminationReason);
    }
    return machine.getContext();
  }

  return CallStateMachine.createInitialContext({
    id: `call_${event.providerCallSessionId || event.providerCallControlId}`,
    workspaceId: '',
    businessId: '',
    agentId: '',
    agentVersionId: '',
    direction: event.direction,
    channel: 'PHONE',
    provider: 'TELNIX',
    providerCallControlId: event.providerCallControlId,
    providerCallSessionId: event.providerCallSessionId,
    providerCallLegId: event.providerCallLegId,
    callerNumber: event.fromNumber,
    callerName: undefined,
    contactId: undefined,
    campaignId: undefined,
    language: 'en-US',
    trainingPackVersion: 1,
    recordingConsent: true,
  });
}
