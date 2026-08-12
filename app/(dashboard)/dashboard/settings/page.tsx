import { prisma } from '@/lib/database';
import { requireDashboardPermission } from '@/lib/auth/dashboard-context';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const { workspaceId } = await requireDashboardPermission('workspace:manage');
  const business = await prisma.businessProfile.findUnique({ where: { workspaceId } });

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
          Configuration
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Settings</h1>
        <p className="mt-1 text-sm text-slate-600">
          Business identity and routing defaults currently stored for this workspace.
        </p>
      </header>
      {!business ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8">
          <h2 className="text-sm font-semibold text-slate-950">Business setup is incomplete</h2>
          <p className="mt-2 text-sm text-slate-600">
            Add a business profile before publishing agents or telephone routing.
          </p>
        </div>
      ) : (
        <dl className="grid gap-px overflow-hidden rounded-lg border border-slate-200 bg-slate-200 sm:grid-cols-2">
          {[
            ['Business name', business.businessName],
            ['Timezone', business.timezone],
            ['Default language', business.defaultLanguage],
            ['Description', business.description || 'Not provided'],
          ].map(([label, value]) => (
            <div key={label} className="bg-white p-5">
              <dt className="text-xs font-medium text-slate-500">{label}</dt>
              <dd className="mt-2 text-sm text-slate-950">{value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
