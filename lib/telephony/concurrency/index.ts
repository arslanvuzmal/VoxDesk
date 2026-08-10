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

export class ConcurrencyManager {
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
    return `voxdesk:concurrency:active:${scopeType}:${scopeId}`;
  }

  private getLeaseIndexKey(leaseId: string): string {
    return `voxdesk:concurrency:lease:${leaseId}`;
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
    const redis = this.getRedis();

    if (redis) {
      try {
        const lease: ConcurrencyLease = {
          id: crypto.randomUUID(),
          scopeType,
          scopeId,
          callId,
          direction,
          acquiredAt: new Date(),
          expiresAt: new Date(Date.now() + config.ttlSeconds * 1000),
          status: 'ACTIVE',
        };

        const member = `${direction}:${lease.id}`;
        const indexKey = this.getLeaseIndexKey(lease.id);
        const result = (await redis.eval(
          `local key=KEYS[1]
local index=KEYS[2]
local now=tonumber(ARGV[1])
local expires=tonumber(ARGV[2])
local direction=ARGV[3]
local member=ARGV[4]
local maxTotal=tonumber(ARGV[5])
local reserve=tonumber(ARGV[6])
local outboundThrottle=tonumber(ARGV[7])
local ttl=tonumber(ARGV[8])
local payload=ARGV[9]
redis.call('ZREMRANGEBYSCORE',key,'-inf',now)
local members=redis.call('ZRANGE',key,0,-1)
local inbound=0
local outbound=0
for _,value in ipairs(members) do
  if string.sub(value,1,8)=='INBOUND:' then inbound=inbound+1 else outbound=outbound+1 end
end
local total=inbound+outbound
if total>=maxTotal then return {0,total} end
if direction=='OUTBOUND' then
  local allowed=math.min(outboundThrottle,maxTotal-reserve-inbound)
  if allowed<=0 or outbound>=allowed then return {-1,total} end
end
redis.call('ZADD',key,expires,member)
redis.call('PEXPIRE',key,ttl*2)
redis.call('SET',index,cjson.encode({key=key,member=member,payload=payload}),'PX',ttl)
return {1,total+1}`,
          [counterKey, indexKey],
          [
            Date.now(),
            lease.expiresAt.getTime(),
            direction,
            member,
            config.maxConcurrent,
            config.inboundReserve,
            config.outboundThrottle,
            config.ttlSeconds * 1000,
            JSON.stringify(lease),
          ]
        )) as [number, number];
        if (result[0] !== 1) {
          return {
            acquired: false,
            reason: result[0] === -1 ? 'outbound_throttled' : 'max_concurrent_reached',
            currentUsage: result[1],
            maxConcurrent: direction === 'INBOUND' ? config.maxConcurrent : config.outboundThrottle,
          };
        }

        return {
          acquired: true,
          leaseId: lease.id,
          currentUsage: result[1],
          maxConcurrent: direction === 'INBOUND' ? config.maxConcurrent : config.outboundThrottle,
        };
      } catch (error) {
        console.error('[CONCURRENCY] Redis acquire failed');
        return { acquired: false, reason: 'redis_unavailable' };
      }
    }

    if (process.env.NODE_ENV === 'production') {
      return { acquired: false, reason: 'redis_not_configured' };
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
    let outboundUsage = 0;

    for (const lease of this.localLeases.values()) {
      if (lease.scopeType === scopeType && lease.scopeId === scopeId && lease.status === 'ACTIVE') {
        currentUsage++;
        if (lease.direction === 'INBOUND') inboundUsage++;
        else outboundUsage++;
      }
    }

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
      const availableForOutbound = Math.min(
        config.outboundThrottle,
        config.maxConcurrent - config.inboundReserve - inboundUsage
      );
      if (
        availableForOutbound <= 0 ||
        outboundUsage >= availableForOutbound ||
        currentUsage >= config.maxConcurrent
      ) {
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

  async releaseLeaseById(leaseId: string): Promise<boolean> {
    const redis = this.getRedis();
    if (redis) {
      try {
        const result = (await redis.eval(
          `local raw=redis.call('GET',KEYS[1])
if not raw then return 0 end
local lease=cjson.decode(raw)
redis.call('ZREM',lease.key,lease.member)
redis.call('DEL',KEYS[1])
return 1`,
          [this.getLeaseIndexKey(leaseId)],
          []
        )) as number;
        return result === 1;
      } catch {
        return false;
      }
    }
    for (const lease of this.localLeases.values()) {
      if (lease.id === leaseId && lease.status === 'ACTIVE') {
        lease.status = 'RELEASED';
        lease.releasedAt = new Date();
        return true;
      }
    }
    return false;
  }

  async heartbeat(leaseId: string): Promise<boolean> {
    const redis = this.getRedis();

    if (redis) {
      try {
        const ttlMs = 300_000;
        const result = (await redis.eval(
          `local raw=redis.call('GET',KEYS[1])
if not raw then return 0 end
local lease=cjson.decode(raw)
redis.call('ZADD',lease.key,ARGV[1],lease.member)
redis.call('PEXPIRE',lease.key,ARGV[2]*2)
redis.call('PEXPIRE',KEYS[1],ARGV[2])
return 1`,
          [this.getLeaseIndexKey(leaseId)],
          [Date.now() + ttlMs, ttlMs]
        )) as number;
        return result === 1;
      } catch {
        return false;
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
        await redis.zremrangebyscore(counterKey, '-inf', Date.now());
        return await redis.zcard(counterKey);
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
    const counterKey = this.getCounterKey(scopeType, scopeId);

    if (redis) {
      try {
        await redis.zremrangebyscore(counterKey, '-inf', Date.now());
        const members = await redis.zrange<string[]>(counterKey, 0, -1);
        return members.filter(member => member.startsWith('INBOUND:')).length;
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
          const keys = await redis.keys(`voxdesk:concurrency:active:${scopeType}:*`);
          for (const key of keys) {
            cleaned += await redis.zremrangebyscore(key, '-inf', Date.now());
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
            ? `voxdesk:concurrency:active:${type}:${scopeId}`
            : `voxdesk:concurrency:active:${type}:*`;
          const keys = await redis.keys(pattern);
          for (const key of keys) {
            await redis.zremrangebyscore(key, '-inf', Date.now());
            const members = await redis.zrange<string[]>(key, 0, -1);
            for (const member of members) {
              const leaseId = member.slice(member.indexOf(':') + 1);
              const index = await redis.get<{ payload?: string }>(this.getLeaseIndexKey(leaseId));
              if (index?.payload) {
                leases.push(JSON.parse(index.payload) as ConcurrencyLease);
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
        await concurrencyManager.releaseLeaseById(leaseId);
      }
      return { success: false, leases: acquiredLeases, failed: failedScopes };
    }
  }

  return { success: true, leases: acquiredLeases, failed: [] };
}

export async function releaseCallLeases(callId: string, leases: string[]): Promise<void> {
  void callId;
  for (const leaseId of leases) {
    await concurrencyManager.releaseLeaseById(leaseId);
  }
}
