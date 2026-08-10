import { prisma } from '@/lib/database';
import { requireDashboardContext } from '@/lib/auth/dashboard-context';
import Link from 'next/link';

export default async function ContactsPage() {
  const { workspaceId } = await requireDashboardContext();
  const contacts = await prisma.contact.findMany({
    where: { workspaceId },
    orderBy: { updatedAt: 'desc' },
    take: 100,
    select: {
      id: true,
      name: true,
      company: true,
      preferredLanguage: true,
      updatedAt: true,
      conversations: { orderBy: { startedAt: 'desc' }, take: 1, select: { startedAt: true } },
      preferences: { select: { preferredChannel: true, doNotCall: true } },
    },
  });
  return (
    <div className="space-y-5">
      <header className="border-b border-[#E2E8F0] pb-4">
        <h1 className="text-xl font-semibold">Contacts</h1>
        <p className="mt-1 text-sm text-[#64748B]">
          Customer identity, preferences, and conversation history.
        </p>
      </header>
      <div className="rounded-lg border border-[#E2E8F0] bg-white overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-xs">
          <thead className="bg-[#F8FAFC] text-[#64748B] border-b border-[#E2E8F0]">
            <tr>
              <th className="p-4">Contact</th>
              <th className="p-4">Company</th>
              <th className="p-4">Preferred language</th>
              <th className="p-4">Preferred channel</th>
              <th className="p-4">Calling</th>
              <th className="p-4">Last conversation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {contacts.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-[#64748B]">
                  No contacts have been created yet.
                </td>
              </tr>
            ) : (
              contacts.map(contact => (
                <tr key={contact.id}>
                  <td className="p-4 font-semibold">
                    <Link
                      className="hover:underline focus-visible:outline focus-visible:outline-2"
                      href={`/dashboard/contacts/${contact.id}`}
                    >
                      {contact.name || 'Not provided'}
                    </Link>
                  </td>
                  <td className="p-4">{contact.company || 'Not provided'}</td>
                  <td className="p-4">{contact.preferredLanguage || 'Not provided'}</td>
                  <td className="p-4">{contact.preferences?.preferredChannel || 'Not provided'}</td>
                  <td className="p-4">
                    {contact.preferences?.doNotCall ? 'Opted out' : 'No opt-out recorded'}
                  </td>
                  <td className="p-4">
                    {contact.conversations[0]
                      ? new Date(contact.conversations[0].startedAt).toLocaleString()
                      : 'No conversations'}
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

