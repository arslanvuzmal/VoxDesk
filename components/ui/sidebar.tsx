"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { dashboardRoutes } from "@/lib/navigation/dashboard-routes";
import {
  LayoutDashboard,
  Radio,
  PhoneCall,
  Calendar,
  Users,
  Bot,
  BookOpen,
  AlertTriangle,
  BarChart3,
  Server,
  Hash,
  Plug,
  UserCheck,
  ShieldCheck,
  Settings,
  LogOut,
  ChevronDown,
  Building2,
} from "lucide-react";

interface SidebarProps {
  user?: any;
}

const iconMap: Record<string, any> = {
  "/dashboard": LayoutDashboard,
  "/dashboard/live": Radio,
  "/dashboard/calls": PhoneCall,
  "/dashboard/appointments": Calendar,
  "/dashboard/leads": Users,
  "/dashboard/agents": Bot,
  "/dashboard/knowledge": BookOpen,
  "/dashboard/escalations": AlertTriangle,
  "/dashboard/analytics": BarChart3,
  "/dashboard/providers": Server,
  "/dashboard/phone-numbers": Hash,
  "/dashboard/integrations": Plug,
  "/dashboard/team": UserCheck,
  "/dashboard/audit": ShieldCheck,
  "/dashboard/settings": Settings,
};

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  const coreRoutes = dashboardRoutes.filter((r) => r.category === "CORE");
  const mgmtRoutes = dashboardRoutes.filter((r) => r.category === "MANAGEMENT");
  const sysRoutes = dashboardRoutes.filter((r) => r.category === "SYSTEM");

  const renderNavGroup = (title: string, routes: typeof dashboardRoutes) => (
    <div className="space-y-1">
      <h3 className="px-3 text-[10px] font-semibold text-[#6E7681] uppercase tracking-wider">
        {title}
      </h3>
      <div className="space-y-0.5">
        {routes.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname?.startsWith(item.href));
          const Icon = iconMap[item.href] || LayoutDashboard;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                isActive
                  ? "bg-[#161B22] text-[#58A6FF] font-semibold border border-[#30363D]/60 shadow-sm"
                  : "text-[#C9D1D9] hover:bg-[#161B22]/70 hover:text-white"
              }`}
            >
              <Icon
                className={`w-3.5 h-3.5 shrink-0 ${
                  isActive ? "text-[#58A6FF]" : "text-[#8B949E]"
                }`}
              />
              <span className="truncate">{item.label}</span>
              {item.href === "/dashboard/escalations" && (
                <span className="ml-auto px-1.5 py-0.2 rounded-full bg-[#D29922]/20 text-[#D29922] text-[10px] font-mono border border-[#D29922]/30">
                  3
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );

  return (
    <aside className="w-60 bg-[#0D1117] border-r border-[#30363D] min-h-screen flex flex-col shrink-0 select-none">
      {/* Workspace Switcher Header */}
      <div className="p-3 border-b border-[#30363D]">
        <div className="flex items-center justify-between p-2 rounded-lg bg-[#161B22] border border-[#30363D] cursor-pointer hover:border-[#8B949E] transition-colors">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-6 h-6 rounded bg-[#1F6FEB] text-white font-bold text-xs flex items-center justify-center shrink-0">
              N
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate leading-tight">
                Northstar Legal
              </p>
              <p className="text-[10px] text-[#8B949E] truncate">
                Legal Consultations
              </p>
            </div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-[#8B949E] shrink-0" />
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 p-2 space-y-4 overflow-y-auto">
        {renderNavGroup("Operations", coreRoutes)}
        {renderNavGroup("Intelligence & Agents", mgmtRoutes)}
        {renderNavGroup("System & Admin", sysRoutes)}
      </nav>

      {/* User Footer Card */}
      <div className="p-3 border-t border-[#30363D] bg-[#161B22]/50">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-[#21262D] border border-[#30363D] flex items-center justify-center text-xs font-semibold text-white shrink-0">
              {(user?.name || "AV").slice(0, 2).toUpperCase()}
            </div>
            <div className="truncate">
              <p className="text-xs font-medium text-white truncate leading-tight">
                {user?.name || "Arslan Vuzmal"}
              </p>
              <p className="text-[10px] text-[#8B949E] truncate">
                {user?.email || "arslan@voxdesk.ai"}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign Out"
            type="button"
            className="p-1.5 rounded-md hover:bg-[#21262D] text-[#8B949E] hover:text-white transition-colors shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
