import {
  VoiceProvider,
  VoiceAgentConfig,
  CallStartOptions,
  TelephonyCallRecord,
  WebhookEventPayload,
  ProviderHealth,
} from "./interface";

export class DemoVoiceProvider implements VoiceProvider {
  public readonly providerType = "DEMO";

  private calls: Map<string, TelephonyCallRecord> = new Map();

  async createAgent(config: VoiceAgentConfig): Promise<string> {
    return `demo-agent-${config.id || Date.now()}`;
  }

  async updateAgent(
    _agentId: string,
    _config: Partial<VoiceAgentConfig>,
  ): Promise<boolean> {
    return true;
  }

  async deleteAgent(_agentId: string): Promise<boolean> {
    return true;
  }

  async assignPhoneNumber(
    _agentId: string,
    _phoneNumber: string,
  ): Promise<boolean> {
    return true;
  }

  async startCall(options: CallStartOptions): Promise<TelephonyCallRecord> {
    const providerCallId = `demo-call-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const record: TelephonyCallRecord = {
      id: providerCallId,
      provider: "DEMO",
      providerCallId,
      agentId: options.agentId,
      callerNumber: options.callerNumber || "+15550192834",
      callerName: options.callerName || "Sarah Miller",
      status: "IN_PROGRESS",
      startedAt: new Date(),
      durationSeconds: 0,
    };
    this.calls.set(providerCallId, record);
    return record;
  }

  async endCall(providerCallId: string): Promise<boolean> {
    const record = this.calls.get(providerCallId);
    if (record) {
      record.status = "COMPLETED";
      record.endedAt = new Date();
      record.durationSeconds = Math.round(
        (record.endedAt.getTime() - record.startedAt.getTime()) / 1000,
      );
      return true;
    }
    return false;
  }

  async transferCall(
    providerCallId: string,
    _targetNumber: string,
  ): Promise<boolean> {
    const record = this.calls.get(providerCallId);
    if (record) {
      record.status = "TRANSFERRED";
      return true;
    }
    return false;
  }

  async getCall(providerCallId: string): Promise<TelephonyCallRecord | null> {
    return this.calls.get(providerCallId) || null;
  }

  async listCalls(agentId: string): Promise<TelephonyCallRecord[]> {
    return Array.from(this.calls.values()).filter((c) => c.agentId === agentId);
  }

  async verifyWebhook(
    _headers: Record<string, string>,
    _body: string,
  ): Promise<boolean> {
    return true; // Demo mode always validates
  }

  parseWebhookEvent(body: Record<string, unknown>): WebhookEventPayload {
    return {
      eventType: (body.eventType as string) || "call.updated",
      providerCallId: (body.providerCallId as string) || "demo-call-001",
      timestamp: new Date(),
      rawPayload: body,
    };
  }

  async healthCheck(): Promise<ProviderHealth> {
    return {
      providerType: "DEMO",
      status: "DEMO",
      latencyMs: 12,
      message:
        "Deterministic Demo Voice Provider operational (No external credentials required)",
    };
  }
}
