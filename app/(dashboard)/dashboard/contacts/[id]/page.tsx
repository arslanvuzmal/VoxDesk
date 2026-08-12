import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/database';
import { requireDashboardPermission } from '@/lib/auth/dashboard-context';

type TimelineItem = { id: string; at: Date; label: string; detail: string; href?: string };

function when(value: Date | null | undefined) {
  return value
    ? new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(value)
    : 'Not provided';
}

export default async function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }, { workspaceId }] = await Promise.all([
    params,
    requireDashboardPermission('calls:view'),
  ]);
  const contact = await prisma.contact.findFirst({
    where: { id, workspaceId },
    include: {
      preferences: true,
      consentRecords: { orderBy: { updatedAt: 'desc' }, take: 20 },
      suppressionEntries: { orderBy: { suppressedAt: 'desc' }, take: 20 },
      conversations: { orderBy: { startedAt: 'desc' }, take: 100 },
      appointments: { orderBy: { startTime: 'desc' }, take: 50 },
      opportunities: { orderBy: { updatedAt: 'desc' }, take: 50 },
    },
  });
  if (!contact) notFound();

  const conversationIds = contact.conversations.map(item => item.id);
  const callIds = contact.conversations
    .map(item => item.callId)
    .filter((id): id is string => Boolean(id));
  const [tasks, followUps, handoffs] = await Promise.all([
    prisma.task.findMany({
      where: { workspaceId, sourceType: 'CONVERSATION', sourceId: { in: conversationIds } },
      take: 100,
    }),
    prisma.followUp.findMany({ where: { workspaceId, contactId: contact.id }, take: 100 }),
    prisma.handoff.findMany({ where: { workspaceId, callId: { in: callIds } }, take: 100 }),
  ]);

  const timeline: TimelineItem[] = [
    ...contact.conversations.map(item => ({
      id: `conversation-${item.id}`,
      at: item.startedAt,
      label: `${item.direction} ${item.channel.replaceAll('_', ' ')}`,
      detail: item.summary || item.intent || 'Summary not available',
      href: `/dashboard/conversations?conversationId=${item.id}`,
    })),
    ...contact.appointments.map(item => ({
      id: `appointment-${item.id}`,
      at: item.createdAt,
      label: `Appointment ${item.status.toLowerCase()}`,
      detail: `${item.service} · ${when(item.startTime)}`,
    })),
    ...contact.opportunities.map(item => ({
      id: `opportunity-${item.id}`,
      at: item.createdAt,
      label: `Opportunity ${item.stage.toLowerCase()}`,
      detail: item.title,
    })),
    ...tasks.map(item => ({
      id: `task-${item.id}`,
      at: item.createdAt,
      label: `Task ${item.status.toLowerCase()}`,
      detail: item.title,
    })),
    ...followUps.map(item => ({
      id: `follow-up-${item.id}`,
      at: item.createdAt,
      label: `Follow-up ${item.status.toLowerCase()}`,
      detail: item.followUpType.replaceAll('_', ' '),
    })),
    ...handoffs.map(item => ({
      id: `handoff-${item.id}`,
      at: item.createdAt,
      label: item.result ? `Handoff ${item.result.toLowerCase()}` : 'Handoff requested',
      detail: item.reason,
    })),
    ...contact.consentRecords.map(item => ({
      id: `consent-${item.id}`,
      at: item.updatedAt,
      label: `Consent ${item.consentStatus.toLowerCase()}`,
      detail: item.consentType.replaceAll('_', ' '),
    })),
    ...contact.suppressionEntries.map(item => ({
      id: `suppression-${item.id}`,
      at: item.suppressedAt,
      label: 'Calling suppressed',
      detail: item.reason.replaceAll('_', ' '),
    })),
  ].sort((a, b) => b.at.getTime() - a.at.getTime());

  return (
    <div className="space-y-6">
      <header className="border-b border-[#E2E8F0] pb-4">
        <Link href="/dashboard/contacts" className="text-xs text-[#64748B] hover:text-[#0F172A]">
          ← Contacts
        </Link>
        <h1 className="mt-3 text-xl font-semibold">{contact.name || 'Not provided'}</h1>
        <p className="mt-1 text-sm text-[#64748B]">
          {contact.company || 'Company not provided'} ·{' '}
          {contact.phoneMasked || 'Phone not provided'}
        </p>
      </header>
      <section className="grid gap-px overflow-hidden rounded-lg border border-[#E2E8F0] bg-[#E2E8F0] sm:grid-cols-3">
        {[
          ['Preferred language', contact.preferredLanguage || 'Not provided'],
          ['Preferred channel', contact.preferences?.preferredChannel || 'Not provided'],
          [
            'Calling preference',
            contact.preferences?.doNotCall ? 'Do not call' : 'No opt-out recorded',
          ],
        ].map(([label, value]) => (
          <div key={label} className="bg-white p-4">
            <p className="text-xs text-[#64748B]">{label}</p>
            <p className="mt-1 text-sm font-medium">{value}</p>
          </div>
        ))}
      </section>
      <section className="rounded-lg border border-[#E2E8F0] bg-white">
        <div className="border-b border-[#E2E8F0] p-4">
          <h2 className="font-semibold">Operational timeline</h2>
        </div>
        {timeline.length === 0 ? (
          <p className="p-8 text-center text-sm text-[#64748B]">
            No activity has been recorded for this contact.
          </p>
        ) : (
          <ol className="divide-y divide-[#E2E8F0]">
            {timeline.map(item => (
              <li key={item.id} className="grid gap-1 p-4 sm:grid-cols-[10rem_1fr]">
                <time className="text-xs text-[#64748B]">{when(item.at)}</time>
                <div>
                  <p className="text-sm font-medium">
                    {item.href ? (
                      <Link href={item.href} className="hover:underline">
                        {item.label}
                      </Link>
                    ) : (
                      item.label
                    )}
                  </p>
                  <p className="mt-1 text-sm text-[#64748B]">{item.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
