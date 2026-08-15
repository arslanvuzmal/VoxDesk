import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { validateSession } from '@/lib/auth';
import { prisma } from '@/lib/database';

// prettier-ignore
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
    contacts: number;
    leads: number;
    opportunities: number;
    tasks: number;
  } | null = null;

  try {
    const now = new Date();
    const [active, needsReview, followUpsDue, upcomingAppointments, failedTools, failedConversations, contacts, leads, opportunities, tasks] = await Promise.all([
      prisma.conversation.count({ where: { workspaceId, status: { in: ['ACTIVE', 'HUMAN_HANDOFF'] } } }),
      prisma.conversation.count({ where: { workspaceId, requiresReview: true } }),
      prisma.followUp.count({ where: { workspaceId, status: 'PENDING', preferredTime: { lte: now } } }),
      prisma.appointment.count({ where: { workspaceId, startTime: { gte: now }, status: { in: ['PENDING', 'CONFIRMED', 'RESCHEDULED'] } } }),
      prisma.conversationToolExecution.count({ where: { conversation: { workspaceId }, status: 'FAILED' } }),
      prisma.conversation.count({ where: { workspaceId, status: 'FAILED' } }),
      prisma.contact.count({ where: { workspaceId } }),
      prisma.lead.count({ where: { workspaceId } }),
      prisma.opportunity.count({ where: { workspaceId } }),
      prisma.task.count({ where: { workspaceId, status: { not: 'COMPLETED' } } }),
    ]);
    metrics = { active, needsReview, followUpsDue, upcomingAppointments, failedTools, failedConversations, contacts, leads, opportunities, tasks };
  } catch {
    metrics = null;
  }

  return (
    <div className="space-y-7">
      <header className="border-b border-[#E2E8F0] pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#64748B]">Operations</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#0F172A]">What needs attention?</h1>
        <p className="mt-1 text-sm text-[#64748B]">Live counts from this workspace. Empty states remain zero; no metrics are fabricated.</p>
      </header>

      {!metrics ? (
        <section className="rounded-lg border border-[#F59E0B]/40 bg-[#FFFBEB] p-5">
          <h2 className="font-semibold text-[#78350F]">Operations data is unavailable</h2>
          <p className="mt-1 text-sm text-[#92400E]">No metrics are being estimated. Check database readiness and try again.</p>
        </section>
      ) : (
        <>
          <section aria-label="Current operations" className="grid grid-cols-2 overflow-hidden rounded-lg border border-[#E2E8F0] bg-white lg:grid-cols-4">
            {[
              ['Active conversations', metrics.active],
              ['Needs review', metrics.needsReview],
              ['Follow-ups due', metrics.followUpsDue],
              ['Upcoming appointments', metrics.upcomingAppointments],
            ].map(([label, value]) => (
              <div key={label} className="border-b border-r border-[#E2E8F0] p-4 last:border-r-0 lg:border-b-0">
                <p className="text-xs text-[#64748B]">{label}</p>
                <p className="mt-2 text-2xl font-semibold text-[#0F172A]">{value}</p>
              </div>
            ))}
          </section>

          <section aria-labelledby="crm-pipeline" className="rounded-lg border border-[#E2E8F0] bg-white p-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 id="crm-pipeline" className="font-semibold text-[#0F172A]">CRM pipeline</h2>
                <p className="mt-1 text-sm text-[#64748B]">Persisted workspace records, not demo placeholders.</p>
              </div>
              <Link href="/docs/crm" className="text-sm font-semibold text-[#1D4ED8]">How CRM works →</Link>
            </div>
            <div className="mt-6 grid gap-5 md:grid-cols-4">
              {[
                { label: 'Contacts', value: metrics.contacts, href: '/dashboard/contacts', tone: 'bg-[#DBEAFE]' },
                { label: 'Leads', value: metrics.leads, href: '/dashboard/leads', tone: 'bg-[#EDE9FE]' },
                { label: 'Opportunities', value: metrics.opportunities, href: '/dashboard/opportunities', tone: 'bg-[#D1FAE5]' },
                { label: 'Open tasks', value: metrics.tasks, href: '/dashboard/tasks', tone: 'bg-[#FEF3C7]' },
              ].map(card => (
                <Link key={card.label} href={card.href} className="group rounded-lg border border-[#E2E8F0] p-4 hover:border-[#93C5FD]">
                  <div className="flex items-center justify-between gap-3"><span className="text-sm text-[#64748B]">{card.label}</span><span className={`h-2 w-2 rounded-full ${card.tone}`} aria-hidden="true" /></div>
                  <p className="mt-3 text-3xl font-semibold text-[#0F172A]">{card.value}</p>
                  <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#F1F5F9]"><div className={`h-full rounded-full ${card.tone}`} style={{ width: `${card.value === 0 ? 0 : Math.min(100, Math.max(12, card.value * 10))}%` }} /></div>
                </Link>
              ))}
            </div>
          </section>

          <section className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
            <div className="rounded-lg border border-[#E2E8F0] bg-white">
              <div className="border-b border-[#E2E8F0] p-4"><h2 className="font-semibold text-[#0F172A]">Work queue</h2></div>
              <div className="divide-y divide-[#E2E8F0] text-sm">
                <Link href="/dashboard/conversations" className="flex min-h-14 items-center justify-between px-4 hover:bg-[#F8FAFC]"><span>Conversations requiring review</span><strong>{metrics.needsReview}</strong></Link>
                <Link href="/dashboard/conversations" className="flex min-h-14 items-center justify-between px-4 hover:bg-[#F8FAFC]"><span>Failed tool executions</span><strong>{metrics.failedTools}</strong></Link>
                <Link href="/dashboard/conversations" className="flex min-h-14 items-center justify-between px-4 hover:bg-[#F8FAFC]"><span>Failed conversations</span><strong>{metrics.failedConversations}</strong></Link>
                <Link href="/dashboard/tasks" className="flex min-h-14 items-center justify-between px-4 hover:bg-[#F8FAFC]"><span>Follow-ups due</span><strong>{metrics.followUpsDue}</strong></Link>
              </div>
            </div>
            <div className="rounded-lg border border-[#E2E8F0] bg-[#0F172A] p-5 text-white">
              <p className="text-xs uppercase tracking-[0.14em] text-[#94A3B8]">Live operations</p>
              <p className="mt-3 text-4xl font-semibold">{metrics.active}</p>
              <p className="mt-1 text-sm text-[#CBD5E1]">active conversations now</p>
              <Link href="/dashboard/conversations" className="mt-8 inline-flex min-h-11 items-center text-sm font-semibold text-[#78AFFF]">Open conversations →</Link>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
