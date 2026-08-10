import { z } from 'zod';

const envSchema = z.object({
  APP_URL: z.string().default('http://localhost:3000'),
  NEXT_PUBLIC_APP_URL: z.string().default('http://localhost:3000'),

  DATABASE_URL: z.string().optional(),
  DIRECT_URL: z.string().optional(),

  AUTH_SECRET: z.string().min(1, 'AUTH_SECRET is required'),
  ENCRYPTION_KEY: z.string().min(1, 'ENCRYPTION_KEY is required'),
  INTERNAL_API_SECRET: z.string().min(1, 'INTERNAL_API_SECRET is required'),

  DEMO_SESSION_SECRET: z.string().min(1, 'DEMO_SESSION_SECRET is required'),
  IP_HASH_SECRET: z.string().min(1, 'IP_HASH_SECRET is required'),
  PHONE_HASH_SECRET: z.string().min(1, 'PHONE_HASH_SECRET is required'),
  DEMO_DATA_ENCRYPTION_KEY: z.string().optional(),

  // Cloudflare Workers AI Configuration
  CLOUDFLARE_ACCOUNT_ID: z.string().optional(),
  CLOUDFLARE_API_TOKEN: z.string().optional(),
  CLOUDFLARE_AI_GATEWAY_ID: z.string().default('default'),
  CLOUDFLARE_LLM_MODEL: z.string().default('@cf/moonshotai/kimi-k2.6'),
  CLOUDFLARE_STT_MODEL: z.string().default('@cf/deepgram/flux'),
  CLOUDFLARE_TTS_MODEL: z.string().default('@cf/deepgram/aura-2-en'),
  CLOUDFLARE_LLM_TIMEOUT_MS: z.string().default('15000'),
  CLOUDFLARE_MAX_OUTPUT_TOKENS: z.string().default('180'),
  CLOUDFLARE_TEMPERATURE: z.string().default('0.35'),
  CLOUDFLARE_MAX_STT_SECONDS_PER_SESSION: z.string().default('180'),
  CLOUDFLARE_MAX_TTS_CHARACTERS_PER_SESSION: z.string().default('1800'),
  CLOUDFLARE_AI_KILL_SWITCH: z.string().default('false'),

  OPENROUTER_API_KEY: z.string().optional(),
  OPENROUTER_MODEL: z.string().default('openai/gpt-4o-mini'),
  OPENROUTER_MAX_OUTPUT_TOKENS: z.string().default('160'),
  OPENROUTER_TEMPERATURE: z.string().default('0.2'),
  OPENROUTER_TIMEOUT_MS: z.string().default('12000'),

  ELEVENLABS_API_KEY: z.string().optional(),
  ELEVENLABS_WEBHOOK_SECRET: z.string().optional(),
  ELEVENLABS_AGENT_ID: z.string().optional(),
  ELEVENLABS_AGENT_ID_LEGAL_EN: z.string().optional(),
  ELEVENLABS_AGENT_PHONE_NUMBER_ID: z.string().optional(),
  ELEVENLABS_VOICE_ID: z.string().optional(),
  ELEVENLABS_VOICE_ID_LEGAL_EN: z.string().optional(),
  ELEVENLABS_TTS_MODEL: z.string().default('eleven_flash_v2_5'),
  ELEVENLABS_STT_MODEL: z.string().default('scribe_v2_realtime'),

  DEMO_ENABLED: z.string().default('true'),
  DEMO_MODE: z.string().default('false'),
  NEXT_PUBLIC_DEMO_ENABLED: z.string().default('true'),
  DEMO_MAX_DURATION_SECONDS: z.string().default('180'),
  DEMO_MAX_TURNS: z.string().default('6'),
  DEMO_MAX_USER_CHARACTERS_PER_TURN: z.string().default('600'),
  DEMO_MAX_AGENT_CHARACTERS_PER_TURN: z.string().default('350'),
  DEMO_MAX_TTS_CHARACTERS_PER_SESSION: z.string().default('1800'),
  DEMO_MAX_STT_SECONDS_PER_SESSION: z.string().default('180'),
  DEMO_SESSIONS_PER_IP_PER_DAY: z.string().default('50'),
  DEMO_SESSION_COOLDOWN_SECONDS: z.string().default('3'),
  DEMO_MAX_CONCURRENT_SESSIONS_GLOBAL: z.string().default('50'),
  DEMO_GLOBAL_DAILY_SESSION_LIMIT: z.string().default('1000'),
  VOICE_STARTS_PER_WORKSPACE_PER_MINUTE: z.string().default('20'),
  TEXT_TURNS_PER_WORKSPACE_PER_MINUTE: z.string().default('60'),

  DEMO_LIVE_PROVIDER_KILL_SWITCH: z.string().default('false'),

  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // Telnyx Voice API and SIP trunking
  TELNYX_API_KEY: z.string().optional(),
  TELNYX_PUBLIC_KEY: z.string().optional(),
  TELNYX_CONNECTION_ID: z.string().optional(),
  TELNYX_OUTBOUND_VOICE_PROFILE_ID: z.string().optional(),
  TELNYX_PRIMARY_PHONE_NUMBER: z.string().optional(),
  TELNYX_WEBHOOK_SECRET: z.string().optional(),
  TELNYX_SIP_USERNAME: z.string().optional(),
  TELNYX_SIP_PASSWORD: z.string().optional(),
  TELNYX_SIP_TRUNK_ID: z.string().optional(),

  // Feature flags (default all false for safe production delivery)
  TELNYX_TELEPHONY_ENABLED: z.string().default('false'),
  TELNYX_INBOUND_ENABLED: z.string().default('false'),
  TELNYX_OUTBOUND_ENABLED: z.string().default('false'),
  OUTBOUND_CAMPAIGNS_ENABLED: z.string().default('false'),
  CALL_RECORDING_ENABLED: z.string().default('false'),
  SUPERVISED_IMPROVEMENT_ENABLED: z.string().default('false'),
  MULTILINGUAL_TELEPHONY_ENABLED: z.string().default('false'),
  CONVERSATION_DUAL_WRITE_ENABLED: z.string().default('false'),

  ALLOW_PRODUCTION_SEED: z.string().default('false'),
  CONTENT_LOGGING_MODE: z.string().default('metadata_only'),
});

