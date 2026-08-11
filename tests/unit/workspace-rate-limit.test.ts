import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/config/env', () => ({
  env: { UPSTASH_REDIS_REST_URL: undefined, UPSTASH_REDIS_REST_TOKEN: undefined },
}));

import { enforceWorkspaceRateLimit } from '@/lib/security/workspace-rate-limit';

describe('workspace cost rate limits', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('enforces a bounded local window outside production', async () => {
    vi.stubEnv('NODE_ENV', 'test');
    const key = `workspace-${Date.now()}`;
    expect((await enforceWorkspaceRateLimit('voice', key, 1, 60)).allowed).toBe(true);
    expect((await enforceWorkspaceRateLimit('voice', key, 1, 60)).allowed).toBe(false);
  });

  it('fails closed in production when distributed storage is unavailable', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const result = await enforceWorkspaceRateLimit('voice', 'workspace-production', 20, 60);
    expect(result).toEqual({ allowed: false, retryAfterSeconds: 60 });
  });
});
