import Link from 'next/link';
import { prisma } from '@/lib/database';
import { requireDashboardContext } from '@/lib/auth/dashboard-context';

export default async function OpportunitiesPage() {
  const { workspaceId } = await requireDashboardContext();
  const opportunities = await prisma.opportunity.findMany({
    where: { workspaceId },
    orderBy: { updatedAt: 'desc' },
    take: 100,
    select: {
      id: true,
      title: true,
      serviceInterest: true,
      stage: true,
      confidence: true,
      recommendation: true,
      ownerId: true,
      updatedAt: true,
      contact: { select: { id: true, name: true, company: true } },
      sourceConversation: { select: { id: true } },
    },
  });

  return (
    <div className="space-y-5">
      <header className="border-b border-[#E2E8F0] pb-4">
        <h1 className="text-xl font-semibold">Opportunities</h1>
        <p className="mt-1 text-sm text-[#64748B]">
          Qualified commercial work with its source conversation and supporting recommendation.
        </p>
      </header>
      <div className="overflow-x-auto rounded-lg border border-[#E2E8F0] bg-white">
        <table className="w-full min-w-[860px] text-left text-xs">
          <thead className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B]">
            <tr>
              <th className="p-4">Opportunity</th>
              <th className="p-4">Contact</th>
              <th className="p-4">Stage</th>
              <th className="p-4">Evidence confidence</th>
              <th className="p-4">Recommendation</th>
              <th className="p-4">Source</th>
              <th className="p-4">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {opportunities.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-[#64748B]">
                  No qualified opportunities have been created yet.
                </td>
              </tr>
            ) : (
              opportunities.map(opportunity => (
                <tr key={opportunity.id}>
                  <td className="p-4">
                    <p className="font-semibold text-[#0F172A]">{opportunity.title}</p>
                    <p className="mt-1 text-[#64748B]">
                      {opportunity.serviceInterest || 'Service not provided'}
                    </p>
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-[#0F172A]">{opportunity.contact.name}</p>
                    <p className="mt-1 text-[#64748B]">
                      {opportunity.contact.company || 'Company not provided'}
                    </p>
                  </td>
                  <td className="p-4">{opportunity.stage}</td>
                  <td className="p-4">
                    {opportunity.confidence == null
                      ? 'Not provided'
                      : `${Math.round(opportunity.confidence * 100)}%`}
                  </td>
                  <td className="max-w-[260px] p-4 text-[#475569]">
                    {opportunity.recommendation || 'Not provided'}
                  </td>
                  <td className="p-4">
                    {opportunity.sourceConversation ? (
                      <Link
                        className="text-[#1D4ED8] hover:underline"
                        href={`/dashboard/conversations?selected=${opportunity.sourceConversation.id}`}
                      >
                        Conversation
                      </Link>
                    ) : (
                      'Not available'
                    )}
                  </td>
                  <td className="p-4 text-[#64748B]">{opportunity.updatedAt.toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