function getEnv() {
  const isProduction = process.env.NODE_ENV === 'production';
  const developmentDefaults = isProduction
    ? {}
    : {
        AUTH_SECRET: 'dev-auth-secret-32-chars-minimum-key',
        ENCRYPTION_KEY: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
        INTERNAL_API_SECRET: 'dev-internal-api-secret-key',
        DEMO_SESSION_SECRET: 'dev-demo-session-secret-key-32-chars',
        IP_HASH_SECRET: 'dev-ip-hash-salt-secret-32-chars',
        PHONE_HASH_SECRET: 'dev-phone-hash-secret-32-chars',
      };

  const rawEnv = {
    ...developmentDefaults,
    ...process.env,
    UPSTASH_REDIS_REST_URL:
      process.env.UPSTASH_REDIS_REST_URL ||
      process.env.KV_REST_API_URL ||
      process.env.REDIS_URL ||
      undefined,
    UPSTASH_REDIS_REST_TOKEN:
      process.env.UPSTASH_REDIS_REST_TOKEN ||
      process.env.KV_REST_API_TOKEN ||
      process.env.KV_REST_API_READ_ONLY_TOKEN ||
      undefined,
  };

  const parseResult = envSchema.safeParse(rawEnv);

  if (!parseResult.success) {
    throw new Error(
      `Invalid environment configuration: ${parseResult.error.issues
        .map(issue => issue.path.join('.'))
        .join(', ')}`
    );
  }

  return parseResult.data;
}

export function getMissingEnvironmentVariables(): string[] {
  const requiredKeys = [
    'AUTH_SECRET',
    'ENCRYPTION_KEY',
    'INTERNAL_API_SECRET',
    'DEMO_SESSION_SECRET',
    'IP_HASH_SECRET',
    'PHONE_HASH_SECRET',
    'DATABASE_URL',
  ];
  const missing: string[] = [];
  for (const key of requiredKeys) {
    if (!process.env[key] || process.env[key] === '') {
      missing.push(key);
    }
  }
  return missing;
}

export function reportMissingVariables(): void {
  const missing = getMissingEnvironmentVariables();
  if (missing.length > 0) {
    console.error('[SECURITY ERROR] Missing required environment variables:', missing.join(', '));
  }
}

export function getProviderReadiness(): {
  webVoice: { configured: boolean; verified: boolean; provider: string };
  inboundTelephony: {
    configured: boolean;
    verified: boolean;
    provider: string;
    phoneNumbers: string[];
  };
  outboundTelephony: {
    configured: boolean;
    verified: boolean;
    provider: string;
    callerIds: string[];
    consentControls: boolean;
    suppressionControls: boolean;
  };
  persistence: { database: boolean; redis: boolean };
} {
  const telnyxEnabled = env.TELNYX_TELEPHONY_ENABLED === 'true';
  const inboundEnabled = env.TELNYX_INBOUND_ENABLED === 'true';
  const outboundEnabled = env.TELNYX_OUTBOUND_ENABLED === 'true';
  const elevenLabsConfigured = Boolean(env.ELEVENLABS_API_KEY && env.ELEVENLABS_AGENT_ID_LEGAL_EN);
  const databaseConfigured = Boolean(env.DATABASE_URL);
  const redisConfigured = Boolean(env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN);

  return {
    webVoice: {
      configured: elevenLabsConfigured,
      verified: elevenLabsConfigured,
      provider: 'ElevenLabs Conversational AI (WebRTC)',
    },
    inboundTelephony: {
      configured:
        telnyxEnabled &&
        inboundEnabled &&
        Boolean(env.TELNYX_API_KEY && env.TELNYX_CONNECTION_ID && env.TELNYX_PRIMARY_PHONE_NUMBER),
      verified: false, // Requires live verification
      provider: 'Telnyx Voice API â†’ ElevenLabs SIP',
      phoneNumbers: env.TELNYX_PRIMARY_PHONE_NUMBER ? [env.TELNYX_PRIMARY_PHONE_NUMBER] : [],
    },
    outboundTelephony: {
      configured:
        telnyxEnabled &&
        outboundEnabled &&
        Boolean(env.TELNYX_API_KEY && env.TELNYX_OUTBOUND_VOICE_PROFILE_ID),
      verified: false, // Requires live verification
      provider: 'Telnyx Voice API â†’ ElevenLabs SIP',
      callerIds: env.TELNYX_PRIMARY_PHONE_NUMBER ? [env.TELNYX_PRIMARY_PHONE_NUMBER] : [],
      consentControls: true,
      suppressionControls: true,
    },
    persistence: {
      database: databaseConfigured,
      redis: redisConfigured,
    },
  };
}

export function validateE164PhoneNumber(phone: string): boolean {
  const e164Regex = /^\+[1-9]\d{1,14}$/;
  return e164Regex.test(phone);
}

export const env = getEnv();
