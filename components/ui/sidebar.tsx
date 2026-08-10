'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { dashboardRoutes } from '@/lib/navigation/dashboard-routes';
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

  const opsRoutes = dashboardRoutes.filter(r => r.category === 'OPERATIONS');
  const intelRoutes = dashboardRoutes.filter(r => r.category === 'INTELLIGENCE');
  const sysRoutes = dashboardRoutes.filter(r => r.category === 'SYSTEM');

  const renderNavGroup = (title: string, routes: typeof dashboardRoutes) => (
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
              className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-[#EFF6FF] text-[#1D4ED8] font-semibold border-l-2 border-[#1D4ED8]'
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
    <aside className="w-60 bg-white border-r border-[#E2E8F0] min-h-screen flex flex-col shrink-0 select-none shadow-sm">
      {/* Active workspace */}
      <div className="p-3 border-b border-[#E2E8F0]">
        <div className="flex items-center p-2 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-6 h-6 rounded bg-[#1D4ED8] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
              V
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-[#0F172A] truncate leading-tight">
                {workspaceName}
              </p>
              <p className="text-[10px] text-[#64748B] truncate">
                {businessName || 'Business not configured'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 p-2 space-y-4 overflow-y-auto">
        {renderNavGroup('Operations', opsRoutes)}
        {renderNavGroup('Intelligence & Agent', intelRoutes)}
        {renderNavGroup('System & Settings', sysRoutes)}
      </nav>

      {/* User Footer Card */}
      <div className="p-3 border-t border-[#E2E8F0] bg-[#F8FAFC]">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-white border border-[#CBD5E1] flex items-center justify-center text-xs font-bold text-[#1D4ED8] shrink-0 shadow-sm">
              {user.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-[#0F172A] truncate leading-tight">
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
            className="p-1.5 rounded-md hover:bg-white text-[#64748B] hover:text-[#0F172A] transition-colors shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}

