import { describe, expect, it } from 'vitest';
import {
  normalizeEnvironmentInput,
  validateProductionSecurityEnvironment,
} from '@/lib/config/env';

const validProductionEnvironment: NodeJS.ProcessEnv = {
  NODE_ENV: 'production',
  AUTH_SECRET: 'a'.repeat(32),
  ENCRYPTION_KEY: 'a'.repeat(64),
  INTERNAL_API_SECRET: 'b'.repeat(32),
  DEMO_SESSION_SECRET: 'c'.repeat(32),
  IP_HASH_SECRET: 'd'.repeat(32),
  PHONE_HASH_SECRET: 'e'.repeat(32),
};

describe('production security configuration', () => {
  it('treats blank optional values as unconfigured without changing real values', () => {
    const normalized = normalizeEnvironmentInput({
      DATABASE_URL: 'postgresql://database.example/voxdesk',
      TELNYX_API_KEY: '   ',
    });

    expect(normalized.DATABASE_URL).toBe('postgresql://database.example/voxdesk');
    expect(normalized.TELNYX_API_KEY).toBeUndefined();
  });

  it('rejects missing production secrets', () => {
    const { INTERNAL_API_SECRET: _, ...missingSecret } = validProductionEnvironment;
    expect(validateProductionSecurityEnvironment(missingSecret)).toContain('INTERNAL_API_SECRET');
  });

  it('rejects known portfolio fallback values in production', () => {
    expect(
      validateProductionSecurityEnvironment({
        ...validProductionEnvironment,
        AUTH_SECRET: 'portfolio-demo-auth-disabled',
      })
    ).toContain('AUTH_SECRET');
  });

  it('requires a hexadecimal AES-256 encryption key in production', () => {
    expect(
      validateProductionSecurityEnvironment({
        ...validProductionEnvironment,
        ENCRYPTION_KEY: 'not-a-hex-key'.repeat(6),
      })
    ).toContain('ENCRYPTION_KEY (must be a 64-character hexadecimal key)');
  });

  it('does not impose production requirements in local development', () => {
    expect(validateProductionSecurityEnvironment({ NODE_ENV: 'development' })).toEqual([]);
  });
});
