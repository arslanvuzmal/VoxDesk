import Link from 'next/link';
import {
  PhoneCall,
  Calendar,
  Users,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  Filter,
  Download,
  Building2,
  UserCheck,
} from 'lucide-react';

export default function DashboardOverviewPage() {
  return (
    <div className="space-y-6">
      {/* Workspace & Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#30363D] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#8B949E] mb-1">
            <Building2 className="w-3.5 h-3.5 text-[#58A6FF]" />
            <span className="font-semibold text-white">Northstar Legal Consultations</span>
            <span>•</span>
            <span>English (en-US) Workspace</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Operational Dashboard</h1>
          <p className="text-xs text-[#8B949E]">
            Real-time inbound call metrics, qualified leads, and appointment booking activity.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#161B22] border border-[#30363D] text-xs text-[#C9D1D9]">
            <Clock className="w-3.5 h-3.5 text-[#8B949E]" />
            <span>Today (Aug 6, 2026)</span>
          </div>
          <button
            type="button"
            className="px-3 py-1.5 rounded-md bg-[#21262D] hover:bg-[#30363D] text-xs font-medium text-white border border-[#30363D] flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#8B949E]" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* 4 Primary Operational Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Calls Handled */}
        <div className="p-4 rounded-lg bg-[#161B22] border border-[#30363D] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider">
              Total Inbound Calls
            </span>
            <div className="p-1.5 rounded bg-[#1F6FEB]/10 border border-[#1F6FEB]/20">
              <PhoneCall className="w-4 h-4 text-[#58A6FF]" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white font-mono">42</span>
            <span className="text-[11px] font-mono text-[#3FB950] flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +14% vs yesterday
            </span>
          </div>
          <p className="text-[11px] text-[#8B949E]">Automated intake conversations</p>
        </div>

        {/* Appointments Booked */}
        <div className="p-4 rounded-lg bg-[#161B22] border border-[#30363D] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider">
              Confirmed Appointments
            </span>
            <div className="p-1.5 rounded bg-[#238636]/10 border border-[#238636]/20">
              <Calendar className="w-4 h-4 text-[#3FB950]" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white font-mono">18</span>
            <span className="text-[11px] font-mono text-[#3FB950] flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> 42.8% conversion
            </span>
          </div>
          <p className="text-[11px] text-[#8B949E]">Calendar slots booked automatically</p>
        </div>

        {/* Qualified Enquiries */}
        <div className="p-4 rounded-lg bg-[#161B22] border border-[#30363D] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider">
              BANT Qualified Leads
            </span>
            <div className="p-1.5 rounded bg-[#388BFD]/10 border border-[#388BFD]/20">
              <Users className="w-4 h-4 text-[#79C0FF]" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white font-mono">14</span>
            <span className="text-[11px] font-mono text-[#79C0FF]">Score ≥ 75</span>
          </div>
          <p className="text-[11px] text-[#8B949E]">Verified intake requirements</p>
        </div>

        {/* Escalations Needing Review */}
        <div className="p-4 rounded-lg bg-[#161B22] border border-[#30363D] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider">
              Urgent Handoff Queue
            </span>
            <div className="p-1.5 rounded bg-[#9E6A03]/10 border border-[#9E6A03]/20">
              <AlertTriangle className="w-4 h-4 text-[#D29922]" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white font-mono">3</span>
            <span className="text-[11px] font-mono text-[#D29922]">Requires Operator Action</span>
          </div>
          <p className="text-[11px] text-[#8B949E]">Pending legal counsel review</p>
        </div>
      </div>

      {/* Main Operational Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3): Recent Call Stream Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-lg bg-[#161B22] border border-[#30363D] overflow-hidden">
            <div className="p-4 border-b border-[#30363D] flex items-center justify-between bg-[#161B22]">
              <div>
                <h2 className="text-sm font-bold text-white">Recent Live Conversations</h2>
                <p className="text-[11px] text-[#8B949E]">
                  Inbound voice interactions handled by AI receptionists
                </p>
              </div>
              <Link
                href="/dashboard/calls"
                className="text-xs text-[#58A6FF] hover:underline font-medium flex items-center gap-1"
              >
                <span>View all calls</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0D1117] text-[#8B949E] border-b border-[#30363D] text-[11px] font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-2.5">Caller / Contact</th>
                    <th className="px-4 py-2.5">Inquiry Type</th>
                    <th className="px-4 py-2.5">Agent</th>
                    <th className="px-4 py-2.5">Outcome</th>
                    <th className="px-4 py-2.5 text-right">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#30363D] text-[#C9D1D9]">
                  <tr className="hover:bg-[#1C2129] transition-colors cursor-pointer">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-white">Sarah Miller</p>
                      <p className="text-[11px] text-[#8B949E] font-mono">+1 (555) 234-5678</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">Corporate Legal Retainer</p>
                      <p className="text-[10px] text-[#8B949E]">Commercial Litigation</p>
                    </td>
                    <td className="px-4 py-3 font-medium text-[#C9D1D9]">Maya</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-[#238636]/15 text-[#3FB950] border border-[#238636]/30">
                        <CheckCircle2 className="w-3 h-3" /> Booked
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-[#8B949E]">2m 45s</td>
                  </tr>

                  <tr className="hover:bg-[#1C2129] transition-colors cursor-pointer">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-white">Daniel Brooks</p>
                      <p className="text-[11px] text-[#8B949E] font-mono">+1 (555) 876-5432</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">Employment Law Dispute</p>
                      <p className="text-[10px] text-[#8B949E]">Worker Contract Review</p>
                    </td>
                    <td className="px-4 py-3 font-medium text-[#C9D1D9]">Maya</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-[#1F6FEB]/15 text-[#58A6FF] border border-[#1F6FEB]/30">
                        Qualified
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-[#8B949E]">3m 10s</td>
                  </tr>

                  <tr className="hover:bg-[#1C2129] transition-colors cursor-pointer">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-white">Priya Shah</p>
                      <p className="text-[11px] text-[#8B949E] font-mono">+1 (555) 345-6789</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">Urgent Court Injunction</p>
                      <p className="text-[10px] text-[#8B949E]">Immediate Hearing</p>
                    </td>
                    <td className="px-4 py-3 font-medium text-[#C9D1D9]">Maya</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-[#9E6A03]/15 text-[#D29922] border border-[#9E6A03]/30">
                        <AlertTriangle className="w-3 h-3" /> Escalated
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-[#8B949E]">1m 50s</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (1/3): Priority Action Queue */}
        <div className="space-y-4">
          <div className="rounded-lg bg-[#161B22] border border-[#30363D] p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-[#30363D] pb-3">
              <h2 className="text-sm font-bold text-white">Action Queue</h2>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#9E6A03]/20 text-[#D29922] border border-[#9E6A03]/30">
                3 Pending
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-md bg-[#0D1117] border border-[#30363D] space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-[#F85149] uppercase">Urgent Escalation</span>
                  <span className="text-[#8B949E] font-mono">10m ago</span>
                </div>
                <p className="font-medium text-white">Priya Shah — Urgent Injunction</p>
                <p className="text-[#8B949E] text-[11px]">
                  Caller requested immediate callback from senior partner regarding court filing.
                </p>
                <div className="pt-1 flex items-center justify-between border-t border-[#21262D]">
                  <span className="text-[11px] text-[#8B949E]">Assigned: Lead Counsel</span>
                  <Link
                    href="/dashboard/leads"
                    className="text-[#58A6FF] hover:underline font-semibold"
                  >
                    Review Lead &rarr;
                  </Link>
                </div>
              </div>

              <div className="p-3 rounded-md bg-[#0D1117] border border-[#30363D] space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-[#D29922] uppercase">Follow-up Required</span>
                  <span className="text-[#8B949E] font-mono">1h ago</span>
                </div>
                <p className="font-medium text-white">Daniel Brooks — Employment Matter</p>
                <p className="text-[#8B949E] text-[11px]">
                  Needs fee estimate sent before scheduling consultation.
                </p>
                <div className="pt-1 flex items-center justify-between border-t border-[#21262D]">
                  <span className="text-[11px] text-[#8B949E]">Assigned: Paralegal</span>
                  <Link
                    href="/dashboard/leads"
                    className="text-[#58A6FF] hover:underline font-semibold"
                  >
                    View Lead &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
