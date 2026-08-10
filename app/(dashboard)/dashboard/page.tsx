import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { validateSession } from '@/lib/auth';
import { prisma } from '@/lib/database';

export default async function DashboardOverviewPage() {
  const token = (await cookies()).get('voxdesk_session')?.value;
  const user = await validateSession(token || '');
  if (!user) redirect('/login');
  const workspaceId = user.activeWorkspaceId;
  let metrics: {
    active: number;
    needsReview: number;
    followUpsDue: number;
    upcomingAppointments: number;
    failedTools: number;
    failedConversations: number;
  } | null = null;
  try {
    const now = new Date();
    const [
      active,
      needsReview,
      followUpsDue,
      upcomingAppointments,
      failedTools,
      failedConversations,
    ] = await Promise.all([
      prisma.conversation.count({
        where: { workspaceId, status: { in: ['ACTIVE', 'HUMAN_HANDOFF'] } },
      }),
      prisma.conversation.count({ where: { workspaceId, requiresReview: true } }),
      prisma.followUp.count({
        where: { workspaceId, status: 'PENDING', preferredTime: { lte: now } },
      }),
      prisma.appointment.count({
        where: {
          workspaceId,
          startTime: { gte: now },
          status: { in: ['PENDING', 'CONFIRMED', 'RESCHEDULED'] },
        },
      }),
      prisma.conversationToolExecution.count({
        where: { conversation: { workspaceId }, status: 'FAILED' },
      }),
      prisma.conversation.count({ where: { workspaceId, status: 'FAILED' } }),
    ]);
    metrics = {
      active,
      needsReview,
      followUpsDue,
      upcomingAppointments,
      failedTools,
      failedConversations,
    };
  } catch {
    metrics = null;
  }

  return (
    <div className="space-y-7">
      <header className="border-b border-[#E2E8F0] pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#64748B]">
          Operations
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#0F172A]">
          What needs attention?
        </h1>
        <p className="mt-1 text-sm text-[#64748B]">
          Current workload from persisted conversations and CRM actions.
        </p>
      </header>

      {!metrics ? (
        <section className="rounded-lg border border-[#F59E0B]/40 bg-[#FFFBEB] p-5">
          <h2 className="font-semibold text-[#78350F]">Operations data is unavailable</h2>
          <p className="mt-1 text-sm text-[#92400E]">
            No metrics are being estimated. Check database readiness and try again.
          </p>
        </section>
      ) : (
        <>
          <section
            aria-label="Current operations"
            className="grid grid-cols-2 lg:grid-cols-4 border border-[#E2E8F0] rounded-lg overflow-hidden bg-white"
          >
            {[
              ['Active conversations', metrics.active],
              ['Needs review', metrics.needsReview],
              ['Follow-ups due', metrics.followUpsDue],
              ['Upcoming appointments', metrics.upcomingAppointments],
            ].map(([label, value]) => (
              <div
                key={label}
                className="p-4 border-r border-b lg:border-b-0 border-[#E2E8F0] last:border-r-0"
              >
                <p className="text-xs text-[#64748B]">{label}</p>
                <p className="mt-2 text-2xl font-semibold text-[#0F172A]">{value}</p>
              </div>
            ))}
          </section>

          <section className="grid lg:grid-cols-[1.4fr_1fr] gap-5">
            <div className="rounded-lg border border-[#E2E8F0] bg-white">
              <div className="p-4 border-b border-[#E2E8F0]">
                <h2 className="font-semibold text-[#0F172A]">Work queue</h2>
              </div>
              <div className="divide-y divide-[#E2E8F0] text-sm">
                <Link
                  href="/dashboard/conversations"
                  className="min-h-14 px-4 flex items-center justify-between hover:bg-[#F8FAFC]"
                >
                  <span>Conversations requiring review</span>
                  <strong>{metrics.needsReview}</strong>
                </Link>
                <Link
                  href="/dashboard/conversations"
                  className="min-h-14 px-4 flex items-center justify-between hover:bg-[#F8FAFC]"
                >
                  <span>Failed tool executions</span>
                  <strong>{metrics.failedTools}</strong>
                </Link>
                <Link
                  href="/dashboard/conversations"
                  className="min-h-14 px-4 flex items-center justify-between hover:bg-[#F8FAFC]"
                >
                  <span>Failed conversations</span>
                  <strong>{metrics.failedConversations}</strong>
                </Link>
                <Link
                  href="/dashboard/tasks"
                  className="min-h-14 px-4 flex items-center justify-between hover:bg-[#F8FAFC]"
                >
                  <span>Follow-ups due</span>
                  <strong>{metrics.followUpsDue}</strong>
                </Link>
              </div>
            </div>
            <div className="rounded-lg border border-[#E2E8F0] bg-[#0F172A] p-5 text-white">
              <p className="text-xs uppercase tracking-[0.14em] text-[#94A3B8]">Live operations</p>
              <p className="mt-3 text-4xl font-semibold">{metrics.active}</p>
              <p className="mt-1 text-sm text-[#CBD5E1]">active conversations now</p>
              <Link
                href="/dashboard/conversations"
                className="mt-8 inline-flex min-h-11 items-center text-sm font-semibold text-[#78AFFF]"
              >
                Open conversations â†’
              </Link>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
