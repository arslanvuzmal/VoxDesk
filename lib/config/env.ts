import { z } from 'zod';

/**
 * Portfolio-demo runtime configuration.
 *
 * Database and security configuration are required for the server runtime. Provider
 * credentials remain optional until their capability is explicitly enabled.
 */
const envSchema = z.object({
  APP_URL: z.string().url().optional().default('http://localhost:3000'),
  NEXT_PUBLIC_APP_URL: z.string().url().optional().default('http://localhost:3000'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  TELEPHONY_MODE: z.enum(['simulation', 'live']).default('simulation'),

  ELEVENLABS_API_KEY: z.string().min(1).optional(),
  ELEVENLABS_AGENT_ID: z.string().min(1).optional(),
  ELEVENLABS_AGENT_ID_LEGAL_EN: z.string().min(1).optional(),
  ELEVENLABS_WEBHOOK_SECRET: z.string().min(1).optional(),

  TELNYX_API_KEY: z.string().min(1).optional(),
  TELNYX_CONNECTION_ID: z.string().min(1).optional(),
  TELNYX_OUTBOUND_VOICE_PROFILE_ID: z.string().min(1).optional(),
  TELNYX_PRIMARY_PHONE_NUMBER: z.string().min(1).optional(),
  TELNYX_PHONE_NUMBER: z.string().min(1).optional(),
  TELNYX_WEBHOOK_SECRET: z.string().min(1).optional(),
  TELNYX_PUBLIC_KEY: z.string().min(1).optional(),
  TELNYX_SIP_USERNAME: z.string().min(1).optional(),
  TELNYX_SIP_PASSWORD: z.string().min(1).optional(),
  TELNYX_SIP_TRUNK_ID: z.string().min(1).optional(),

  TELNYX_TELEPHONY_ENABLED: z.string().default('false'),
  TELNYX_INBOUND_ENABLED: z.string().default('false'),
  TELNYX_OUTBOUND_ENABLED: z.string().default('false'),
  OUTBOUND_CAMPAIGNS_ENABLED: z.string().default('false'),

  // Compatibility settings for routes still being reduced to the portfolio path.
  DEMO_ENABLED: z.string().default('true'),
  DEMO_MODE: z.string().default('true'),
  NEXT_PUBLIC_DEMO_ENABLED: z.string().default('true'),
  DEMO_LIVE_PROVIDER_KILL_SWITCH: z.string().default('false'),
  DEMO_MAX_DURATION_SECONDS: z.string().default('180'),
  DEMO_MAX_TURNS: z.string().default('6'),
  DEMO_MAX_USER_CHARACTERS_PER_TURN: z.string().default('600'),
  DEMO_MAX_AGENT_CHARACTERS_PER_TURN: z.string().default('350'),
  DEMO_MAX_TTS_CHARACTERS_PER_SESSION: z.string().default('1800'),
  DEMO_MAX_STT_SECONDS_PER_SESSION: z.string().default('180'),
  DEMO_SESSIONS_PER_IP_PER_DAY: z.string().default('20'),
  DEMO_SESSION_COOLDOWN_SECONDS: z.string().default('3'),
  DEMO_MAX_CONCURRENT_SESSIONS_GLOBAL: z.string().default('3'),
  DEMO_GLOBAL_DAILY_SESSION_LIMIT: z.string().default('100'),

  VOICE_STARTS_PER_WORKSPACE_PER_MINUTE: z.string().default('10'),
  TEXT_TURNS_PER_WORKSPACE_PER_MINUTE: z.string().default('30'),
  CONTENT_LOGGING_MODE: z.string().default('metadata_only'),

  // Deprecated paths may read these while they are removed. They are never
  // deployment requirements and no provider action is allowed without its own
  // explicit provider credentials.
  AUTH_SECRET: z.string().min(32, 'AUTH_SECRET is required'),
  ENCRYPTION_KEY: z
    .string()
    .regex(/^[a-fA-F0-9]{64}$/, 'ENCRYPTION_KEY must be 64 hexadecimal characters'),
  INTERNAL_API_SECRET: z.string().min(32, 'INTERNAL_API_SECRET is required'),
  DEMO_SESSION_SECRET: z.string().min(32, 'DEMO_SESSION_SECRET is required'),
  IP_HASH_SECRET: z.string().min(32, 'IP_HASH_SECRET is required'),
  PHONE_HASH_SECRET: z.string().min(32, 'PHONE_HASH_SECRET is required'),
  DEMO_DATA_ENCRYPTION_KEY: z.string().min(32).optional(),
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  CLOUDFLARE_ACCOUNT_ID: z.string().optional(),
  CLOUDFLARE_API_TOKEN: z.string().optional(),
  CLOUDFLARE_AI_GATEWAY_ID: z.string().default('default'),
  CLOUDFLARE_LLM_MODEL: z.string().default('@cf/moonshotai/kimi-k2.6'),
  CLOUDFLARE_STT_MODEL: z.string().default('@cf/deepgram/flux'),
  CLOUDFLARE_TTS_MODEL: z.string().default('@cf/deepgram/aura-2-en'),
  CLOUDFLARE_LLM_TIMEOUT_MS: z.string().default('15000'),
  CLOUDFLARE_MAX_OUTPUT_TOKENS: z.string().default('180'),
  CLOUDFLARE_TEMPERATURE: z.string().default('0.35'),
  CLOUDFLARE_MAX_TTS_CHARACTERS_PER_SESSION: z.string().default('1800'),
  CLOUDFLARE_MAX_STT_SECONDS_PER_SESSION: z.string().default('180'),
  CLOUDFLARE_AI_KILL_SWITCH: z.string().default('false'),
  OPENROUTER_API_KEY: z.string().optional(),
  OPENROUTER_MODEL: z.string().default('openai/gpt-4o-mini'),
  OPENROUTER_MAX_OUTPUT_TOKENS: z.string().default('160'),
  OPENROUTER_TEMPERATURE: z.string().default('0.2'),
  OPENROUTER_TIMEOUT_MS: z.string().default('12000'),
  ELEVENLABS_AGENT_PHONE_NUMBER_ID: z.string().optional(),
  ELEVENLABS_VOICE_ID: z.string().optional(),
  ELEVENLABS_VOICE_ID_LEGAL_EN: z.string().optional(),
  ELEVENLABS_TTS_MODEL: z.string().default('eleven_flash_v2_5'),
  ELEVENLABS_STT_MODEL: z.string().default('scribe_v2_realtime'),
  CALL_RECORDING_ENABLED: z.string().default('false'),
  SUPERVISED_IMPROVEMENT_ENABLED: z.string().default('false'),
  MULTILINGUAL_TELEPHONY_ENABLED: z.string().default('false'),
  CONVERSATION_DUAL_WRITE_ENABLED: z.string().default('false'),
  ALLOW_PRODUCTION_SEED: z.string().default('false'),
});

const PRODUCTION_SECURITY_SECRETS = [
  'AUTH_SECRET',
  'ENCRYPTION_KEY',
  'INTERNAL_API_SECRET',
  'DEMO_SESSION_SECRET',
  'IP_HASH_SECRET',
  'PHONE_HASH_SECRET',
] as const;

export function validateProductionSecurityEnvironment(
  source: NodeJS.ProcessEnv = process.env
): string[] {
  if (source.NODE_ENV !== 'production') return [];

  const failures: string[] = PRODUCTION_SECURITY_SECRETS.filter(name => {
    const value = source[name];
    return !value || value.trim().length < 32 || value.startsWith('portfolio-demo-');
  });

  const encryptionKey = source.ENCRYPTION_KEY;
  if (encryptionKey && !/^[a-fA-F0-9]{64}$/.test(encryptionKey)) {
    failures.push('ENCRYPTION_KEY (must be a 64-character hexadecimal key)');
  }

  return [...new Set(failures)];
}

function getEnv() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    throw new Error(
      `Invalid environment configuration: ${result.error.issues
        .map(issue => issue.path.join('.'))
        .join(', ')}`
    );
  }

  const securityFailures = validateProductionSecurityEnvironment();
  if (securityFailures.length > 0) {
    throw new Error(`Invalid production security configuration: ${securityFailures.join(', ')}`);
  }

  return result.data;
}

