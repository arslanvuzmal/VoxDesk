import Link from "next/link";
import {
  PhoneCall,
  Calendar,
  Users,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export default function DashboardOverviewPage() {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#272D35] pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Overview
          </h1>
          <p className="text-xs text-[#8B949E]">
            Call activity and follow-up for Northstar Legal Consultations
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/demo"
            className="bg-[#2DD4BF] hover:bg-[#26b8a5] text-[#0B0D10] font-semibold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <span>Start demo call</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 4 Primary Operational Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-[#13171C] border border-[#272D35] space-y-1">
          <div className="flex items-center justify-between text-xs text-[#8B949E]">
            <span>Calls Handled</span>
            <PhoneCall className="w-4 h-4 text-[#60A5FA]" />
          </div>
          <p className="text-2xl font-bold text-white">42</p>
          <p className="text-[11px] text-[#8B949E]">
            Total inbound enquiries logged
          </p>
        </div>

        <div className="p-4 rounded-lg bg-[#13171C] border border-[#272D35] space-y-1">
          <div className="flex items-center justify-between text-xs text-[#8B949E]">
            <span>Appointments Booked</span>
            <Calendar className="w-4 h-4 text-[#2DD4BF]" />
          </div>
          <p className="text-2xl font-bold text-white">18</p>
          <p className="text-[11px] text-[#8B949E]">Confirmed calendar slots</p>
        </div>

        <div className="p-4 rounded-lg bg-[#13171C] border border-[#272D35] space-y-1">
          <div className="flex items-center justify-between text-xs text-[#8B949E]">
            <span>Qualified Enquiries</span>
            <Users className="w-4 h-4 text-[#34D399]" />
          </div>
          <p className="text-2xl font-bold text-white">14</p>
          <p className="text-[11px] text-[#8B949E]">Hot & Warm BANT leads</p>
        </div>

        <div className="p-4 rounded-lg bg-[#13171C] border border-[#272D35] space-y-1">
          <div className="flex items-center justify-between text-xs text-[#8B949E]">
            <span>Escalations Needing Review</span>
            <AlertTriangle className="w-4 h-4 text-[#FBBF24]" />
          </div>
          <p className="text-2xl font-bold text-white">3</p>
          <p className="text-[11px] text-[#8B949E]">
            Requires operator handoff
          </p>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Calls Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-4 rounded-lg bg-[#13171C] border border-[#272D35] space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white">Recent Calls</h2>
              <Link
                href="/dashboard/calls"
                className="text-xs text-[#2DD4BF] hover:underline"
              >
                View all calls
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-[#8B949E] border-b border-[#272D35] font-mono">
                  <tr>
                    <th className="pb-2">Caller</th>
                    <th className="pb-2">Intent</th>
                    <th className="pb-2">Agent</th>
                    <th className="pb-2">Outcome</th>
                    <th className="pb-2 text-right">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#272D35] text-[#D4D4D8]">
                  <tr>
                    <td className="py-2.5 font-medium text-white">
                      Sarah Miller
                    </td>
                    <td className="py-2.5">Schedule Legal Consultation</td>
                    <td className="py-2.5 text-[#8B949E]">Maya</td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 rounded bg-[#34D399]/10 text-[#34D399] font-mono text-[10px] border border-[#34D399]/20">
                        Booked
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-mono text-[#8B949E]">
                      2m 45s
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-medium text-white">
                      Daniel Brooks
                    </td>
                    <td className="py-2.5">Commercial Retainer Enquiries</td>
                    <td className="py-2.5 text-[#8B949E]">Alex</td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 rounded bg-[#2DD4BF]/10 text-[#2DD4BF] font-mono text-[10px] border border-[#2DD4BF]/20">
                        Qualified
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-mono text-[#8B949E]">
                      3m 10s
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-medium text-white">
                      Priya Shah
                    </td>
                    <td className="py-2.5">Urgent Handoff Request</td>
                    <td className="py-2.5 text-[#8B949E]">Maya</td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 rounded bg-[#FBBF24]/10 text-[#FBBF24] font-mono text-[10px] border border-[#FBBF24]/20">
                        Escalated
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-mono text-[#8B949E]">
                      1m 50s
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-medium text-white">
                      Michael Chen
                    </td>
                    <td className="py-2.5">General Hours & Address</td>
                    <td className="py-2.5 text-[#8B949E]">Maya</td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 rounded bg-[#60A5FA]/10 text-[#60A5FA] font-mono text-[10px] border border-[#60A5FA]/20">
                        Answered
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-mono text-[#8B949E]">
                      1m 15s
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Agent Status & Needs Attention */}
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-[#13171C] border border-[#272D35] space-y-3">
            <h2 className="text-sm font-bold text-white">Agent Status</h2>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded bg-[#171C22] border border-[#272D35]">
                <span className="font-medium text-white">
                  Maya (Receptionist)
                </span>
                <span className="flex items-center gap-1.5 text-[#34D399] font-mono text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]"></span>{" "}
                  Available
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[#171C22] border border-[#272D35]">
                <span className="font-medium text-white">
                  Alex (Lead Qualifier)
                </span>
                <span className="flex items-center gap-1.5 text-[#34D399] font-mono text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]"></span>{" "}
                  Available
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-[#13171C] border border-[#272D35] space-y-3">
            <h2 className="text-sm font-bold text-white">Needs Attention</h2>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded bg-[#FBBF24]/5 border border-[#FBBF24]/20 space-y-1">
                <span className="font-semibold text-[#FBBF24]">
                  Transfer Briefing Pending
                </span>
                <p className="text-[#8B949E] text-[11px]">
                  Priya Shah requested human partner handoff for contract
                  litigation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
