import 'server-only';

export interface TelephonyFeatureFlags {
  TELNYX_TELEPHONY_ENABLED: boolean;
  TELNYX_INBOUND_ENABLED: boolean;
  TELNYX_OUTBOUND_ENABLED: boolean;
  OUTBOUND_CAMPAIGNS_ENABLED: boolean;
  CALL_RECORDING_ENABLED: boolean;
  SUPERVISED_IMPROVEMENT_ENABLED: boolean;
  MULTILINGUAL_TELEPHONY_ENABLED: boolean;
}

export function getTelephonyFeatureFlags(): TelephonyFeatureFlags {
  const raw = process.env;

  function parseBool(key: string, defaultValue: boolean): boolean {
    const val = raw[key];
    if (val === undefined || val === '') return defaultValue;
    return val.toLowerCase() === 'true';
  }

  return {
    TELNYX_TELEPHONY_ENABLED: parseBool('TELNYX_TELEPHONY_ENABLED', false),
    TELNYX_INBOUND_ENABLED: parseBool('TELNYX_INBOUND_ENABLED', false),
    TELNYX_OUTBOUND_ENABLED: parseBool('TELNYX_OUTBOUND_ENABLED', false),
    OUTBOUND_CAMPAIGNS_ENABLED: parseBool('OUTBOUND_CAMPAIGNS_ENABLED', false),
    CALL_RECORDING_ENABLED: parseBool('CALL_RECORDING_ENABLED', false),
    SUPERVISED_IMPROVEMENT_ENABLED: parseBool('SUPERVISED_IMPROVEMENT_ENABLED', false),
    MULTILINGUAL_TELEPHONY_ENABLED: parseBool('MULTILINGUAL_TELEPHONY_ENABLED', false),
  };
}

export function isTelephonyEnabled(): boolean {
  return getTelephonyFeatureFlags().TELNYX_TELEPHONY_ENABLED;
}

export function isInboundEnabled(): boolean {
  return getTelephonyFeatureFlags().TELNYX_INBOUND_ENABLED;
}

export function isOutboundEnabled(): boolean {
  return getTelephonyFeatureFlags().TELNYX_OUTBOUND_ENABLED;
}

export function isCampaignsEnabled(): boolean {
  return getTelephonyFeatureFlags().OUTBOUND_CAMPAIGNS_ENABLED;
}
