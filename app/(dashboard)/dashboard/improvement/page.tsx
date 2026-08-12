import { prisma } from '@/lib/database';
import { requireDashboardPermission } from '@/lib/auth/dashboard-context';

export default async function ImprovementPage() {
  const { workspaceId } = await requireDashboardPermission('improvement:view');
  const [observations, proposals, candidates] = await Promise.all([
    prisma.improvementObservation.findMany({
      where: { workspaceId },
      orderBy: { lastObservedAt: 'desc' },
      take: 50,
    }),
    prisma.improvementProposal.findMany({
      where: { workspaceId },
      orderBy: { updatedAt: 'desc' },
      take: 50,
    }),
    prisma.deploymentCandidate.findMany({
      where: { workspaceId },
      orderBy: { updatedAt: 'desc' },
      take: 25,
    }),
  ]);
  return (
    <div className="space-y-7">
      <header className="border-b border-[#E2E8F0] pb-4">
        <h1 className="text-xl font-semibold">Improvement</h1>
        <p className="mt-1 text-sm text-[#64748B]">
          Supervised observations, proposals, evaluation candidates, canaries, and rollback state.
        </p>
      </header>
      <section className="grid sm:grid-cols-3 border border-[#E2E8F0] rounded-lg bg-white overflow-hidden">
        {[
          ['Open observations', observations.filter(item => item.status === 'OPEN').length],
          [
            'Awaiting decision',
            proposals.filter(item => !item.decision || item.decision === 'PENDING').length,
          ],
          [
            'Candidate versions',
            candidates.filter(item => !['DEPLOYED', 'ROLLED_BACK'].includes(item.status)).length,
          ],
        ].map(([label, count]) => (
          <div key={label} className="p-4 border-r border-[#E2E8F0] last:border-r-0">
            <p className="text-xs text-[#64748B]">{label}</p>
            <p className="mt-2 text-2xl font-semibold">{count}</p>
          </div>
        ))}
      </section>
      <section className="rounded-lg border border-[#E2E8F0] bg-white">
        <div className="p-4 border-b border-[#E2E8F0]">
          <h2 className="font-semibold">Proposed changes</h2>
        </div>
        <div className="divide-y divide-[#E2E8F0]">
          {proposals.length === 0 ? (
            <p className="p-8 text-center text-sm text-[#64748B]">
              No improvement proposals have been generated yet.
            </p>
          ) : (
            proposals.map(proposal => (
              <article key={proposal.id} className="p-4 grid md:grid-cols-[1fr_auto] gap-3">
                <div>
                  <h3 className="font-semibold text-sm">{proposal.title}</h3>
                  <p className="mt-1 text-sm text-[#64748B]">{proposal.description}</p>
                  <p className="mt-2 text-xs text-[#475569]">
                    Expected benefit: {proposal.expectedBenefit}
                  </p>
                  <p className="mt-1 text-xs text-[#475569]">
                    Risk: {proposal.risk || 'Not provided'} Â· Rollback:{' '}
                    {proposal.rollbackPath || 'Not provided'}
                  </p>
                </div>
                <div className="text-xs md:text-right">
                  <p>{proposal.status}</p>
                  <p className="mt-1 text-[#64748B]">Decision: {proposal.decision || 'Pending'}</p>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
      <section className="rounded-lg border border-[#E2E8F0] bg-white">
        <div className="p-4 border-b border-[#E2E8F0]">
          <h2 className="font-semibold">Recurring observations</h2>
        </div>
        <div className="divide-y divide-[#E2E8F0]">
          {observations.length === 0 ? (
            <p className="p-8 text-center text-sm text-[#64748B]">
              No reviewed conversation issues have been recorded yet.
            </p>
          ) : (
            observations.map(observation => (
              <article key={observation.id} className="p-4">
                <div className="flex justify-between gap-4">
                  <h3 className="text-sm font-semibold">
                    {observation.category.replaceAll('_', ' ')}
                  </h3>
                  <span className="text-xs text-[#64748B]">
                    {observation.affectedCalls} conversations
                  </span>
                </div>
                <p className="mt-1 text-sm text-[#64748B]">{observation.description}</p>
              </article>
            ))
          )}
        </div>
      </section>
      <p className="text-xs text-[#64748B]">
        Approval creates a candidate only. Production remains unchanged until evaluation, regression
        gates, canary review, and an authorized promotion.
      </p>
    </div>
  );
}
