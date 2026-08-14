import { describe, expect, it } from 'vitest';
import { getVisibleDashboardRoutes } from '@/lib/navigation/dashboard-routes';

describe('dashboard navigation permissions', () => {
  it('shows every configured surface to an owner', () => {
    const routes = getVisibleDashboardRoutes('OWNER').map(route => route.href);

    expect(routes).toContain('/dashboard/settings');
    expect(routes).toContain('/dashboard/integrations');
    expect(routes).toContain('/dashboard/agent');
    expect(routes).toContain('/dashboard/improvement');
  });

  it('limits operators to operational and permitted insight surfaces', () => {
    const routes = getVisibleDashboardRoutes('OPERATOR').map(route => route.href);

    expect(routes).toContain('/dashboard/conversations');
    expect(routes).toContain('/dashboard/campaigns');
    expect(routes).toContain('/dashboard/analytics');
    expect(routes).toContain('/dashboard/improvement');
    expect(routes).not.toContain('/dashboard/settings');
    expect(routes).not.toContain('/dashboard/integrations');
    expect(routes).not.toContain('/dashboard/agent');
    expect(routes).not.toContain('/dashboard/knowledge');
  });

  it('does not expose configuration surfaces to read-only roles', () => {
    for (const role of ['ANALYST', 'VIEWER'] as const) {
      const routes = getVisibleDashboardRoutes(role).map(route => route.href);

      expect(routes).toContain('/dashboard/conversations');
      expect(routes).toContain('/dashboard/analytics');
      expect(routes).not.toContain('/dashboard/settings');
      expect(routes).not.toContain('/dashboard/integrations');
      expect(routes).not.toContain('/dashboard/agent');
      expect(routes).not.toContain('/dashboard/knowledge');
    }
  });

  it('only references permissions implemented by the canonical RBAC model', () => {
    expect(() => getVisibleDashboardRoutes('OWNER')).not.toThrow();
  });
});
