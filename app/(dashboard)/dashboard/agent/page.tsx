import { prisma } from '@/lib/database';
import { requireDashboardPermission } from '@/lib/auth/dashboard-context';

export const dynamic = 'force-dynamic';

export default async function AgentPage() {
  const { workspaceId } = await requireDashboardPermission('agents:edit');
  const agents = await prisma.voiceAgent.findMany({
    where: { workspaceId },
    orderBy: { updatedAt: 'desc' },
    include: { versions: { orderBy: { versionNumber: 'desc' }, take: 3 } },
  });

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
          Configuration
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Agent</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-600">
          Published identities and versioned conversation behavior for this workspace.
        </p>
      </header>

      {agents.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8">
          <h2 className="text-sm font-semibold text-slate-950">No agents configured</h2>
          <p className="mt-2 text-sm text-slate-600">
            Complete business onboarding before publishing an agent.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-200 overflow-hidden rounded-lg border border-slate-200 bg-white">
          {agents.map(agent => (
            <article key={agent.id} className="grid gap-5 p-5 lg:grid-cols-[1fr_220px]">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold text-slate-950">{agent.name}</h2>
                  <span className="rounded border border-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                    {agent.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  {agent.description || 'No role description provided.'}
                </p>
                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                  <div>
                    <dt className="text-xs text-slate-500">Provider</dt>
                    <dd className="mt-1 text-slate-900">{agent.voiceProvider}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">Language</dt>
                    <dd className="mt-1 text-slate-900">{agent.language}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">Updated</dt>
                    <dd className="mt-1 text-slate-900">{agent.updatedAt.toLocaleDateString()}</dd>
                  </div>
                </dl>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Recent versions
                </p>
                {agent.versions.length ? (
                  <ul className="mt-2 space-y-2">
                    {agent.versions.map((version, index) => (
                      <li key={version.id} className="flex items-center justify-between text-sm">
                        <span className="text-slate-800">Version {version.versionNumber}</span>
                        <span className="text-xs text-slate-500">
                          {index === 0 ? 'Latest stored' : version.createdAt.toLocaleDateString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-slate-500">No published versions.</p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
