import 'server-only';

import { getMissingLiveTelephonyConfiguration, getTelephonyMode, type TelephonyMode } from './mode';

export type TelephonyReadinessState =
  'SIMULATION_READY' | 'PROVIDER_CONFIGURED' | 'LIVE_READY' | 'REQUIRES_ACTIVATION';

export type CapabilityStatus = 'READY' | 'CONFIGURED' | 'REQUIRES_ACTIVATION' | 'NOT_CONFIGURED';

export interface TelephonyCapability {
  implemented: boolean;
  configured: boolean;
  verified: boolean;
  requiresPaidResource: boolean;
  demoAvailable: boolean;
  status: CapabilityStatus;
  reason?: string;
}

export interface TelephonyCapabilityMatrix {
  mode: TelephonyMode;
  readiness: TelephonyReadinessState;
  providerArchitecture: 'TELNYX';
  simulation: TelephonyCapability;
  livePstn: TelephonyCapability;
  capabilities: Record<string, TelephonyCapability>;
  activationRequirements: string[];
}

function configured(value: string | undefined): boolean {
  return Boolean(value?.trim());
}

export function getTelephonyCapabilityMatrix(
  source: Record<string, string | undefined> = process.env
): TelephonyCapabilityMatrix {
  const mode = getTelephonyMode(source.TELEPHONY_MODE);
  const hasTelnyxCredential = configured(source.TELNYX_API_KEY);
  const hasConnection = configured(source.TELNYX_CONNECTION_ID);
  const hasNumber = configured(source.TELNYX_PRIMARY_PHONE_NUMBER);
  const hasOutboundProfile = configured(source.TELNYX_OUTBOUND_VOICE_PROFILE_ID);
  const hasWebhookKey = configured(source.TELNYX_PUBLIC_KEY);
  const hasElevenLabs =
    configured(source.ELEVENLABS_API_KEY) && configured(source.ELEVENLABS_AGENT_ID);
  const hasDatabase = configured(source.DATABASE_URL);
  const missingLive = getMissingLiveTelephonyConfiguration(source);
  const providerConfigured = hasTelnyxCredential && hasConnection;
  const liveConfigured = missingLive.length === 0;

  const simulation: TelephonyCapability = {
    implemented: true,
    configured: mode === 'simulation' && hasDatabase,
    verified: false,
    requiresPaidResource: false,
    demoAvailable: hasDatabase,
    status: mode === 'simulation' && hasDatabase ? 'READY' : 'NOT_CONFIGURED',
    reason: hasDatabase ? undefined : 'DATABASE_URL is required to persist simulated CRM records.',
  };

  const livePstn: TelephonyCapability = {
    implemented: true,
    configured: providerConfigured,
    verified: false,
    requiresPaidResource: true,
    demoAvailable: false,
    status: liveConfigured ? 'CONFIGURED' : 'REQUIRES_ACTIVATION',
    reason: liveConfigured
      ? 'Live resources are configured; provider verification is still required.'
      : missingLive.length > 0
        ? `Activation requires ${missingLive.join(', ')}.`
        : undefined,
  };

  const readiness: TelephonyReadinessState =
    mode === 'simulation' && hasDatabase
      ? 'SIMULATION_READY'
      : mode === 'live' && liveConfigured
        ? 'LIVE_READY'
        : providerConfigured
          ? 'PROVIDER_CONFIGURED'
          : 'REQUIRES_ACTIVATION';

  return {
    mode,
    readiness,
    providerArchitecture: 'TELNYX',
    simulation,
    livePstn,
    capabilities: {
      webVoice: {
        implemented: true,
        configured: hasElevenLabs,
        verified: false,
        requiresPaidResource: false,
        demoAvailable: hasElevenLabs,
        status: hasElevenLabs ? 'CONFIGURED' : 'NOT_CONFIGURED',
        reason: hasElevenLabs ? undefined : 'ElevenLabs API key and agent ID are required.',
      },
      simulatedPhoneCalls: simulation,
      livePstnInbound: {
        implemented: true,
        configured: providerConfigured && hasNumber && hasWebhookKey && hasElevenLabs,
        verified: false,
        requiresPaidResource: true,
        demoAvailable: simulation.demoAvailable,
        status:
          providerConfigured && hasNumber && hasWebhookKey && hasElevenLabs
            ? 'CONFIGURED'
            : 'REQUIRES_ACTIVATION',
        reason: 'A Telnyx number, webhook key, connection and ElevenLabs SIP setup are required.',
      },
      livePstnOutbound: {
        implemented: true,
        configured: providerConfigured && hasNumber && hasOutboundProfile && hasElevenLabs,
        verified: false,
        requiresPaidResource: true,
        demoAvailable: simulation.demoAvailable,
        status:
          providerConfigured && hasNumber && hasOutboundProfile && hasElevenLabs
            ? 'CONFIGURED'
            : 'REQUIRES_ACTIVATION',
        reason: 'A Telnyx caller ID, outbound voice profile and ElevenLabs SIP setup are required.',
      },
      humanTransfer: {
        implemented: true,
        configured: mode === 'live' && liveConfigured,
        verified: false,
        requiresPaidResource: true,
        demoAvailable: simulation.demoAvailable,
        status: mode === 'live' && liveConfigured ? 'CONFIGURED' : 'REQUIRES_ACTIVATION',
        reason:
          'Simulation demonstrates the state flow; live transfer requires an activated Telnyx route.',
      },
      crmTools: {
        implemented: true,
        configured: hasDatabase,
        verified: false,
        requiresPaidResource: false,
        demoAvailable: hasDatabase,
        status: hasDatabase ? 'READY' : 'NOT_CONFIGURED',
        reason: hasDatabase ? undefined : 'DATABASE_URL is required.',
      },
      appointmentBooking: {
        implemented: true,
        configured: hasDatabase,
        verified: false,
        requiresPaidResource: false,
        demoAvailable: hasDatabase,
        status: hasDatabase ? 'READY' : 'NOT_CONFIGURED',
      },
      campaignCalling: {
        implemented: true,
        configured: mode === 'simulation' ? hasDatabase : liveConfigured,
        verified: false,
        requiresPaidResource: mode === 'live',
        demoAvailable: simulation.demoAvailable,
        status: mode === 'simulation' && hasDatabase ? 'READY' : 'REQUIRES_ACTIVATION',
        reason:
          mode === 'simulation'
            ? undefined
            : 'Live campaign execution requires activated Telnyx resources.',
      },
    },
    activationRequirements: missingLive,
  };
}
