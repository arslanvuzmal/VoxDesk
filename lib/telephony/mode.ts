import 'server-only';

export type TelephonyMode = 'simulation' | 'live';

export class TelephonyConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TelephonyConfigurationError';
  }
}

export function getTelephonyMode(rawValue = process.env.TELEPHONY_MODE): TelephonyMode {
  if (!rawValue || rawValue.trim() === '') return 'simulation';
  const normalized = rawValue.trim().toLowerCase();
  if (normalized === 'simulation' || normalized === 'live') return normalized;
  throw new TelephonyConfigurationError('TELEPHONY_MODE must be either "simulation" or "live".');
}

export function getMissingLiveTelephonyConfiguration(
  source: Record<string, string | undefined> = process.env
): string[] {
  const required = [
    'TELNYX_API_KEY',
    'TELNYX_PUBLIC_KEY',
    'TELNYX_CONNECTION_ID',
    'TELNYX_PRIMARY_PHONE_NUMBER',
    'TELNYX_OUTBOUND_VOICE_PROFILE_ID',
    'ELEVENLABS_API_KEY',
    'ELEVENLABS_AGENT_ID',
    'DATABASE_URL',
    'APP_URL',
  ];
  return required.filter(key => !source[key]?.trim());
}

export function assertLiveTelephonyConfiguration(): void {
  if (getTelephonyMode() !== 'live') {
    throw new TelephonyConfigurationError(
      'Live PSTN execution is disabled while TELEPHONY_MODE=simulation.'
    );
  }
  const missing = getMissingLiveTelephonyConfiguration();
  if (missing.length > 0) {
    throw new TelephonyConfigurationError(
      `Live PSTN is not activated. Missing: ${missing.join(', ')}.`
    );
  }
}
