import { prisma } from '@/lib/database';
import { requireDashboardContext } from '@/lib/auth/dashboard-context';

export default async function CampaignsPage() {
  const { workspaceId } = await requireDashboardContext();
  const campaigns = await prisma.campaign.findMany({
    where: { workspaceId },
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { _count: { select: { recipients: true, attempts: true, conversations: true } } },
  });
  return (
    <div className="space-y-5">
      <header className="border-b border-[#E2E8F0] pb-4">
        <h1 className="text-xl font-semibold">Campaigns</h1>
        <p className="mt-1 text-sm text-[#64748B]">
          Approved outbound workflows with controlled recipients and execution limits.
        </p>
      </header>
      <div className="rounded-lg border border-[#E2E8F0] bg-white overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-xs">
          <thead className="bg-[#F8FAFC] text-[#64748B] border-b border-[#E2E8F0]">
            <tr>
              <th className="p-4">Campaign</th>
              <th className="p-4">Purpose</th>
              <th className="p-4">State</th>
              <th className="p-4">Approval</th>
              <th className="p-4">Recipients</th>
              <th className="p-4">Attempts</th>
              <th className="p-4">Language</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {campaigns.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-[#64748B]">
                  No campaigns have been created yet.
                </td>
              </tr>
            ) : (
              campaigns.map(campaign => (
                <tr key={campaign.id}>
                  <td className="p-4 font-semibold">{campaign.name}</td>
                  <td className="p-4">{campaign.workflowType.replaceAll('_', ' ')}</td>
                  <td className="p-4">{campaign.state}</td>
                  <td className="p-4">{campaign.approvalStatus}</td>
                  <td className="p-4">{campaign._count.recipients}</td>
                  <td className="p-4">{campaign._count.attempts}</td>
                  <td className="p-4">{campaign.language}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-[#64748B]">
        Campaign launch remains unavailable until approval, dry-run, consent, suppression,
        calling-window, caller-ID, and provider readiness checks pass.
      </p>
    </div>
  );
}

