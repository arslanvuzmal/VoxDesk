import { prisma } from '@/lib/database';
import { requireDashboardPermission } from '@/lib/auth/dashboard-context';

export const dynamic = 'force-dynamic';

export default async function IntegrationsPage() {
  const { workspaceId } = await requireDashboardPermission('credentials:manage');
  const [providers, calendars, crms] = await Promise.all([
    prisma.providerConnection.findMany({
      where: { workspaceId },
      select: {
        id: true,
        displayName: true,
        providerType: true,
        status: true,
        lastHealthCheck: true,
      },
    }),
    prisma.calendarConnection.findMany({
      where: { workspaceId },
      select: { id: true, provider: true, status: true, updatedAt: true },
    }),
    prisma.cRMConnection.findMany({
      where: { workspaceId },
      select: { id: true, provider: true, status: true, updatedAt: true },
    }),
  ]);
  const rows = [
    ...providers.map(item => ({
      id: item.id,
      name: item.displayName,
      type: item.providerType,
      status: item.status,
      observedAt: item.lastHealthCheck,
    })),
    ...calendars.map(item => ({
      id: item.id,
      name: item.provider,
      type: 'CALENDAR',
      status: item.status,
      observedAt: item.updatedAt,
    })),
    ...crms.map(item => ({
      id: item.id,
      name: item.provider,
      type: 'CRM',
      status: item.status,
      observedAt: item.updatedAt,
    })),
  ];

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
          Configuration
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Integrations</h1>
        <p className="mt-1 text-sm text-slate-600">
          Provider readiness reflects persisted configuration and available check timestamps.
        </p>
      </header>
      {rows.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8">
          <h2 className="text-sm font-semibold text-slate-950">No integrations configured</h2>
          <p className="mt-2 text-sm text-slate-600">
            Telephone calling, calendars, and external CRM sync remain unavailable until configured.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Integration</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Last checked or updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map(row => (
                <tr key={`${row.type}-${row.id}`}>
                  <td className="px-4 py-3 font-medium text-slate-950">{row.name}</td>
                  <td className="px-4 py-3 text-slate-600">{row.type}</td>
                  <td className="px-4 py-3 text-slate-700">{row.status}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {row.observedAt ? row.observedAt.toLocaleString() : 'Not checked'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
