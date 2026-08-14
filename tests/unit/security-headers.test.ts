import { describe, expect, it } from 'vitest';
import nextConfig from '../../next.config';

interface ResponseHeader {
  key: string;
  value: string;
}

function findHeader(headers: ResponseHeader[], key: string): string {
  return headers.find(header => header.key === key)?.value ?? '';
}

describe('application security headers', () => {
  it('applies the baseline to every route', async () => {
    const policies = (await nextConfig.headers?.()) ?? [];
    const policy = policies[0];
    const headers = (policy?.headers ?? []) as ResponseHeader[];

    expect(policy?.source).toBe('/:path*');
    expect(findHeader(headers, 'X-Content-Type-Options')).toBe('nosniff');
    expect(findHeader(headers, 'Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    expect(findHeader(headers, 'X-Frame-Options')).toBe('DENY');
    expect(findHeader(headers, 'Cross-Origin-Opener-Policy')).toBe('same-origin');
    expect(findHeader(headers, 'Strict-Transport-Security')).toContain('max-age=63072000');
  });

  it('restricts browser capabilities and framing without blocking approved voice traffic', async () => {
    const policies = (await nextConfig.headers?.()) ?? [];
    const headers = (policies[0]?.headers ?? []) as ResponseHeader[];
    const permissionsPolicy = findHeader(headers, 'Permissions-Policy');
    const contentSecurityPolicy = findHeader(headers, 'Content-Security-Policy');

    expect(permissionsPolicy).toContain('microphone=(self)');
    expect(permissionsPolicy).toContain('camera=()');
    expect(contentSecurityPolicy).toContain("default-src 'self'");
    expect(contentSecurityPolicy).toContain("frame-ancestors 'none'");
    expect(contentSecurityPolicy).toContain('https://*.elevenlabs.io');
    expect(contentSecurityPolicy).not.toContain("'unsafe-eval'");
  });
});
