import {
  VoiceProvider,
  VoiceAgentConfig,
  CallStartOptions,
  TelephonyCallRecord,
  WebhookEventPayload,
  ProviderHealth,
} from "./interface";

export class RetellVoiceProvider implements VoiceProvider {
  public readonly providerType = "RETELL";
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.RETELL_API_KEY || "";
  }

  async createAgent(config: VoiceAgentConfig): Promise<string> {
    return `retell-agent-${config.name.toLowerCase().replace(/\s+/g, "-")}`;
  }

  async updateAgent(_agentId: string, _config: Partial<VoiceAgentConfig>): Promise<boolean> {
    return true;
  }

  async deleteAgent(_agentId: string): Promise<boolean> {
    return true;
  }

  async assignPhoneNumber(_agentId: string, _phoneNumber: string): Promise<boolean> {
    return true;
  }

  async startCall(options: CallStartOptions): Promise<TelephonyCallRecord> {
    const providerCallId = `retell-${Date.now()}`;
    return {
      id: providerCallId,
      provider: "RETELL",
      providerCallId,
      agentId: options.agentId,
      callerNumber: options.callerNumber,
      callerName: options.callerName,
      status: "IN_PROGRESS",
      startedAt: new Date(),
      durationSeconds: 0,
    };
  }

  async endCall(_providerCallId: string): Promise<boolean> {
    return true;
  }

  async transferCall(_providerCallId: string, _targetNumber: string): Promise<boolean> {
    return true;
  }

  async getCall(providerCallId: string): Promise<TelephonyCallRecord | null> {
    return {
      id: providerCallId,
      provider: "RETELL",
      providerCallId,
      agentId: "agent-retell",
      callerNumber: "+15550192834",
      status: "COMPLETED",
      startedAt: new Date(),
      durationSeconds: 30,
    };
  }

  async listCalls(_agentId: string): Promise<TelephonyCallRecord[]> {
    return [];
  }

  async verifyWebhook(_headers: Record<string, string>, _body: string): Promise<boolean> {
    return Boolean(this.apiKey);
  }

  parseWebhookEvent(body: Record<string, unknown>): WebhookEventPayload {
    return {
      eventType: (body.event as string) || "call_ended",
      providerCallId: (body.call_id as string) || "retell-call-001",
      timestamp: new Date(),
      rawPayload: body,
    };
  }

  async healthCheck(): Promise<ProviderHealth> {
    const hasCreds = Boolean(this.apiKey);
    return {
      providerType: "RETELL",
      status: hasCreds ? "OPERATIONAL" : "MISCONFIGURED",
      latencyMs: hasCreds ? 150 : 0,
      message: hasCreds ? "Retell AI connection configured" : "Retell API key missing (RETELL_API_KEY)",
    };
  }
}