export function getMissingEnvironmentVariables(): string[] {
  return process.env.DATABASE_URL ? [] : ['DATABASE_URL'];
}

export function reportMissingVariables(): void {
  const missing = getMissingEnvironmentVariables();
  if (missing.length > 0)
    console.error('Missing required environment variables:', missing.join(', '));
}

export function getProviderReadiness() {
  const elevenLabsConfigured = Boolean(env.ELEVENLABS_API_KEY && env.ELEVENLABS_AGENT_ID);
  const telnyxConfigured = Boolean(
    env.TELNYX_API_KEY &&
    env.TELNYX_CONNECTION_ID &&
    (env.TELNYX_PRIMARY_PHONE_NUMBER || env.TELNYX_PHONE_NUMBER)
  );

  return {
    webVoice: {
      configured: elevenLabsConfigured,
      verified: false,
      provider: 'ElevenLabs Conversational AI',
    },
    inboundTelephony: {
      configured: telnyxConfigured && env.TELNYX_INBOUND_ENABLED === 'true',
      verified: false,
      provider: 'Telnyx → ElevenLabs',
      phoneNumbers: [env.TELNYX_PRIMARY_PHONE_NUMBER || env.TELNYX_PHONE_NUMBER].filter(Boolean),
    },
    outboundTelephony: {
      configured:
        telnyxConfigured &&
        Boolean(env.TELNYX_OUTBOUND_VOICE_PROFILE_ID) &&
        env.TELNYX_OUTBOUND_ENABLED === 'true',
      verified: false,
      provider: 'Telnyx → ElevenLabs',
      callerIds: [env.TELNYX_PRIMARY_PHONE_NUMBER || env.TELNYX_PHONE_NUMBER].filter(Boolean),
      consentControls: true,
      suppressionControls: true,
    },
    persistence: { database: true, redis: false },
  };
}

export function validateE164PhoneNumber(phone: string): boolean {
  return /^\+[1-9]\d{1,14}$/.test(phone);
}

export const env = getEnv();
