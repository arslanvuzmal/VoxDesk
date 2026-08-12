import { prisma } from '@/lib/database';
import { requireDashboardPermission } from '@/lib/auth/dashboard-context';

export const dynamic = 'force-dynamic';

export default async function AuditLogsPage() {
  const { workspaceId } = await requireDashboardPermission('audit:view');
  const logs = await prisma.auditLog.findMany({
    where: { workspaceId },
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { user: { select: { name: true, email: true } } },
  });

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">Settings</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Audit log</h1>
        <p className="mt-1 text-sm text-slate-600">
          Recorded workspace configuration and operational actions. Sensitive values are omitted.
        </p>
      </header>
      {logs.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8">
          <h2 className="text-sm font-semibold text-slate-950">No audit events recorded</h2>
          <p className="mt-2 text-sm text-slate-600">
            Audited configuration and workflow actions will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Action</th>
                <th className="px-4 py-3 font-medium">Actor</th>
                <th className="px-4 py-3 font-medium">Resource</th>
                <th className="px-4 py-3 font-medium">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map(log => (
                <tr key={log.id}>
                  <td className="px-4 py-3 font-medium text-slate-950">{log.action}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {log.user?.name || log.user?.email || 'System'}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {log.entityType}
                    {log.entityId ? ` Â· ${log.entityId}` : ''}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{log.createdAt.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
