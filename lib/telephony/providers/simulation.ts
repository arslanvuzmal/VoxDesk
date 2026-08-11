import crypto from 'node:crypto';
import type {
  CallStartOptions,
  ProvisioningResult,
  ProviderHealth,
  TelephonyCallRecord,
  TelephonyProvider,
  VerificationResult,
  VoiceAgentConfig,
  WebhookEventPayload,
} from '@/lib/telephony/contracts';

/**
 * Deterministic portfolio provider. It creates clearly-prefixed identifiers and
 * never opens a network connection or invokes a carrier API.
 */
export class SimulationTelephonyProvider implements TelephonyProvider {
  readonly providerType = 'SIMULATION';
  private readonly calls = new Map<string, TelephonyCallRecord>();

  async createAgent(config: VoiceAgentConfig): Promise<string> {
    return `sim_agent_${config.businessId}_${config.agentVersion}`;
  }

  async updateAgent(): Promise<boolean> {
    return true;
  }

  async deleteAgent(): Promise<boolean> {
    return true;
  }

  async assignPhoneNumber(): Promise<boolean> {
    return false;
  }

  async startCall(options: CallStartOptions): Promise<TelephonyCallRecord> {
    const id = `sim_call_${crypto.randomUUID().replaceAll('-', '')}`;
    const record: TelephonyCallRecord = {
      id,
      provider: this.providerType,
      providerCallControlId: id,
      providerCallSessionId: `sim_session_${crypto.randomUUID().replaceAll('-', '')}`,
      agentId: options.agentId,
      agentVersionId: options.agentVersionId,
      callerNumber: options.callerNumber,
      callerName: options.callerName,
      direction: options.direction,
      channel: options.channel,
      status: 'INITIATING',
      startedAt: new Date(),
      durationSeconds: 0,
    };
    this.calls.set(id, record);
    return record;
  }

  async endCall(providerCallId: string): Promise<boolean> {
    const record = this.calls.get(providerCallId);
    if (!record) return false;
    const endedAt = new Date();
    record.status = 'COMPLETED';
    record.endedAt = endedAt;
    record.durationSeconds = Math.max(
      0,
      Math.floor((endedAt.getTime() - record.startedAt.getTime()) / 1000)
    );
    return true;
  }

  async transferCall(providerCallId: string): Promise<boolean> {
    const record = this.calls.get(providerCallId);
    if (!record) return false;
    record.status = 'HUMAN_TRANSFER_PENDING';
    return true;
  }

  async getCall(providerCallId: string): Promise<TelephonyCallRecord | null> {
    return this.calls.get(providerCallId) || null;
  }

  async listCalls(agentId: string): Promise<TelephonyCallRecord[]> {
    return [...this.calls.values()].filter(call => call.agentId === agentId);
  }

  async verifyWebhook(_headers: Record<string, string>, _body: string): Promise<boolean> {
    // Simulation events are internal service calls, never public webhooks.
    return false;
  }

  parseWebhookEvent(_body: Record<string, unknown>): WebhookEventPayload {
    throw new Error('Simulation provider does not accept public webhook events.');
  }

  async healthCheck(): Promise<ProviderHealth> {
    return {
      providerType: this.providerType,
      status: 'DEMO',
      latencyMs: 0,
      message: 'Deterministic telephony simulation is ready. No external phone call is placed.',
    };
  }

  async provisionResources(): Promise<ProvisioningResult> {
    return {
      success: false,
      webhookConfigured: false,
      failoverConfigured: false,
      errors: ['Simulation mode cannot provision Telnyx resources.'],
    };
  }

  async verifyResources(): Promise<VerificationResult> {
    return {
      verified: false,
      phoneNumbers: 0,
      callerIds: 0,
      webhookReachable: false,
      failoverReachable: false,
      sipTrunkHealthy: false,
      latencyMs: 0,
      errors: ['Simulation mode cannot verify carrier resources.'],
    };
  }
}
