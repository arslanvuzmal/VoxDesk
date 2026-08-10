import { describe, it, expect } from 'vitest';
import { hasPermission, enforcePermission } from '../../lib/permissions';
import { requireAuthUser, requireWorkspaceAccess } from '../../lib/auth/require-session';
import { NextRequest } from 'next/server';

describe('Multi-Tenant Workspace RBAC & Authentication Security', () => {
  it('should allow OWNER to perform all workspace management actions', () => {
    expect(hasPermission('OWNER', 'workspace:manage')).toBe(true);
    expect(hasPermission('OWNER', 'workspace:delete')).toBe(true);
    expect(hasPermission('OWNER', 'credentials:manage')).toBe(true);
  });

  it('should deny VIEWER from creating agents or deleting workspaces', () => {
    expect(hasPermission('VIEWER', 'agents:create')).toBe(false);
    expect(hasPermission('VIEWER', 'workspace:delete')).toBe(false);
    expect(() => enforcePermission('VIEWER', 'agents:create')).toThrow();
  });

  it('should return 401 for requests missing authentication headers', async () => {
    const req = new NextRequest('https://voxdesk-ai.vercel.app/api/leads');
    const result = await requireAuthUser(req);

    expect('errorResponse' in result).toBe(true);
    if ('errorResponse' in result) {
      expect(result.errorResponse.status).toBe(401);
    }
  });

  it('should return 401 for invalid session tokens', async () => {
    const req = new NextRequest('https://voxdesk-ai.vercel.app/api/leads', {
      headers: { authorization: 'Bearer invalid_fake_token_123' },
    });
    const result = await requireAuthUser(req);

    expect('errorResponse' in result).toBe(true);
    if ('errorResponse' in result) {
      expect(result.errorResponse.status).toBe(401);
    }
  });

  it('rejects forged public demo sandbox headers', async () => {
    const req = new NextRequest('https://voxdesk-ai.vercel.app/api/leads', {
      headers: { 'x-demo-sandbox': 'true' },
    });
    const result = await requireWorkspaceAccess(req, 'ws_demo_default');

    expect('errorResponse' in result).toBe(true);
    if ('errorResponse' in result) {
      expect(result.errorResponse.status).toBe(401);
    }
  });

  it('rejects removed static dashboard session tokens', async () => {
    const req = new NextRequest('https://voxdesk-ai.vercel.app/api/leads', {
      headers: { authorization: 'Bearer demo-session-token-owner' },
    });
    const result = await requireAuthUser(req);

    expect('errorResponse' in result).toBe(true);
    if ('errorResponse' in result) {
      expect(result.errorResponse.status).toBe(401);
    }
  });
});
