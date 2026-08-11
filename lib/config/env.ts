import { z } from 'zod';

/**
 * Portfolio-demo runtime configuration.
 *
 * Only DATABASE_URL is required for the application itself. Provider credentials
 * are optional until the corresponding capability is explicitly enabled.
 */
const envSchema = z.object({
  APP_URL: z.string().url().optional().default('http://localhost:3000'),
  NEXT_PUBLIC_APP_URL: z.string().url().optional().default('http://localhost:3000'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

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
  AUTH_SECRET: z.string().optional(),
  ENCRYPTION_KEY: z.string().optional(),
  INTERNAL_API_SECRET: z.string().optional(),
  DEMO_SESSION_SECRET: z.string().optional(),
  IP_HASH_SECRET: z.string().optional(),
  PHONE_HASH_SECRET: z.string().optional(),
  DEMO_DATA_ENCRYPTION_KEY: z.string().optional(),
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
  CLOUDFLARE_MAX_STT_SECONDS_PER_SESSION: z.string().default('1800'),
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

function getEnv() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    throw new Error(
      `Invalid environment configuration: ${result.error.issues
        .map(issue => issue.path.join('.'))
        .join(', ')}`
    );
  }
  return result.data;
}

export function getMissingEnvironmentVariables(): string[] {
  return process.env.DATABASE_URL ? [] : ['DATABASE_URL'];
}

export function reportMissingVariables(): void {
  const missing = getMissingEnvironmentVariables();
  if (missing.length > 0) console.error('Missing required environment variables:', missing.join(', '));
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
