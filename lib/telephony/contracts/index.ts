export interface TelephonyProvider {
  readonly providerType: string;

  createAgent(config: VoiceAgentConfig): Promise<string>;
  updateAgent(agentId: string, config: Partial<VoiceAgentConfig>): Promise<boolean>;
  deleteAgent(agentId: string): Promise<boolean>;
  assignPhoneNumber(agentId: string, phoneNumber: string): Promise<boolean>;
  startCall(options: CallStartOptions): Promise<TelephonyCallRecord>;
  endCall(providerCallId: string): Promise<boolean>;
  transferCall(providerCallId: string, targetNumber: string, commandId?: string): Promise<boolean>;
  getCall(providerCallId: string): Promise<TelephonyCallRecord | null>;
  listCalls(agentId: string): Promise<TelephonyCallRecord[]>;
  verifyWebhook(headers: Record<string, string>, body: string): Promise<boolean>;
  parseWebhookEvent(body: Record<string, unknown>): WebhookEventPayload;
  healthCheck(): Promise<ProviderHealth>;
  provisionResources(config: ProvisioningConfig): Promise<ProvisioningResult>;
  verifyResources(config: ProvisioningConfig): Promise<VerificationResult>;
}

export interface VoiceAgentConfig {
  id?: string;
  name: string;
  greeting: string;
  systemInstructions: string;
  voiceId: string;
  language: string;
  businessId: string;
  agentVersion: number;
}

export interface CallStartOptions {
  workspaceId: string;
  businessId: string;
  agentId: string;
  agentVersionId: string;
  callerNumber: string;
  callerIdNumber?: string;
  callerName?: string;
  direction: CallDirection;
  channel: CallChannel;
  campaignId?: string;
  contactId?: string;
  language: string;
  trainingPackVersion: number;
}

export interface TelephonyCallRecord {
  id: string;
  provider: string;
  providerCallControlId: string;
  providerCallSessionId?: string;
  providerCallLegId?: string;
  connectionId?: string;
  providerConversationId?: string;
  agentId: string;
  agentVersionId: string;
  callerNumber: string;
  callerName?: string;
  direction: CallDirection;
  channel: CallChannel;
  status: CallState;
  startedAt: Date;
  answeredAt?: Date;
  endedAt?: Date;
  durationSeconds: number;
}

export interface WebhookEventPayload {
  eventType: NormalizedEventType;
  providerCallControlId: string;
  providerCallSessionId?: string;
  providerCallLegId?: string;
  connectionId?: string;
  providerEventId?: string;
  timestamp: Date;
  rawPayload: Record<string, unknown>;
  direction: CallDirection;
  fromNumber?: string;
  toNumber?: string;
  callState: CallState;
  terminationReason?: CallTerminationReason;
}

export interface ProviderHealth {
  providerType: string;
  status: 'OPERATIONAL' | 'DEMO' | 'DEGRADED' | 'MISCONFIGURED' | 'UNAVAILABLE';
  latencyMs: number;
  message: string;
  details?: Record<string, unknown>;
}

export interface ProvisioningConfig {
  workspaceId: string;
  businessId: string;
  businessName: string;
  phoneNumber?: string;
  callerId?: string;
  webhookUrl: string;
  failoverUrl: string;
  outboundEnabled: boolean;
}

export interface ProvisioningResult {
  success: boolean;
  connectionId?: string;
  phoneNumber?: string;
  outboundProfileId?: string;
  sipTrunkId?: string;
  webhookConfigured: boolean;
  failoverConfigured: boolean;
  errors: string[];
}

export interface VerificationResult {
  verified: boolean;
  phoneNumbers: number;
  callerIds: number;
  webhookReachable: boolean;
  failoverReachable: boolean;
  sipTrunkHealthy: boolean;
  latencyMs: number;
  errors: string[];
}

export interface ConnectionConfig {
  connectionId: string;
  webhookUrl: string;
  failoverUrl: string;
}

export interface PhoneNumberConfig {
  phoneNumber: string;
  connectionId: string;
}

export interface PhoneNumberRecord {
  phoneNumber: string;
  connectionId: string;
  status: string;
}

export interface OutboundCallOptions {
  from: string;
  to: string;
  webhookUrl: string;
  webhookFailoverUrl?: string;
  record?: boolean;
  timeoutSecs?: number;
  clientState?: string;
}

export interface SipTrunkConfig {
  trunkId: string;
  username: string;
  password: string;
  tlsEnabled: boolean;
  srtpEnabled: boolean;
  elevenlabsDestination: string;
}

export interface SipTrunkRecord {
  trunkId: string;
  username: string;
  status: string;
}

export interface NormalizedCallEvent {
  eventType: NormalizedEventType;
  providerCallId: string;
  providerCallSessionId?: string;
  providerCallLegId?: string;
  direction: CallDirection;
  fromNumber: string;
  toNumber: string;
  state: CallState;
  timestamp: Date;
}

