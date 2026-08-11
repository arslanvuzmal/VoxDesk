import { prisma } from '@/lib/database';
import { requireDashboardContext } from '@/lib/auth/dashboard-context';

export default async function TasksPage() {
  const { workspaceId } = await requireDashboardContext();
  const tasks = await prisma.task.findMany({
    where: { workspaceId },
    orderBy: [{ status: 'asc' }, { dueAt: 'asc' }],
    take: 100,
  });
  return (
    <div className="space-y-5">
      <header className="border-b border-[#E2E8F0] pb-4">
        <h1 className="text-xl font-semibold">Tasks</h1>
        <p className="mt-1 text-sm text-[#64748B]">
          Assigned operational work created by workflows or your team.
        </p>
      </header>
      <div className="rounded-lg border border-[#E2E8F0] bg-white overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-xs">
          <thead className="bg-[#F8FAFC] text-[#64748B] border-b border-[#E2E8F0]">
            <tr>
              <th className="p-4">Task</th>
              <th className="p-4">Priority</th>
              <th className="p-4">Owner</th>
              <th className="p-4">Due</th>
              <th className="p-4">Status</th>
              <th className="p-4">Source</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-[#64748B]">
                  No tasks have been created yet.
                </td>
              </tr>
            ) : (
              tasks.map(task => (
                <tr key={task.id}>
                  <td className="p-4">
                    <strong>{task.title}</strong>
                    {task.description ? (
                      <span className="block mt-1 text-[#64748B]">{task.description}</span>
                    ) : null}
                  </td>
                  <td className="p-4">{task.priority}</td>
                  <td className="p-4">{task.assignedTo || 'Not assigned'}</td>
                  <td className="p-4">
                    {task.dueAt ? new Date(task.dueAt).toLocaleString() : 'Not provided'}
                  </td>
                  <td className="p-4">{task.status}</td>
                  <td className="p-4">{task.sourceType || 'Manual'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
