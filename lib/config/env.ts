import { z } from "zod";

const envSchema = z.object({
  APP_URL: z.string().default("http://localhost:3000"),
  NEXT_PUBLIC_APP_URL: z.string().default("http://localhost:3000"),

  DATABASE_URL: z.string().optional(),
  DIRECT_URL: z.string().optional(),

  AUTH_SECRET: z.string().min(1, "AUTH_SECRET is required"),
  ENCRYPTION_KEY: z.string().min(1, "ENCRYPTION_KEY is required"),
  INTERNAL_API_SECRET: z.string().min(1, "INTERNAL_API_SECRET is required"),

  DEMO_SESSION_SECRET: z.string().min(1, "DEMO_SESSION_SECRET is required"),
  IP_HASH_SECRET: z.string().min(1, "IP_HASH_SECRET is required"),
  DEMO_DATA_ENCRYPTION_KEY: z.string().optional(),

  // Cloudflare Workers AI Configuration
  CLOUDFLARE_ACCOUNT_ID: z.string().optional(),
  CLOUDFLARE_API_TOKEN: z.string().optional(),
  CLOUDFLARE_AI_GATEWAY_ID: z.string().default("default"),
  CLOUDFLARE_LLM_MODEL: z.string().default("@cf/moonshotai/kimi-k2.6"),
  CLOUDFLARE_STT_MODEL: z.string().default("@cf/deepgram/flux"),
  CLOUDFLARE_TTS_MODEL: z.string().default("@cf/deepgram/aura-2-en"),
  CLOUDFLARE_LLM_TIMEOUT_MS: z.string().default("15000"),
  CLOUDFLARE_MAX_OUTPUT_TOKENS: z.string().default("180"),
  CLOUDFLARE_TEMPERATURE: z.string().default("0.35"),
  CLOUDFLARE_MAX_STT_SECONDS_PER_SESSION: z.string().default("180"),
  CLOUDFLARE_MAX_TTS_CHARACTERS_PER_SESSION: z.string().default("1800"),
  CLOUDFLARE_AI_KILL_SWITCH: z.string().default("false"),

  OPENROUTER_API_KEY: z.string().optional(),
  OPENROUTER_MODEL: z.string().default("openai/gpt-4o-mini"),
  OPENROUTER_MAX_OUTPUT_TOKENS: z.string().default("160"),
  OPENROUTER_TEMPERATURE: z.string().default("0.2"),
  OPENROUTER_TIMEOUT_MS: z.string().default("12000"),

  ELEVENLABS_API_KEY: z.string().optional(),
  ELEVENLABS_VOICE_ID: z.string().optional(),
  ELEVENLABS_TTS_MODEL: z.string().default("eleven_flash_v2_5"),
  ELEVENLABS_STT_MODEL: z.string().default("scribe_v2_realtime"),

  DEMO_ENABLED: z.string().default("true"),
  NEXT_PUBLIC_DEMO_ENABLED: z.string().default("true"),
  DEMO_MAX_DURATION_SECONDS: z.string().default("180"),
  DEMO_MAX_TURNS: z.string().default("6"),
  DEMO_MAX_USER_CHARACTERS_PER_TURN: z.string().default("600"),
  DEMO_MAX_AGENT_CHARACTERS_PER_TURN: z.string().default("350"),
  DEMO_MAX_TTS_CHARACTERS_PER_SESSION: z.string().default("1600"),
  DEMO_MAX_STT_SECONDS_PER_SESSION: z.string().default("180"),
  DEMO_SESSIONS_PER_IP_PER_DAY: z.string().default("3"),
  DEMO_SESSION_COOLDOWN_SECONDS: z.string().default("60"),
  DEMO_MAX_CONCURRENT_SESSIONS_GLOBAL: z.string().default("5"),
  DEMO_GLOBAL_DAILY_SESSION_LIMIT: z.string().default("75"),

  DEMO_LIVE_PROVIDER_KILL_SWITCH: z.string().default("false"),

  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  ALLOW_PRODUCTION_SEED: z.string().default("false"),
  CONTENT_LOGGING_MODE: z.string().default("metadata_only"),
});

function getEnv() {
  const defaultAuthSecret =
    process.env.AUTH_SECRET || "dev-auth-secret-32-chars-minimum-key";
  const defaultEncryptionKey =
    process.env.ENCRYPTION_KEY ||
    "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
  const defaultInternalSecret =
    process.env.INTERNAL_API_SECRET || "dev-internal-api-secret-key";
  const defaultDemoSessionSecret =
    process.env.DEMO_SESSION_SECRET || "dev-demo-session-secret-key-32-chars";
  const defaultIpHashSecret =
    process.env.IP_HASH_SECRET || "dev-ip-hash-salt-secret-32-chars";

  const rawEnv = {
    ...process.env,
    AUTH_SECRET: defaultAuthSecret,
    ENCRYPTION_KEY: defaultEncryptionKey,
    INTERNAL_API_SECRET: defaultInternalSecret,
    DEMO_SESSION_SECRET: defaultDemoSessionSecret,
    IP_HASH_SECRET: defaultIpHashSecret,
  };

  const parseResult = envSchema.safeParse(rawEnv);

  if (!parseResult.success) {
    console.error(
      "[SECURITY ERROR] Invalid environment variables:",
      parseResult.error.format(),
    );
  }

  return parseResult.success ? parseResult.data : (rawEnv as any);
}

export const env = getEnv();
