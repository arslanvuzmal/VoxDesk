'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getVisibleDashboardRoutes } from '@/lib/navigation/dashboard-routes';
import type { SessionUser } from '@/lib/auth';
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Calendar,
  BarChart3,
  SlidersHorizontal,
  Plug,
  Settings,
  ListChecks,
  Megaphone,
  BriefcaseBusiness,
  GitPullRequestArrow,
  LogOut,
} from 'lucide-react';

interface SidebarProps {
  user: SessionUser;
  workspaceName: string;
  businessName: string | null;
}

const iconMap: Record<string, LucideIcon> = {
  '/dashboard': LayoutDashboard,
  '/dashboard/conversations': MessageSquare,
  '/dashboard/contacts': Users,
  '/dashboard/appointments': Calendar,
  '/dashboard/opportunities': BriefcaseBusiness,
  '/dashboard/tasks': ListChecks,
  '/dashboard/campaigns': Megaphone,
  '/dashboard/analytics': BarChart3,
  '/dashboard/improvement': GitPullRequestArrow,
  '/dashboard/agent': SlidersHorizontal,
  '/dashboard/integrations': Plug,
  '/dashboard/settings': Settings,
};

export function Sidebar({ user, workspaceName, businessName }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const visibleRoutes = getVisibleDashboardRoutes(user.activeWorkspaceRole);
  const opsRoutes = visibleRoutes.filter(route => route.category === 'OPERATIONS');
  const intelRoutes = visibleRoutes.filter(route => route.category === 'INTELLIGENCE');
  const sysRoutes = visibleRoutes.filter(route => route.category === 'SYSTEM');

  const renderNavGroup = (title: string, routes: ReturnType<typeof getVisibleDashboardRoutes>) => (
    <div className="space-y-1">
      <h3 className="px-3 text-[10px] font-semibold text-[#64748B] uppercase tracking-wider">
        {title}
      </h3>
      <div className="space-y-0.5">
        {routes.map(item => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname?.startsWith(item.href));
          const Icon = iconMap[item.href] || LayoutDashboard;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
                isActive
                  ? 'border-l-2 border-[#1D4ED8] bg-[#EFF6FF] font-semibold text-[#1D4ED8]'
                  : 'text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#1D4ED8]' : 'text-[#64748B]'}`}
              />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );

  return (
    <aside className="flex min-h-screen w-60 shrink-0 select-none flex-col border-r border-[#E2E8F0] bg-white shadow-sm">
      {/* Active workspace */}
      <div className="border-b border-[#E2E8F0] p-3">
        <div className="flex items-center rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-[#1D4ED8] text-xs font-bold text-white shadow-sm">
              V
            </div>
            <div className="truncate">
              <p className="truncate text-xs leading-tight font-bold text-[#0F172A]">
                {workspaceName}
              </p>
              <p className="truncate text-[10px] text-[#64748B]">
                {businessName || 'Business not configured'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 space-y-4 overflow-y-auto p-2">
        {renderNavGroup('Operations', opsRoutes)}
        {renderNavGroup('Intelligence & Agent', intelRoutes)}
        {renderNavGroup('System & Settings', sysRoutes)}
      </nav>

      {/* User Footer Card */}
      <div className="border-t border-[#E2E8F0] bg-[#F8FAFC] p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#CBD5E1] bg-white text-xs font-bold text-[#1D4ED8] shadow-sm">
              {user.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="truncate">
              <p className="truncate text-xs leading-tight font-semibold text-[#0F172A]">
                {user.name}
              </p>
              <p className="text-[10px] text-[#64748B] truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign Out"
            aria-label="Sign out"
            type="button"
            className="shrink-0 rounded-md p-1.5 text-[#64748B] transition-colors hover:bg-white hover:text-[#0F172A]"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
