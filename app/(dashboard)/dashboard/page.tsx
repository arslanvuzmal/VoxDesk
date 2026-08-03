import Link from "next/link";
import {
  PhoneCall,
  Calendar,
  Users,
  PhoneForwarded,
  Clock,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Bot,
} from "lucide-react";

export default function OverviewDashboardPage() {
  const metrics = [
    { label: "Total Inbound Calls", value: "148", change: "+18%", icon: PhoneCall, color: "text-teal-400" },
    { label: "Completion Rate", value: "98.4%", change: "+2.1%", icon: CheckCircle2, color: "text-emerald-400" },
    { label: "Appointments Booked", value: "42", change: "+12 this week", icon: Calendar, color: "text-electric-400" },
    { label: "Qualified Sales Leads", value: "31", change: "78% HOT/WARM", icon: Users, color: "text-purple-400" },
    { label: "Human Escalations", value: "6", change: "100% Briefed", icon: PhoneForwarded, color: "text-amber-400" },
    { label: "Avg Response Latency", value: "185 ms", change: "Demo Provider", icon: Clock, color: "text-teal-300" },
  ];

  const recentCalls = [
    { id: "call-demo-001", caller: "Sarah Miller", time: "10 mins ago", outcome: "APPOINTMENT_SCHEDULED", category: "HOT", score: 85 },
    { id: "call-demo-002", caller: "Daniel Brooks", time: "45 mins ago", outcome: "APPOINTMENT_RESCHEDULED", category: "WARM", score: 65 },
    { id: "call-demo-003", caller: "Priya Shah", time: "2 hours ago", outcome: "LEAD_QUALIFIED", category: "HOT", score: 92 },
    { id: "call-demo-004", caller: "Michael Chen", time: "4 hours ago", outcome: "ESCALATED_HUMAN", category: "REVIEW", score: 40 },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-teal-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-semibold text-teal-400 px-2.5 py-0.5 rounded bg-teal-950 border border-teal-800">
            DEMO WORKSPACE: NORTHSTAR LEGAL CONSULTATIONS
          </span>
          <h1 className="text-2xl font-extrabold text-white mt-1">Workspace Overview</h1>
        </div>

        <Link
          href="/dashboard/live"
          className="bg-gradient-to-r from-teal-500 to-electric-600 hover:from-teal-600 hover:to-electric-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-lg flex items-center gap-2 transition-all"
        >
          <span>Open Live Call Console</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div key={idx} className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-400">{m.label}</span>
                <Icon className={`w-5 h-5 ${m.color}`} />
              </div>
              <p className="text-3xl font-extrabold text-white">{m.value}</p>
              <span className="text-xs font-mono text-teal-400 font-semibold">{m.change}</span>
            </div>
          );
        })}
      </div>

      {/* Recent Calls & Agents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Recent Inbound Call Sessions</h3>
            <Link href="/dashboard/calls" className="text-xs font-semibold text-teal-400 hover:underline">
              View All Calls
            </Link>
          </div>

          <div className="space-y-3">
            {recentCalls.map((c) => (
              <div key={c.id} className="p-4 rounded-xl bg-gray-950 border border-gray-900 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-white text-sm">{c.caller}</p>
                  <p className="text-gray-400">{c.time} • Outcome: <strong className="text-teal-300">{c.outcome}</strong></p>
                </div>
                <div className="text-right">
                  <span className={`px-2.5 py-1 rounded font-bold font-mono ${c.category === "HOT" ? "bg-emerald-950 text-emerald-400 border border-emerald-800" : "bg-teal-950 text-teal-300 border border-teal-800"}`}>
                    {c.category} ({c.score}/100)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Bot className="w-5 h-5 text-teal-400" />
            <span>Active Voice Agents</span>
          </h3>

          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-gray-950 border border-gray-900 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">Maya — Receptionist</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              </div>
              <p className="text-xs text-gray-400">Inbound Q&A, appointment booking, rescheduling.</p>
            </div>

            <div className="p-4 rounded-xl bg-gray-950 border border-gray-900 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">Alex — Lead Qual</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              </div>
              <p className="text-xs text-gray-400">Commercial lead qualification & BANT scoring.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
