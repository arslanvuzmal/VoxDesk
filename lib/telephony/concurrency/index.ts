import { Redis } from '@upstash/redis';
import { env } from '@/lib/config/env';

export type ConcurrencyScopeType =
  'TENANT' | 'BUSINESS' | 'AGENT' | 'PHONE_NUMBER' | 'CAMPAIGN' | 'CONNECTION' | 'GLOBAL';

export interface ConcurrencyConfig {
  maxConcurrent: number;
  inboundReserve: number;
  outboundThrottle: number;
  ttlSeconds: number;
  heartbeatIntervalMs: number;
}

export interface ConcurrencyLease {
  id: string;
  scopeType: ConcurrencyScopeType;
  scopeId: string;
  callId: string;
  direction: 'INBOUND' | 'OUTBOUND';
  acquiredAt: Date;
  expiresAt: Date;
  releasedAt?: Date;
  heartbeatAt?: Date;
  status: 'ACTIVE' | 'EXPIRED' | 'RELEASED';
}

export interface LeaseResult {
  acquired: boolean;
  leaseId?: string;
  reason?: string;
  currentUsage?: number;
  maxConcurrent?: number;
}

const DEFAULT_CONFIGS: Record<ConcurrencyScopeType, ConcurrencyConfig> = {
  TENANT: {
    maxConcurrent: 50,
    inboundReserve: 10,
    outboundThrottle: 40,
    ttlSeconds: 300,
    heartbeatIntervalMs: 30_000,
  },
  BUSINESS: {
    maxConcurrent: 20,
    inboundReserve: 5,
    outboundThrottle: 15,
    ttlSeconds: 300,
    heartbeatIntervalMs: 30_000,
  },
  AGENT: {
    maxConcurrent: 10,
    inboundReserve: 3,
    outboundThrottle: 7,
    ttlSeconds: 300,
    heartbeatIntervalMs: 30_000,
  },
  PHONE_NUMBER: {
    maxConcurrent: 1,
    inboundReserve: 1,
    outboundThrottle: 0,
    ttlSeconds: 300,
    heartbeatIntervalMs: 30_000,
  },
  CAMPAIGN: {
    maxConcurrent: 5,
    inboundReserve: 0,
    outboundThrottle: 5,
    ttlSeconds: 300,
    heartbeatIntervalMs: 30_000,
  },
  CONNECTION: {
    maxConcurrent: 100,
    inboundReserve: 20,
    outboundThrottle: 80,
    ttlSeconds: 300,
    heartbeatIntervalMs: 30_000,
  },
  GLOBAL: {
    maxConcurrent: 200,
    inboundReserve: 50,
    outboundThrottle: 150,
    ttlSeconds: 300,
    heartbeatIntervalMs: 30_000,
  },
};

class ConcurrencyManager {
  private redis: Redis | null = null;
  private localLeases: Map<string, ConcurrencyLease> = new Map();

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

  private getLeaseKey(scopeType: ConcurrencyScopeType, scopeId: string, callId: string): string {
    return `voxdesk:concurrency:${scopeType}:${scopeId}:${callId}`;
  }

  private getCounterKey(scopeType: ConcurrencyScopeType, scopeId: string): string {
    return `voxdesk:concurrency:counter:${scopeType}:${scopeId}`;
  }

  private getConfig(scopeType: ConcurrencyScopeType): ConcurrencyConfig {
    return DEFAULT_CONFIGS[scopeType];
  }

