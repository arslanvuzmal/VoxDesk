"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Bot,
  PhoneCall,
  Users,
  Calendar,
  BookOpen,
  PhoneForwarded,
  Layers,
  Phone,
  Share2,
  BarChart3,
  UserCheck,
  ShieldAlert,
  Settings,
  Radio,
  Sparkles,
} from "lucide-react";
import { clsx } from "clsx";

const NAV_ITEMS = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Live Call Console", href: "/dashboard/live", icon: Radio, highlight: true },
  { label: "Voice Agents", href: "/dashboard/agents", icon: Bot },
  { label: "Call History", href: "/dashboard/calls", icon: PhoneCall },
  { label: "Lead Qualification", href: "/dashboard/leads", icon: Users },
  { label: "Appointments", href: "/dashboard/appointments", icon: Calendar },
  { label: "Knowledge Base", href: "/dashboard/knowledge", icon: BookOpen },
  { label: "Human Escalations", href: "/dashboard/escalations", icon: PhoneForwarded },
  { label: "Voice Providers", href: "/dashboard/providers", icon: Layers },
  { label: "Phone Numbers", href: "/dashboard/phone-numbers", icon: Phone },
  { label: "CRM & Webhooks", href: "/dashboard/integrations", icon: Share2 },
  { label: "Call Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "Team Members", href: "/dashboard/team", icon: UserCheck },
  { label: "Audit Logs", href: "/dashboard/audit", icon: ShieldAlert },
  { label: "Business Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 glass-panel border-r border-gray-800/80 min-h-screen flex flex-col justify-between py-6 px-4 shrink-0">
      <div>
        <div className="px-3 mb-6">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-electric-600 flex items-center justify-center font-bold text-white shadow-md">
              V
            </div>
            <div>
              <span className="font-bold text-white tracking-tight">VoxDesk AI</span>
              <span className="text-xs text-teal-400 font-mono block -mt-1 font-semibold">NORTHSTAR LEGAL</span>
            </div>
          </Link>
        </div>

        {/* Demo Mode Badge */}
        <div className="mx-2 mb-6 px-3 py-2 rounded-xl bg-amber-950/40 border border-amber-800/50 flex items-center gap-2 text-amber-300 text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Fictional Demonstration Mode Active</span>
        </div>

        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  isActive
                    ? "bg-gradient-to-r from-teal-600/30 to-electric-600/30 text-white border border-teal-500/40 shadow-sm"
                    : item.highlight
                    ? "text-teal-400 hover:bg-teal-950/50 border border-teal-800/30 font-semibold"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                )}
              >
                <Icon className={clsx("w-4 h-4", isActive ? "text-teal-400" : "text-gray-400")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="px-3 pt-6 border-t border-gray-800/60 text-xs text-gray-400 font-medium">
        <p className="text-gray-400 font-medium">Owner: Arslan Vuzmal Lone</p>
        <p className="text-gray-400 font-mono text-[10px] mt-0.5">arslanvuzmal/voxdesk-ai</p>
      </div>
    </aside>
  );
}
