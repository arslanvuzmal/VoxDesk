import 'server-only';
import { Redis } from '@upstash/redis';
import { env } from '@/lib/config/env';

const localWindows = new Map<string, { count: number; expiresAt: number }>();

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

export async function enforceWorkspaceRateLimit(
  action: string,
  workspaceId: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  if (
    !Number.isInteger(limit) ||
    limit < 1 ||
    !Number.isInteger(windowSeconds) ||
    windowSeconds < 1
  ) {
    return { allowed: false, retryAfterSeconds: windowSeconds || 60 };
  }
  const key = `voxdesk:rate:${action}:${workspaceId}`;
  const redisConfigured = Boolean(env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN);

  if (redisConfigured) {
    try {
      const redis = new Redis({
        url: env.UPSTASH_REDIS_REST_URL!,
        token: env.UPSTASH_REDIS_REST_TOKEN!,
      });
      const count = Number(
        await redis.eval(
          `local count=redis.call('INCR',KEYS[1])
if count == 1 then redis.call('EXPIRE',KEYS[1],ARGV[1]) end
return count`,
          [key],
          [windowSeconds]
        )
      );
      const ttl = Math.max(1, Number(await redis.ttl(key)) || windowSeconds);
      return { allowed: count <= limit, retryAfterSeconds: ttl };
    } catch {
      return { allowed: false, retryAfterSeconds: windowSeconds };
    }
  }

  if (process.env.NODE_ENV === 'production') {
    return { allowed: false, retryAfterSeconds: windowSeconds };
  }
  const now = Date.now();
  const current = localWindows.get(key);
  if (!current || current.expiresAt <= now) {
    localWindows.set(key, { count: 1, expiresAt: now + windowSeconds * 1000 });
    return { allowed: true, retryAfterSeconds: windowSeconds };
  }
  current.count += 1;
  return {
    allowed: current.count <= limit,
    retryAfterSeconds: Math.max(1, Math.ceil((current.expiresAt - now) / 1000)),
  };
}
