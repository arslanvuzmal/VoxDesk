import { describe, expect, it } from 'vitest';

import { resolveApplicationUrl } from '@/lib/config/application-url';

describe('resolveApplicationUrl', () => {
  it('treats a blank configured URL as unset and uses the Vercel production hostname', () => {
    expect(
      resolveApplicationUrl({
        NEXT_PUBLIC_APP_URL: '   ',
        VERCEL_PROJECT_PRODUCTION_URL: 'voxdesk-ai.vercel.app',
      })
    ).toBe('https://voxdesk-ai.vercel.app');
  });

  it('uses the deployment hostname for preview builds', () => {
    expect(
      resolveApplicationUrl({
        NEXT_PUBLIC_APP_URL: '',
        VERCEL_URL: 'voxdesk-git-fix-example.vercel.app',
      })
    ).toBe('https://voxdesk-git-fix-example.vercel.app');
  });

  it('falls back to localhost outside a Vercel deployment', () => {
    expect(resolveApplicationUrl({ NEXT_PUBLIC_APP_URL: '' })).toBe('http://localhost:3000');
  });

  it('normalizes an explicitly configured application URL', () => {
    expect(
      resolveApplicationUrl({
        NEXT_PUBLIC_APP_URL: ' https://example.com/path ',
      })
    ).toBe('https://example.com');
  });

  it('rejects malformed non-empty configuration', () => {
    expect(() =>
      resolveApplicationUrl({
        NEXT_PUBLIC_APP_URL: 'not-a-url',
      })
    ).toThrow('NEXT_PUBLIC_APP_URL must be an absolute HTTP(S) URL');
  });
});
