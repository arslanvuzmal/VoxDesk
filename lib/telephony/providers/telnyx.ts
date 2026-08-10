import crypto from 'crypto';
import {
  TelephonyProvider,
  VoiceAgentConfig,
  CallStartOptions,
  TelephonyCallRecord,
  WebhookEventPayload,
  ProviderHealth,
  ProvisioningConfig,
  ProvisioningResult,
  VerificationResult,
  CallDirection,
  CallChannel,
  CallState,
  NormalizedEventType,
  CallTerminationReason,
  SipHeaders,
} from '@/lib/telephony/contracts';

interface TelnyxCall {
  call_control_id: string;
  call_session_id: string;
  call_leg_id: string;
  connection_id: string;
  from: string;
  to: string;
  state: string;
  direction: string;
  recording_urls?: string[];
  media_urls?: string[];
}

interface TelnyxWebhookPayload {
  data: {
    id: string;
    event_type: string;
    occurred_at: string;
    payload: TelnyxCall;
  };
  meta: {
    attempt: number;
    delivered_to: string;
  };
}

const TELNYX_API_BASE = 'https://api.telnyx.com/v2';

export class TelnyxProvider implements TelephonyProvider {
  readonly providerType = 'TELNYX';
  private apiKey: string;
  private publicKey?: string;
  private connectionId: string;
  private outboundProfileId?: string;
  private webhookUrl: string;
  private failoverUrl: string;
  private sipUsername: string;
  private sipPassword: string;
  private sipTrunkId?: string;

