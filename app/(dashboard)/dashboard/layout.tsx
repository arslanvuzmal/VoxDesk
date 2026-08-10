import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { validateSession } from '@/lib/auth';
import { prisma } from '@/lib/database';
import { Sidebar } from '@/components/ui/sidebar';
import Link from 'next/link';
import { PhoneCall, HelpCircle } from 'lucide-react';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('voxdesk_session')?.value;
  const user = await validateSession(token || '');

  if (!user) {
    redirect('/login');
  }
  const workspace = await prisma.workspace.findUnique({
    where: { id: user.activeWorkspaceId },
    select: { name: true, businessProfile: { select: { businessName: true } } },
  });

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans antialiased">
      <Sidebar
        user={user}
        workspaceName={workspace?.name || 'Workspace'}
        businessName={workspace?.businessProfile?.businessName || null}
      />
      <div className="flex-1 flex flex-col min-w-0">
        {/* White Top Utility Bar */}
        <header className="h-14 bg-white border-b border-[#E2E8F0] px-6 flex items-center justify-between gap-4 sticky top-0 z-20 shrink-0 shadow-sm">
          <div className="flex-1 text-xs text-[#64748B]">Voice operations</div>

          {/* Actions & Navigation Context */}
          <div className="flex items-center gap-3 shrink-0 text-xs">
            <Link
              href="/demo"
              className="bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-semibold text-xs px-3.5 py-1.5 rounded-md flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Launch Voice Demo</span>
            </Link>

            <div className="w-px h-4 bg-[#E2E8F0]" />

            <Link
              href="/docs"
              className="p-1.5 rounded-md hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A] transition-colors"
              title="Documentation"
            >
              <HelpCircle className="w-4 h-4" />
            </Link>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}

