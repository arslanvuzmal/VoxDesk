import { requireDashboardPermission } from '@/lib/auth/dashboard-context';

export default async function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  await requireDashboardPermission('analytics:view');
  return children;
}