  async acquireLease(
    scopeType: ConcurrencyScopeType,
    scopeId: string,
    callId: string,
    direction: 'INBOUND' | 'OUTBOUND'
  ): Promise<LeaseResult> {
    const config = this.getConfig(scopeType);
    const counterKey = this.getCounterKey(scopeType, scopeId);
    const leaseKey = this.getLeaseKey(scopeType, scopeId, callId);
    const redis = this.getRedis();

    const maxForDirection =
      direction === 'INBOUND' ? config.maxConcurrent : config.outboundThrottle;
    const reservedForInbound = config.inboundReserve;

    if (redis) {
      try {
        const currentUsage = await this.getCurrentUsage(scopeType, scopeId);
        const inboundUsage = await this.getInboundUsage(scopeType, scopeId);

        if (direction === 'INBOUND') {
          if (currentUsage >= config.maxConcurrent) {
            return {
              acquired: false,
              reason: 'max_concurrent_reached',
              currentUsage,
              maxConcurrent: config.maxConcurrent,
            };
          }
        } else {
          const availableForOutbound = config.maxConcurrent - inboundUsage - reservedForInbound;
          if (availableForOutbound <= 0 || currentUsage >= config.maxConcurrent) {
            return {
              acquired: false,
              reason: 'outbound_throttled',
              currentUsage,
              maxConcurrent: config.outboundThrottle,
            };
          }
        }

        const lease: ConcurrencyLease = {
          id: `lease_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          scopeType,
          scopeId,
          callId,
          direction,
          acquiredAt: new Date(),
          expiresAt: new Date(Date.now() + config.ttlSeconds * 1000),
          status: 'ACTIVE',
        };

        await redis.set(leaseKey, JSON.stringify(lease), { ex: config.ttlSeconds });
        await redis.incr(counterKey);
        await redis.expire(counterKey, config.ttlSeconds * 2);

        return {
          acquired: true,
          leaseId: lease.id,
          currentUsage: currentUsage + 1,
          maxConcurrent: direction === 'INBOUND' ? config.maxConcurrent : config.outboundThrottle,
        };
      } catch (error) {
        console.error('[CONCURRENCY] Redis acquire failed, falling back to local:', error);
      }
    }

    return this.acquireLocalLease(scopeType, scopeId, callId, direction);
  }

  private async acquireLocalLease(
    scopeType: ConcurrencyScopeType,
    scopeId: string,
    callId: string,
    direction: 'INBOUND' | 'OUTBOUND'
  ): Promise<LeaseResult> {
    const config = this.getConfig(scopeType);
    const counterKey = this.getCounterKey(scopeType, scopeId);

    let currentUsage = 0;
    let inboundUsage = 0;

    for (const lease of this.localLeases.values()) {
      if (lease.scopeType === scopeType && lease.scopeId === scopeId && lease.status === 'ACTIVE') {
        currentUsage++;
        if (lease.direction === 'INBOUND') inboundUsage++;
      }
    }

    const maxForDirection =
      direction === 'INBOUND' ? config.maxConcurrent : config.outboundThrottle;
    const reservedForInbound = config.inboundReserve;

    if (direction === 'INBOUND') {
      if (currentUsage >= config.maxConcurrent) {
        return {
          acquired: false,
          reason: 'max_concurrent_reached',
          currentUsage,
          maxConcurrent: config.maxConcurrent,
        };
      }
    } else {
      const availableForOutbound = config.maxConcurrent - inboundUsage - reservedForInbound;
      if (availableForOutbound <= 0 || currentUsage >= config.maxConcurrent) {
        return {
          acquired: false,
          reason: 'outbound_throttled',
          currentUsage,
          maxConcurrent: config.outboundThrottle,
        };
      }
    }

    const lease: ConcurrencyLease = {
      id: `lease_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      scopeType,
      scopeId,
      callId,
      direction,
      acquiredAt: new Date(),
      expiresAt: new Date(Date.now() + config.ttlSeconds * 1000),
      status: 'ACTIVE',
    };

    this.localLeases.set(`${scopeType}:${scopeId}:${callId}`, lease);
    return {
      acquired: true,
      leaseId: lease.id,
      currentUsage: currentUsage + 1,
      maxConcurrent: direction === 'INBOUND' ? config.maxConcurrent : config.outboundThrottle,
    };
  }

  async releaseLease(
    scopeType: ConcurrencyScopeType,
    scopeId: string,
    callId: string
  ): Promise<boolean> {
    const leaseKey = this.getLeaseKey(scopeType, scopeId, callId);
    const counterKey = this.getCounterKey(scopeType, scopeId);
    const redis = this.getRedis();

    if (redis) {
      try {
        const leaseData = await redis.get<string>(leaseKey);
        if (leaseData) {
          const lease = JSON.parse(leaseData) as ConcurrencyLease;
          lease.status = 'RELEASED';
          lease.releasedAt = new Date();
          await redis.set(leaseKey, JSON.stringify(lease), { ex: 60 });
          await redis.decr(counterKey);
          return true;
        }
      } catch (error) {
        console.error('[CONCURRENCY] Redis release failed:', error);
      }
    }

    const localKey = `${scopeType}:${scopeId}:${callId}`;
    const lease = this.localLeases.get(localKey);
    if (lease) {
      lease.status = 'RELEASED';
      lease.releasedAt = new Date();
      return true;
    }

    return false;
  }

  async heartbeat(leaseId: string): Promise<boolean> {
    const redis = this.getRedis();

    if (redis) {
      try {
        for (const scopeType of [
          'TENANT',
          'BUSINESS',
          'AGENT',
          'PHONE_NUMBER',
          'CAMPAIGN',
          'CONNECTION',
          'GLOBAL',
        ] as ConcurrencyScopeType[]) {
          const keys = await redis.keys(`voxdesk:concurrency:${scopeType}:*:*`);
          for (const key of keys) {
            const data = await redis.get<string>(key);
            if (data) {
              const lease = JSON.parse(data) as ConcurrencyLease;
              if (lease.id === leaseId && lease.status === 'ACTIVE') {
                lease.heartbeatAt = new Date();
                lease.expiresAt = new Date(
                  Date.now() + this.getConfig(scopeType).ttlSeconds * 1000
                );
                await redis.set(key, JSON.stringify(lease), {
                  ex: this.getConfig(scopeType).ttlSeconds,
                });
                return true;
              }
            }
          }
        }
      } catch (error) {
        console.error('[CONCURRENCY] Heartbeat failed:', error);
      }
    }

    for (const lease of this.localLeases.values()) {
      if (lease.id === leaseId) {
        lease.heartbeatAt = new Date();
        lease.expiresAt = new Date(Date.now() + this.getConfig(lease.scopeType).ttlSeconds * 1000);
        return true;
      }
    }

    return false;
  }

  async getCurrentUsage(scopeType: ConcurrencyScopeType, scopeId: string): Promise<number> {
    const redis = this.getRedis();
    const counterKey = this.getCounterKey(scopeType, scopeId);

    if (redis) {
      try {
        const count = await redis.get<number>(counterKey);
        return count || 0;
      } catch {
        return 0;
      }
    }

    let count = 0;
    for (const lease of this.localLeases.values()) {
      if (lease.scopeType === scopeType && lease.scopeId === scopeId && lease.status === 'ACTIVE') {
        count++;
      }
    }
    return count;
  }

  async getInboundUsage(scopeType: ConcurrencyScopeType, scopeId: string): Promise<number> {
    const redis = this.getRedis();
    const pattern = `voxdesk:concurrency:${scopeType}:${scopeId}:*`;

    if (redis) {
      try {
        const keys = await redis.keys(pattern);
        let count = 0;
        for (const key of keys) {
          const data = await redis.get<string>(key);
          if (data) {
            const lease = JSON.parse(data) as ConcurrencyLease;
            if (lease.direction === 'INBOUND' && lease.status === 'ACTIVE') {
              count++;
            }
          }
        }
        return count;
      } catch {
        return 0;
      }
    }

    let count = 0;
    for (const lease of this.localLeases.values()) {
      if (
        lease.scopeType === scopeType &&
        lease.scopeId === scopeId &&
        lease.direction === 'INBOUND' &&
        lease.status === 'ACTIVE'
      ) {
        count++;
      }
    }
    return count;
  }

  async cleanupStaleLeases(): Promise<number> {
    const redis = this.getRedis();
    let cleaned = 0;

    if (redis) {
      try {
        for (const scopeType of [
          'TENANT',
          'BUSINESS',
          'AGENT',
          'PHONE_NUMBER',
          'CAMPAIGN',
          'CONNECTION',
          'GLOBAL',
        ] as ConcurrencyScopeType[]) {
          const keys = await redis.keys(`voxdesk:concurrency:${scopeType}:*:*`);
          for (const key of keys) {
            const data = await redis.get<string>(key);
            if (data) {
              const lease = JSON.parse(data) as ConcurrencyLease;
              if (lease.status === 'ACTIVE' && new Date(lease.expiresAt) < new Date()) {
                lease.status = 'EXPIRED';
                await redis.set(key, JSON.stringify(lease), { ex: 60 });
                const counterKey = this.getCounterKey(scopeType, lease.scopeId);
                await redis.decr(counterKey);
                cleaned++;
              }
            }
          }
        }
      } catch (error) {
        console.error('[CONCURRENCY] Cleanup failed:', error);
      }
    }

    for (const [key, lease] of this.localLeases.entries()) {
      if (lease.status === 'ACTIVE' && new Date(lease.expiresAt) < new Date()) {
        lease.status = 'EXPIRED';
        cleaned++;
      }
    }

    return cleaned;
  }

  async getActiveLeases(
    scopeType?: ConcurrencyScopeType,
    scopeId?: string
  ): Promise<ConcurrencyLease[]> {
    const redis = this.getRedis();
    const leases: ConcurrencyLease[] = [];

    if (redis) {
      try {
        const types = scopeType
          ? [scopeType]
          : ([
              'TENANT',
              'BUSINESS',
              'AGENT',
              'PHONE_NUMBER',
              'CAMPAIGN',
              'CONNECTION',
              'GLOBAL',
            ] as ConcurrencyScopeType[]);
        for (const type of types) {
          const pattern = scopeId
            ? `voxdesk:concurrency:${type}:${scopeId}:*`
            : `voxdesk:concurrency:${type}:*:*`;
          const keys = await redis.keys(pattern);
          for (const key of keys) {
            const data = await redis.get<string>(key);
            if (data) {
              const lease = JSON.parse(data) as ConcurrencyLease;
              if (lease.status === 'ACTIVE') {
                leases.push(lease);
              }
            }
          }
        }
      } catch (error) {
        console.error('[CONCURRENCY] Get active leases failed:', error);
      }
    }

    for (const lease of this.localLeases.values()) {
      if (
        lease.status === 'ACTIVE' &&
        (!scopeType || lease.scopeType === scopeType) &&
        (!scopeId || lease.scopeId === scopeId)
      ) {
        leases.push(lease);
      }
    }

    return leases;
  }
}

export const concurrencyManager = new ConcurrencyManager();

export async function acquireCallLeases(
  workspaceId: string,
  businessId: string,
  agentId: string,
  phoneNumberId?: string,
  campaignId?: string,
  direction: 'INBOUND' | 'OUTBOUND' = 'INBOUND'
): Promise<{ success: boolean; leases: string[]; failed: string[] }> {
  const scopes: Array<{ type: ConcurrencyScopeType; id: string }> = [
    { type: 'TENANT', id: workspaceId },
    { type: 'BUSINESS', id: businessId },
    { type: 'AGENT', id: agentId },
    { type: 'GLOBAL', id: 'platform' },
  ];

  if (phoneNumberId) {
    scopes.push({ type: 'PHONE_NUMBER', id: phoneNumberId });
  }

  if (campaignId) {
    scopes.push({ type: 'CAMPAIGN', id: campaignId });
  }

  const callId = `call_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const acquiredLeases: string[] = [];
  const failedScopes: string[] = [];

  for (const scope of scopes) {
    const result = await concurrencyManager.acquireLease(scope.type, scope.id, callId, direction);
    if (result.acquired && result.leaseId) {
      acquiredLeases.push(result.leaseId);
    } else {
      failedScopes.push(`${scope.type}:${scope.id} (${result.reason})`);
      for (const leaseId of acquiredLeases) {
        await concurrencyManager.releaseLease('TENANT', workspaceId, callId);
      }
      return { success: false, leases: acquiredLeases, failed: failedScopes };
    }
  }

  return { success: true, leases: acquiredLeases, failed: [] };
}

export async function releaseCallLeases(callId: string, leases: string[]): Promise<void> {
  for (const leaseId of leases) {
    await concurrencyManager.heartbeat(leaseId);
  }
}
