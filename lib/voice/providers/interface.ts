export interface VoiceAgentConfig {
  id?: string;
  name: string;
  greeting: string;
  systemInstructions: string;
  voiceId: string;
  language: string;
}

export interface CallStartOptions {
  workspaceId: string;
  agentId: string;
  callerNumber: string;
  callerName?: string;
  scenarioId?: string;
}

export interface TelephonyCallRecord {
  id: string;
  provider: string;
  providerCallId: string;
  agentId: string;
  callerNumber: string;
  callerName?: string;
  status: "RINGING" | "IN_PROGRESS" | "COMPLETED" | "FAILED" | "TRANSFERRED";
  startedAt: Date;
  endedAt?: Date;
  durationSeconds: number;
}

export interface WebhookEventPayload {
  eventType: string;
  providerCallId: string;
  timestamp: Date;
  rawPayload: Record<string, unknown>;
}

export interface ProviderHealth {
  providerType: string;
  status: "OPERATIONAL" | "DEMO" | "DEGRADED" | "MISCONFIGURED" | "UNAVAILABLE";
  latencyMs: number;
  message: string;
}

export interface VoiceProvider {
  providerType: string;
  createAgent(config: VoiceAgentConfig): Promise<string>;
  updateAgent(agentId: string, config: Partial<VoiceAgentConfig>): Promise<boolean>;
  deleteAgent(agentId: string): Promise<boolean>;
  assignPhoneNumber(agentId: string, phoneNumber: string): Promise<boolean>;
  startCall(options: CallStartOptions): Promise<TelephonyCallRecord>;
  endCall(providerCallId: string): Promise<boolean>;
  transferCall(providerCallId: string, targetNumber: string): Promise<boolean>;
  getCall(providerCallId: string): Promise<TelephonyCallRecord | null>;
  listCalls(agentId: string): Promise<TelephonyCallRecord[]>;
  verifyWebhook(headers: Record<string, string>, body: string): Promise<boolean>;
  parseWebhookEvent(body: Record<string, unknown>): WebhookEventPayload;
  healthCheck(): Promise<ProviderHealth>;
}
