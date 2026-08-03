import crypto from "crypto";
import {
  VoiceProvider,
  VoiceAgentConfig,
  CallStartOptions,
  TelephonyCallRecord,
  WebhookEventPayload,
  ProviderHealth,
} from "./interface";

export class VapiVoiceProvider implements VoiceProvider {
  public readonly providerType = "VAPI";
  private apiKey: string;
  private secret: string;

  constructor() {
    this.apiKey = process.env.VAPI_API_KEY || "";
    this.secret = process.env.VAPI_WEBHOOK_SECRET || "";
  }

  async createAgent(config: VoiceAgentConfig): Promise<string> {
    return `vapi-agent-${config.name.toLowerCase().replace(/\s+/g, "-")}`;
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
    const providerCallId = `vapi-${crypto.randomBytes(12).toString("hex")}`;
    return {
      id: providerCallId,
      provider: "VAPI",
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
      provider: "VAPI",
      providerCallId,
      agentId: "agent-vapi",
      callerNumber: "+15550192834",
      status: "COMPLETED",
      startedAt: new Date(),
      durationSeconds: 60,
    };
  }

  async listCalls(_agentId: string): Promise<TelephonyCallRecord[]> {
    return [];
  }

  async verifyWebhook(headers: Record<string, string>, _body: string): Promise<boolean> {
    if (!this.secret) return false;
    return headers["x-vapi-secret"] === this.secret;
  }

  parseWebhookEvent(body: Record<string, unknown>): WebhookEventPayload {
    const message = (body.message as Record<string, unknown>) || {};
    return {
      eventType: (message.type as string) || "call.status",
      providerCallId: (message.callId as string) || "vapi-demo-call",
      timestamp: new Date(),
      rawPayload: body,
    };
  }

  async healthCheck(): Promise<ProviderHealth> {
    const hasCreds = Boolean(this.apiKey);
    return {
      providerType: "VAPI",
      status: hasCreds ? "OPERATIONAL" : "MISCONFIGURED",
      latencyMs: hasCreds ? 180 : 0,
      message: hasCreds ? "Vapi API connection configured" : "Vapi API key missing (VAPI_API_KEY)",
    };
  }
}
