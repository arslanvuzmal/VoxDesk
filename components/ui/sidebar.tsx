"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  Plug,
  UserCheck,
  Settings,
} from "lucide-react";

const navItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Live calls", href: "/dashboard/live", icon: Radio },
  { label: "Calls", href: "/dashboard/calls", icon: PhoneCall },
  { label: "Appointments", href: "/dashboard/appointments", icon: Calendar },
  { label: "Leads", href: "/dashboard/leads", icon: Users },
  { label: "Agents", href: "/dashboard/agents", icon: Bot },
  { label: "Knowledge", href: "/dashboard/knowledge", icon: BookOpen },
  { label: "Escalations", href: "/dashboard/escalations", icon: AlertTriangle },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "Integrations", href: "/dashboard/integrations", icon: Plug },
  { label: "Team", href: "/dashboard/team", icon: UserCheck },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 bg-[#0F1216] border-r border-[#272D35] min-h-screen flex flex-col shrink-0">
      {/* Workspace Header */}
      <div className="p-4 border-b border-[#272D35] flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[#2DD4BF] text-[#0B0D10] font-bold text-xs flex items-center justify-center">
            V
          </div>
          <span className="text-sm font-bold text-white tracking-tight">VoxDesk AI</span>
        </Link>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#171C22] text-[#2DD4BF] border border-[#272D35]">
          Demo
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-0.5 text-xs font-medium text-[#D4D4D8]">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors ${
                isActive
                  ? "bg-[#171C22] text-[#2DD4BF] font-semibold border border-[#272D35]"
                  : "hover:bg-[#13171C] hover:text-white"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-[#2DD4BF]" : "text-[#8B949E]"}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer workspace info */}
      <div className="p-3 border-t border-[#272D35] text-[11px] text-[#8B949E]">
        <p className="font-semibold text-white truncate">Northstar Legal</p>
        <p className="truncate text-[10px]">Demo Workspace</p>
      </div>
    </aside>
  );
}
