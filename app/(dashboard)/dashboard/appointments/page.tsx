import { prisma } from '@/lib/database';
import { requireDashboardPermission } from '@/lib/auth/dashboard-context';

export default async function AppointmentsPage() {
  const { workspaceId } = await requireDashboardPermission('calls:view');
  const appointments = await prisma.appointment.findMany({
    where: { workspaceId },
    orderBy: { startTime: 'asc' },
    take: 100,
    select: {
      id: true,
      callerName: true,
      service: true,
      startTime: true,
      endTime: true,
      timezone: true,
      status: true,
      externalEventId: true,
      callId: true,
    },
  });
  return (
    <div className="space-y-5">
      <header className="border-b border-[#E2E8F0] pb-4">
        <h1 className="text-xl font-semibold">Appointments</h1>
        <p className="mt-1 text-sm text-[#64748B]">
          Confirmed and pending bookings from configured calendar workflows.
        </p>
      </header>
      <div className="rounded-lg border border-[#E2E8F0] bg-white overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-xs">
          <thead className="bg-[#F8FAFC] text-[#64748B] border-b border-[#E2E8F0]">
            <tr>
              <th className="p-4">Customer</th>
              <th className="p-4">Service</th>
              <th className="p-4">Date and time</th>
              <th className="p-4">Timezone</th>
              <th className="p-4">Status</th>
              <th className="p-4">Provider</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {appointments.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-[#64748B]">
                  No appointments have been created yet.
                </td>
              </tr>
            ) : (
              appointments.map(appointment => (
                <tr key={appointment.id}>
                  <td className="p-4 font-semibold">{appointment.callerName || 'Not provided'}</td>
                  <td className="p-4">{appointment.service || 'Not provided'}</td>
                  <td className="p-4">{new Date(appointment.startTime).toLocaleString()}</td>
                  <td className="p-4">{appointment.timezone || 'Not provided'}</td>
                  <td className="p-4">{appointment.status}</td>
                  <td className="p-4">
                    {appointment.externalEventId ? 'Confirmed' : 'Provider data pending'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
