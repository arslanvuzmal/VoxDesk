import Link from 'next/link';
import { FileSearch, LayoutDashboard, ArrowLeft } from 'lucide-react';

export default function DashboardNotFound() {
  return (
    <div className="p-8 max-w-xl mx-auto space-y-6 text-xs text-[#F4F4F5]">
      <div className="p-8 rounded-xl bg-[#13171C] border border-[#272D35] text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-[#2DD4BF]/10 border border-[#2DD4BF]/20 text-[#2DD4BF] flex items-center justify-center mx-auto">
          <FileSearch className="w-6 h-6" />
        </div>

        <div className="space-y-1">
          <span className="text-xs font-mono text-[#2DD4BF] font-bold uppercase">
            Record Not Found
          </span>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Dashboard Record Not Found
          </h1>
          <p className="text-xs text-[#8B949E]">
            The requested call, agent, lead, or resource does not exist in this workspace.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            href="/dashboard/calls"
            className="px-4 py-2 rounded-lg bg-[#171C22] hover:bg-[#202730] text-white border border-[#272D35] flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>View All Calls</span>
          </Link>

          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-lg bg-[#2DD4BF] hover:bg-[#26b8a5] text-[#0B0D10] font-bold flex items-center gap-1.5"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Return to Overview</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
