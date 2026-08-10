import { prisma } from '@/lib/database';
import { requireDashboardContext } from '@/lib/auth/dashboard-context';

export const dynamic = 'force-dynamic';

export default async function KnowledgePage() {
  const { workspaceId } = await requireDashboardContext();
  const items = await prisma.knowledgeItem.findMany({
    where: { workspaceId },
    orderBy: [{ updatedAt: 'desc' }],
    take: 100,
  });

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
          Configuration
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Knowledge</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-600">
          Business facts are available to agents only when their workflow treats the item as active
          and within its effective period.
        </p>
      </header>
      {items.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8">
          <h2 className="text-sm font-semibold text-slate-950">No knowledge items</h2>
          <p className="mt-2 text-sm text-slate-600">
            Add and verify business facts before relying on them in conversations.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Knowledge item</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Language</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Version</th>
                <th className="px-4 py-3 font-medium">Verified</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map(item => (
                <tr key={item.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-950">{item.title || item.question}</p>
                    <p className="mt-1 max-w-xl truncate text-xs text-slate-500">
                      {item.content || item.answer}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{item.category}</td>
                  <td className="px-4 py-3 text-slate-600">{item.language}</td>
                  <td className="px-4 py-3 text-slate-700">{item.status}</td>
                  <td className="px-4 py-3 text-slate-600">{item.version}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {item.verifiedAt ? item.verifiedAt.toLocaleDateString() : 'Not verified'}
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