export type CallDirection = 'INBOUND' | 'OUTBOUND' | 'WEB';
export type CallChannel = 'WEB' | 'PHONE' | 'SIP';

export type CallState =
  | 'CREATED'
  | 'QUEUED'
  | 'INITIATING'
  | 'RINGING'
  | 'ANSWERED'
  | 'AGENT_CONNECTING'
  | 'ACTIVE'
  | 'HUMAN_TRANSFER_PENDING'
  | 'HUMAN_CONNECTED'
  | 'ENDING'
  | 'COMPLETED'
  | 'BUSY'
  | 'NO_ANSWER'
  | 'VOICEMAIL'
  | 'REJECTED'
  | 'CANCELLED'
  | 'FAILED';

export type NormalizedEventType =
  | 'CALL_INITIATED'
  | 'CALL_RINGING'
  | 'CALL_ANSWERED'
  | 'CALL_HANGUP'
  | 'CALL_BRIDGED'
  | 'CALL_TRANSFERRED'
  | 'CALL_RECORDING_AVAILABLE'
  | 'CALL_STREAM_STARTED'
  | 'CALL_STREAM_STOPPED'
  | 'CALL_MACHINE_DETECTED'
  | 'CALL_FAILED';

export type CallTerminationReason =
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
  | 'ADMIN_CANCELLED'
  | 'OPT_OUT_FAILURE'
  | 'OUTBOUND_DISCLOSURE_FAILURE';

export const CALL_STATE_TRANSITIONS: Record<CallState, CallState[]> = {
  CREATED: ['QUEUED', 'INITIATING', 'CANCELLED', 'FAILED'],
  QUEUED: ['INITIATING', 'CANCELLED', 'FAILED'],
  INITIATING: ['RINGING', 'FAILED', 'CANCELLED'],
  RINGING: ['ANSWERED', 'NO_ANSWER', 'BUSY', 'VOICEMAIL', 'CANCELLED', 'FAILED'],
  ANSWERED: ['AGENT_CONNECTING', 'FAILED'],
  AGENT_CONNECTING: ['ACTIVE', 'FAILED'],
  ACTIVE: ['HUMAN_TRANSFER_PENDING', 'ENDING', 'FAILED'],
  HUMAN_TRANSFER_PENDING: ['HUMAN_CONNECTED', 'ENDING', 'FAILED'],
  HUMAN_CONNECTED: ['ENDING', 'FAILED'],
  ENDING: ['COMPLETED', 'FAILED'],
  COMPLETED: [],
  BUSY: [],
  NO_ANSWER: [],
  VOICEMAIL: [],
  REJECTED: [],
  CANCELLED: [],
  FAILED: [],
};

export function isValidStateTransition(from: CallState, to: CallState): boolean {
  const allowed = CALL_STATE_TRANSITIONS[from];
  return allowed ? allowed.includes(to) : false;
}

export function getTerminalStates(): CallState[] {
  return ['COMPLETED', 'BUSY', 'NO_ANSWER', 'VOICEMAIL', 'REJECTED', 'CANCELLED', 'FAILED'];
}

export function isTerminalState(state: CallState): boolean {
  return getTerminalStates().includes(state);
}

export function getDirectionFromEvent(eventType: NormalizedEventType): CallDirection {
  if (eventType === 'CALL_INITIATED' || eventType === 'CALL_RINGING') {
    return 'OUTBOUND';
  }
  return 'INBOUND';
}

export interface SipHeaders {
  'X-VoxDesk-Call-ID': string;
  'X-VoxDesk-Tenant-ID': string;
  'X-VoxDesk-Business-ID': string;
  'X-VoxDesk-Contact-ID'?: string;
  'X-VoxDesk-Campaign-ID'?: string;
  'X-VoxDesk-Direction': CallDirection;
  'X-VoxDesk-Language': string;
  'X-VoxDesk-Agent-Version': string;
}

export interface InboundCallContext {
  workspaceId: string;
  businessId: string;
  agentId: string;
  agentVersionId: string;
  phoneNumber: string;
  callerNumber: string;
  language: string;
  trainingPackVersion: number;
}

export type OutboundWorkflowType =
  | 'APPOINTMENT_REMINDER'
  | 'REQUESTED_CALLBACK'
  | 'CUSTOMER_FOLLOW_UP'
  | 'MISSING_INFORMATION_REMINDER'
  | 'SERVICE_UPDATE'
  | 'CONSENTED_LEAD_FOLLOW_UP'
  | 'SURVEY_REQUEST';

export interface OutboundCallRequest {
  workspaceId: string;
  businessId: string;
  agentId: string;
  agentVersionId: string;
  toNumber: string;
  fromNumber: string;
  workflowType: OutboundWorkflowType;
  language: string;
  trainingPackVersion: number;
  contactId?: string;
  campaignId?: string;
}
