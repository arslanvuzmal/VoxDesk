import { describe, it, expect } from 'vitest';
import { isCloudflareAIConfigured } from '@/lib/providers/cloudflare/client.server';

describe('Cloudflare Workers AI Security & Isolation Tests', () => {
  it('never exposes NEXT_PUBLIC Cloudflare API token or Account ID', () => {
    expect(process.env.NEXT_PUBLIC_CLOUDFLARE_API_TOKEN).toBeUndefined();
    expect(process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID).toBeUndefined();
  });

  it('safely detects unconfigured Cloudflare credentials without throwing error', () => {
    // In test environment without explicit token, isCloudflareAIConfigured returns boolean
    const configured = isCloudflareAIConfigured();
    expect(typeof configured).toBe('boolean');
  });
});
