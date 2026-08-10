import { Redis } from '@upstash/redis';
import { env } from '@/lib/config/env';

export type FeatureFlagKey =
  | 'TELNYX_TELEPHONY_ENABLED'
  | 'TELNYX_INBOUND_ENABLED'
  | 'TELNYX_OUTBOUND_ENABLED'
  | 'OUTBOUND_CAMPAIGNS_ENABLED'
  | 'CALL_RECORDING_ENABLED'
  | 'SUPERVISED_IMPROVEMENT_ENABLED'
  | 'MULTILINGUAL_TELEPHONY_ENABLED'
  | 'CONVERSATION_DUAL_WRITE_ENABLED';

export interface FeatureFlagConfig {
  key: FeatureFlagKey;
  defaultValue: boolean;
  description: string;
  requiresProvider: string[];
}

export const FEATURE_FLAGS: Record<FeatureFlagKey, FeatureFlagConfig> = {
  TELNYX_TELEPHONY_ENABLED: {
    key: 'TELNYX_TELEPHONY_ENABLED',
    defaultValue: false,
    description: 'Enable Telnyx as telephony provider',
    requiresProvider: ['telnyx'],
  },
  TELNYX_INBOUND_ENABLED: {
    key: 'TELNYX_INBOUND_ENABLED',
    defaultValue: false,
    description: 'Enable inbound call handling via Telnyx',
    requiresProvider: ['telnyx'],
  },
  TELNYX_OUTBOUND_ENABLED: {
    key: 'TELNYX_OUTBOUND_ENABLED',
    defaultValue: false,
    description: 'Enable outbound call initiation via Telnyx',
    requiresProvider: ['telnyx'],
  },
  OUTBOUND_CAMPAIGNS_ENABLED: {
    key: 'OUTBOUND_CAMPAIGNS_ENABLED',
    defaultValue: false,
    description: 'Enable controlled outbound campaign system',
    requiresProvider: ['telnyx'],
  },
  CALL_RECORDING_ENABLED: {
    key: 'CALL_RECORDING_ENABLED',
    defaultValue: false,
    description: 'Enable call recording (subject to jurisdiction)',
    requiresProvider: ['telnyx'],
  },
  SUPERVISED_IMPROVEMENT_ENABLED: {
    key: 'SUPERVISED_IMPROVEMENT_ENABLED',
    defaultValue: false,
    description: 'Enable supervised continuous improvement loop',
    requiresProvider: [],
  },
  MULTILINGUAL_TELEPHONY_ENABLED: {
    key: 'MULTILINGUAL_TELEPHONY_ENABLED',
    defaultValue: false,
    description: 'Enable multilingual telephony support',
    requiresProvider: ['elevenlabs', 'telnyx'],
  },
  CONVERSATION_DUAL_WRITE_ENABLED: {
    key: 'CONVERSATION_DUAL_WRITE_ENABLED',
    defaultValue: env.CONVERSATION_DUAL_WRITE_ENABLED === 'true',
    description: 'Dual-write active Call records into the canonical Conversation domain',
    requiresProvider: [],
  },
};

class FeatureFlagStore {
  private redis: Redis | null = null;
  private memoryCache: Map<string, { value: boolean; expiresAt: number }> = new Map();
  private cacheTtlMs = 60_000;

  private getRedis(): Redis | null {
    if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) {
      return null;
    }
    if (!this.redis) {
      this.redis = new Redis({
        url: env.UPSTASH_REDIS_REST_URL,
        token: env.UPSTASH_REDIS_REST_TOKEN,
      });
    }
    return this.redis;
  }

  private getCacheKey(key: FeatureFlagKey, workspaceId?: string): string {
    return `feature:${key}${workspaceId ? `:${workspaceId}` : ':global'}`;
  }

  async isEnabled(key: FeatureFlagKey, workspaceId?: string): Promise<boolean> {
    const config = FEATURE_FLAGS[key];
    const redis = this.getRedis();
    const cacheKey = this.getCacheKey(key, workspaceId);

    const cached = this.memoryCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.value;
    }

    let value = config.defaultValue;

    if (redis) {
      try {
        const stored = await redis.get<string>(cacheKey);
        if (stored !== null) {
          value = stored === 'true';
        } else {
          await redis.set(cacheKey, value.toString(), { ex: 60 });
        }
      } catch {
        value = config.defaultValue;
      }
    }

    this.memoryCache.set(cacheKey, { value, expiresAt: Date.now() + this.cacheTtlMs });
    return value;
  }

  async setEnabled(key: FeatureFlagKey, enabled: boolean, workspaceId?: string): Promise<void> {
    const redis = this.getRedis();
    const cacheKey = this.getCacheKey(key, workspaceId);

    if (redis) {
      await redis.set(cacheKey, enabled.toString(), { ex: 300 });
    }

    this.memoryCache.set(cacheKey, { value: enabled, expiresAt: Date.now() + this.cacheTtlMs });
  }

  async getAllFlags(workspaceId?: string): Promise<Record<FeatureFlagKey, boolean>> {
    const result: Partial<Record<FeatureFlagKey, boolean>> = {};

    for (const key of Object.keys(FEATURE_FLAGS) as FeatureFlagKey[]) {
      result[key] = await this.isEnabled(key, workspaceId);
    }

    return result as Record<FeatureFlagKey, boolean>;
  }

  getFlagConfig(key: FeatureFlagKey): FeatureFlagConfig {
    return FEATURE_FLAGS[key];
  }
}