  constructor(config?: {
    apiKey?: string;
    publicKey?: string;
    connectionId?: string;
    outboundProfileId?: string;
    webhookUrl?: string;
    failoverUrl?: string;
    sipUsername?: string;
    sipPassword?: string;
    sipTrunkId?: string;
  }) {
    this.apiKey = config?.apiKey || process.env.TELNYX_API_KEY || '';
    this.publicKey = config?.publicKey || process.env.TELNYX_PUBLIC_KEY;
    this.connectionId = config?.connectionId || process.env.TELNYX_CONNECTION_ID || '';
    this.outboundProfileId =
      config?.outboundProfileId || process.env.TELNYX_OUTBOUND_VOICE_PROFILE_ID;
    this.webhookUrl = config?.webhookUrl || `${process.env.APP_URL}/api/webhooks/telnyx/voice`;
    this.failoverUrl =
      config?.failoverUrl || `${process.env.APP_URL}/api/webhooks/telnyx/voice/failover`;
    this.sipUsername = config?.sipUsername || process.env.TELNYX_SIP_USERNAME || '';
    this.sipPassword = config?.sipPassword || process.env.TELNYX_SIP_PASSWORD || '';
    this.sipTrunkId = config?.sipTrunkId || process.env.TELNYX_SIP_TRUNK_ID;
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const url = `${TELNYX_API_BASE}${path}`;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Telnyx request failed with status ${response.status}.`);
    }

    return response.json() as Promise<T>;
  }

  async createAgent(config: VoiceAgentConfig): Promise<string> {
    return `telnyx-agent-${config.businessId}-${config.agentVersion}`;
  }

  async updateAgent(agentId: string, config: Partial<VoiceAgentConfig>): Promise<boolean> {
    return true;
  }

  async deleteAgent(agentId: string): Promise<boolean> {
    return true;
  }

  async assignPhoneNumber(agentId: string, phoneNumber: string): Promise<boolean> {
    try {
      await this.request('PATCH', `/phone_numbers/${encodeURIComponent(phoneNumber)}`, {
        connection_id: this.connectionId,
      });
      return true;
    } catch {
      return false;
    }
  }

  async startCall(options: CallStartOptions): Promise<TelephonyCallRecord> {
    const fromNumber = options.callerIdNumber || this.getCallerId(options.direction);
    const toNumber = options.callerNumber;

    const response = await this.request<{ data: TelnyxCall }>('POST', '/calls', {
      connection_id: this.connectionId,
      from: fromNumber,
      to: toNumber,
      webhook_url: this.webhookUrl,
      webhook_failover_url: this.failoverUrl,
      use_provided_webhooks_only: true,
      custom_headers: this.buildSipHeaders(options),
      record: false,
      timeout_secs: 300,
      client_state: Buffer.from(
        JSON.stringify({
          workspaceId: options.workspaceId,
          businessId: options.businessId,
          agentId: options.agentId,
          agentVersionId: options.agentVersionId,
          direction: options.direction,
          channel: options.channel,
          campaignId: options.campaignId,
          contactId: options.contactId,
          language: options.language,
          trainingPackVersion: options.trainingPackVersion,
        })
      ).toString('base64'),
    });

    const call = response.data;

    return {
      id: call.call_control_id,
      provider: 'TELNYX',
      providerCallControlId: call.call_control_id,
      providerCallSessionId: call.call_session_id,
      providerCallLegId: call.call_leg_id,
      connectionId: call.connection_id,
      agentId: options.agentId,
      agentVersionId: options.agentVersionId,
      callerNumber: options.callerNumber,
      callerName: options.callerName,
      direction: options.direction,
      channel: options.channel,
      status: this.mapTelnyxState(call.state),
      startedAt: new Date(),
      durationSeconds: 0,
    };
  }

  async endCall(providerCallId: string): Promise<boolean> {
    try {
      await this.request('POST', `/calls/${providerCallId}/actions/hangup`, {});
      return true;
    } catch {
      return false;
    }
  }

  async transferCall(
    providerCallId: string,
    targetNumber: string,
    commandId?: string
  ): Promise<boolean> {
    try {
      await this.request('POST', `/calls/${providerCallId}/actions/transfer`, {
        destination: targetNumber,
        command_id: commandId,
      });
      return true;
    } catch {
      return false;
    }
  }

  async getCall(providerCallControlId: string): Promise<TelephonyCallRecord | null> {
    try {
      const response = await this.request<{ data: TelnyxCall }>(
        'GET',
        `/calls/${providerCallControlId}`
      );
      const call = response.data;

      return {
        id: call.call_control_id,
        provider: 'TELNYX',
        providerCallControlId: call.call_control_id,
        providerCallSessionId: call.call_session_id,
        providerCallLegId: call.call_leg_id,
        agentId: '',
        agentVersionId: '',
        callerNumber: call.from,
        direction: this.mapDirection(call.direction),
        channel: 'PHONE',
        status: this.mapTelnyxState(call.state),
        startedAt: new Date(),
        durationSeconds: 0,
      };
    } catch {
      return null;
    }
  }

  async listCalls(agentId: string): Promise<TelephonyCallRecord[]> {
    try {
      const response = await this.request<{ data: TelnyxCall[] }>('GET', '/calls', {
        filter: { connection_id: this.connectionId },
        page: { size: 100 },
      });

      return response.data.map(call => ({
        id: call.call_control_id,
        provider: 'TELNYX',
        providerCallControlId: call.call_control_id,
        providerCallSessionId: call.call_session_id,
        providerCallLegId: call.call_leg_id,
        agentId: '',
        agentVersionId: '',
        callerNumber: call.from,
        direction: this.mapDirection(call.direction),
        channel: 'PHONE',
        status: this.mapTelnyxState(call.state),
        startedAt: new Date(),
        durationSeconds: 0,
      }));
    } catch {
      return [];
    }
  }

  async verifyWebhook(headers: Record<string, string>, body: string): Promise<boolean> {
    if (!this.publicKey) {
      return false;
    }

    const signature = headers['telnyx-signature-ed25519'] || headers['x-telnyx-signature-ed25519'];
    const timestamp = headers['telnyx-timestamp'] || headers['x-telnyx-timestamp'];

    if (!signature || !timestamp) {
      return false;
    }

    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - parseInt(timestamp, 10)) > 300) {
      return false;
    }

    const message = `${timestamp}|${body}`;
    const publicKey = crypto.createPublicKey({
      key: this.publicKey,
      format: 'pem',
      type: 'spki',
    });

    const isValid = crypto.verify(
      null,
      Buffer.from(message),
      {
        key: publicKey,
      },
      Buffer.from(signature, 'base64')
    );

    return isValid;
  }

  parseWebhookEvent(body: Record<string, unknown>): WebhookEventPayload {
    const payload = body as unknown as TelnyxWebhookPayload;
    const call = payload.data.payload;
    const eventType = payload.data.event_type;

    return {
      eventType: this.mapEventType(eventType),
      providerEventId: payload.data.id,
      providerCallControlId: call.call_control_id,
      providerCallSessionId: call.call_session_id,
      providerCallLegId: call.call_leg_id,
      timestamp: new Date(payload.data.occurred_at),
      connectionId: call.connection_id,
      rawPayload: body,
      direction: this.mapDirection(call.direction),
      fromNumber: call.from,
      toNumber: call.to,
      callState: this.mapTelnyxState(call.state),
      terminationReason: this.getTerminationReason(eventType, call.state),
    };
  }

  private mapDirection(direction: string): CallDirection {
    return ['inbound', 'incoming'].includes(direction.toLowerCase()) ? 'INBOUND' : 'OUTBOUND';
  }

  async healthCheck(): Promise<ProviderHealth> {
    const hasCreds = Boolean(this.apiKey && this.connectionId);

    if (!hasCreds) {
      return {
        providerType: 'TELNYX',
        status: 'MISCONFIGURED',
        latencyMs: 0,
        message: 'Telnyx API key or connection ID not configured',
      };
    }

    try {
      const start = Date.now();
      await this.request('GET', '/connections/' + this.connectionId);
      const latencyMs = Date.now() - start;

      return {
        providerType: 'TELNYX',
        status: 'OPERATIONAL',
        latencyMs,
        message: 'Telnyx connection verified',
      };
    } catch (error) {
      return {
        providerType: 'TELNYX',
        status: 'DEGRADED',
        latencyMs: 0,
        message: `Telnyx health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  async provisionResources(config: ProvisioningConfig): Promise<ProvisioningResult> {
    const errors: string[] = [];
    const connectionId = this.connectionId;
    let phoneNumber: string | undefined;
    let outboundProfileId = this.outboundProfileId;
    const sipTrunkId = this.sipTrunkId;

    try {
      if (config.phoneNumber) {
        const phoneRes = await this.request<{ data: { phone_number: string } }>(
          'POST',
          '/phone_numbers',
          {
            connection_id: connectionId,
            phone_number: config.phoneNumber,
            webhook_url: this.webhookUrl,
            webhook_failover_url: this.failoverUrl,
          }
        );
        phoneNumber = phoneRes.data.phone_number;
      }

      if (config.outboundEnabled && !outboundProfileId) {
        const profileRes = await this.request<{ data: { id: string } }>(
          'POST',
          '/outbound_voice_profiles',
          {
            name: `${config.businessName} Outbound Profile`,
            caller_id: config.callerId,
          }
        );
        outboundProfileId = profileRes.data.id;
      }

      return {
        success: true,
        connectionId,
        phoneNumber,
        outboundProfileId,
        sipTrunkId,
        webhookConfigured: true,
        failoverConfigured: true,
        errors: [],
      };
    } catch (error) {
      errors.push(
        `Provisioning failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      return {
        success: false,
        connectionId,
        phoneNumber,
        outboundProfileId,
        sipTrunkId,
        webhookConfigured: false,
        failoverConfigured: false,
        errors,
      };
    }
  }

  async verifyResources(config: ProvisioningConfig): Promise<VerificationResult> {
    const errors: string[] = [];

    try {
      const phoneRes = await this.request<{
        data: Array<{ phone_number: string; connection_id: string }>;
      }>('GET', '/phone_numbers', {
        filter: { connection_id: this.connectionId },
        page: { size: 100 },
      });
      const phoneNumbers = phoneRes.data.length;

      let callerIds = 0;
      if (this.outboundProfileId) {
        const profileRes = await this.request<{ data: { caller_ids: string[] } }>(
          'GET',
          `/outbound_voice_profiles/${this.outboundProfileId}`
        );
        callerIds = profileRes.data.caller_ids?.length || 0;
      }

      let webhookReachable = false;
      let failoverReachable = false;

      try {
        const whRes = await fetch(this.webhookUrl, { method: 'OPTIONS', cache: 'no-store' });
        webhookReachable = whRes.ok || whRes.status === 405;
      } catch {
        webhookReachable = false;
      }

      try {
        const fbRes = await fetch(this.failoverUrl, { method: 'OPTIONS', cache: 'no-store' });
        failoverReachable = fbRes.ok || fbRes.status === 405;
      } catch {
        failoverReachable = false;
      }

      let sipTrunkHealthy = false;
      if (this.sipTrunkId) {
        try {
          await this.request('GET', `/sip_trunks/${this.sipTrunkId}`);
          sipTrunkHealthy = true;
        } catch {
          sipTrunkHealthy = false;
        }
      }

      const latencyMs = 0;

      return {
        verified: phoneNumbers > 0 && callerIds > 0 && webhookReachable,
        phoneNumbers,
        callerIds,
        webhookReachable,
        failoverReachable,
        sipTrunkHealthy,
        latencyMs,
        errors,
      };
    } catch (error) {
      errors.push(
        `Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      return {
        verified: false,
        phoneNumbers: 0,
        callerIds: 0,
        webhookReachable: false,
        failoverReachable: false,
        sipTrunkHealthy: false,
        latencyMs: 0,
        errors,
      };
    }
  }

  private getCallerId(direction: CallDirection): string {
    if (direction === 'OUTBOUND' && this.outboundProfileId) {
      return this.outboundProfileId;
    }
    return process.env.TELNYX_PRIMARY_PHONE_NUMBER || '';
  }

  private mapTelnyxState(state: string): CallState {
    const stateMap: Record<string, CallState> = {
      initiated: 'INITIATING',
      ringing: 'RINGING',
      answered: 'ANSWERED',
      bridged: 'ACTIVE',
      hangup: 'COMPLETED',
      completed: 'COMPLETED',
      busy: 'BUSY',
      no_answer: 'NO_ANSWER',
      voicemail: 'VOICEMAIL',
      failed: 'FAILED',
      rejected: 'REJECTED',
    };
    return stateMap[state.toLowerCase()] || 'CREATED';
  }

  private mapEventType(eventType: string): NormalizedEventType {
    const eventMap: Record<string, NormalizedEventType> = {
      'call.initiated': 'CALL_INITIATED',
      'call.ringing': 'CALL_RINGING',
      'call.answered': 'CALL_ANSWERED',
      'call.hangup': 'CALL_HANGUP',
      'call.bridged': 'CALL_BRIDGED',
      'call.transferred': 'CALL_TRANSFERRED',
      'call.recording.available': 'CALL_RECORDING_AVAILABLE',
      'call.stream.started': 'CALL_STREAM_STARTED',
      'call.stream.stopped': 'CALL_STREAM_STOPPED',
      'call.machine.detected': 'CALL_MACHINE_DETECTED',
      'call.failed': 'CALL_FAILED',
    };
    return eventMap[eventType] || 'CALL_FAILED';
  }

  private getTerminationReason(
    eventType: string,
    callState: string
  ): CallTerminationReason | undefined {
    if (eventType === 'call.hangup') {
      if (callState === 'answered' || callState === 'bridged') {
        return 'CALLER_HANGUP';
      }
      return 'NO_ANSWER';
    }
    if (eventType === 'call.failed') {
      return 'FAILED_PROVIDER';
    }
    if (callState === 'busy') {
      return 'BUSY';
    }
    if (callState === 'voicemail') {
      return 'VOICEMAIL';
    }
    return undefined;
  }

  private buildSipHeaders(options: CallStartOptions): Record<string, string> {
    return {
      'X-VoxDesk-Call-ID': options.workspaceId,
      'X-VoxDesk-Tenant-ID': options.workspaceId,
      'X-VoxDesk-Business-ID': options.businessId,
      'X-VoxDesk-Contact-ID': options.contactId || '',
      'X-VoxDesk-Campaign-ID': options.campaignId || '',
      'X-VoxDesk-Direction': options.direction,
      'X-VoxDesk-Language': options.language,
      'X-VoxDesk-Agent-Version': options.agentVersionId,
    };
  }
}

