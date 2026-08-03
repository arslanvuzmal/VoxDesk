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

  return (
    <aside className="w-56 bg-[#0F1216] border-r border-[#272D35] min-h-screen flex flex-col shrink-0">
      {/* Workspace Header */}
      <div className="p-4 border-b border-[#272D35] flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[#2DD4BF] text-[#0B0D10] font-bold text-xs flex items-center justify-center">
            V
          </div>
          <span className="text-sm font-bold text-white tracking-tight">
            VoxDesk AI
          </span>
        </Link>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#171C22] text-[#2DD4BF] border border-[#272D35]">
          Fictional Demo
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-0.5 text-xs font-medium text-[#D4D4D8] overflow-y-auto">
        {dashboardRoutes.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname?.startsWith(item.href));
          const Icon = iconMap[item.href] || LayoutDashboard;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors ${
                isActive
                  ? "bg-[#171C22] text-[#2DD4BF] font-semibold border border-[#272D35]"
                  : "hover:bg-[#13171C] hover:text-white text-[#D4D4D8]"
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${isActive ? "text-[#2DD4BF]" : "text-[#8B949E]"}`}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer workspace info */}
      <div className="p-3 border-t border-[#272D35] flex items-center justify-between text-[11px] text-[#8B949E]">
        <div className="truncate">
          <p className="font-semibold text-white truncate">
            {user?.name || "Arslan Vuzmal Lone"}
          </p>
          <p className="truncate text-[10px]">Fictional Demo Workspace</p>
        </div>
        <button
          onClick={handleLogout}
          title="Log out"
          className="p-1 rounded hover:bg-[#171C22] text-[#8B949E] hover:text-white shrink-0"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
}