export const featureFlags = new FeatureFlagStore();

export async function getProviderReadiness(workspaceId: string): Promise<{
  webVoice: { configured: boolean; verified: boolean; provider: string };
  inboundTelephony: {
    configured: boolean;
    verified: boolean;
    provider: string;
    phoneNumbers: number;
  };
  outboundTelephony: {
    configured: boolean;
    verified: boolean;
    callerIds: number;
    consentControls: boolean;
    suppressionControls: boolean;
  };
  persistence: { database: boolean; redis: boolean };
}> {
  const flags = await featureFlags.getAllFlags(workspaceId);

  const databaseConfigured = Boolean(process.env.DATABASE_URL);
  let databaseReachable = false;
  try {
    if (databaseConfigured) {
      const { prisma } = await import('@/lib/database');
      await prisma.$queryRaw`SELECT 1`;
      databaseReachable = true;
    }
  } catch {
    databaseReachable = false;
  }

  const redisConfigured = Boolean(env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN);
  let redisReachable = false;
  if (redisConfigured) {
    try {
      const redis = new Redis({
        url: env.UPSTASH_REDIS_REST_URL!,
        token: env.UPSTASH_REDIS_REST_TOKEN!,
      });
      const res = await redis.ping();
      redisReachable = res === 'PONG';
    } catch {
      redisReachable = false;
    }
  }

  const elevenLabsConfigured = Boolean(process.env.ELEVENLABS_API_KEY);
  let elevenLabsVerified = false;
  if (elevenLabsConfigured) {
    try {
      const { ElevenLabsClient } = await import('@elevenlabs/elevenlabs-js');
      const agentId = process.env.ELEVENLABS_AGENT_ID_LEGAL_EN || process.env.ELEVENLABS_AGENT_ID;
      if (agentId) {
        const client = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY! });
        const agent = await client.conversationalAi.agents.get(agentId);
        elevenLabsVerified = Boolean(agent && agent.agentId);
      }
    } catch {
      elevenLabsVerified = false;
    }
  }

  const telnyxConfigured = Boolean(process.env.TELNYX_API_KEY && process.env.TELNYX_CONNECTION_ID);
  let telnyxVerified = false;
  let phoneNumbers = 0;
  let callerIds = 0;
  if (telnyxConfigured) {
    try {
      const response = await fetch(
        'https://api.telnyx.com/v2/phone_numbers?filter[connection_id]=eq:' +
          process.env.TELNYX_CONNECTION_ID,
        {
          headers: { Authorization: `Bearer ${process.env.TELNYX_API_KEY}` },
          cache: 'no-store',
        }
      );
      if (response.ok) {
        const data = await response.json();
        phoneNumbers = data.data?.length || 0;
        telnyxVerified = phoneNumbers > 0;
      }

      if (process.env.TELNYX_OUTBOUND_VOICE_PROFILE_ID) {
        const callerIdRes = await fetch(
          `https://api.telnyx.com/v2/outbound_voice_profiles/${process.env.TELNYX_OUTBOUND_VOICE_PROFILE_ID}`,
          {
            headers: { Authorization: `Bearer ${process.env.TELNYX_API_KEY}` },
            cache: 'no-store',
          }
        );
        if (callerIdRes.ok) {
          const data = await callerIdRes.json();
          callerIds = data.data?.caller_ids?.length || 0;
        }
      }
    } catch {
      telnyxVerified = false;
    }
  }

  return {
    webVoice: {
      configured: elevenLabsConfigured,
      verified: elevenLabsVerified,
      provider: 'elevenlabs',
    },
    inboundTelephony: {
      configured:
        flags.TELNYX_TELEPHONY_ENABLED && flags.TELNYX_INBOUND_ENABLED && telnyxConfigured,
      verified: telnyxVerified,
      provider: 'telnyx',
      phoneNumbers,
    },
    outboundTelephony: {
      configured:
        flags.TELNYX_TELEPHONY_ENABLED && flags.TELNYX_OUTBOUND_ENABLED && telnyxConfigured,
      verified: telnyxVerified,
      callerIds,
      consentControls: Boolean(process.env.TELNYX_API_KEY),
      suppressionControls: redisConfigured && redisReachable,
    },
    persistence: {
      database: databaseReachable,
      redis: redisReachable,
    },
  };
}

