import { ShieldCheck, Clock } from 'lucide-react';

export default function AuditLogsPage() {
  return (
    <div className="space-y-6 select-none">
      <div className="border-b border-[#E2E8F0] pb-4">
        <h1 className="text-xl font-bold text-[#0F172A] tracking-tight">
          System Audit & Governance Logs
        </h1>
        <p className="text-xs text-[#64748B]">
          Immutable record of workspace configuration changes, agent updates, and authentication
          events.
        </p>
      </div>

      <div className="rounded-xl bg-white border border-[#E2E8F0] overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F8FAFC] text-[#64748B] border-b border-[#E2E8F0] text-[11px] font-bold uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">Event Type</th>
              <th className="px-4 py-3">Actor</th>
              <th className="px-4 py-3">Target Resource</th>
              <th className="px-4 py-3 font-mono">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0] text-[#334155]">
            <tr className="hover:bg-[#F8FAFC]">
              <td className="px-4 py-3 font-semibold text-[#0F172A]">AGENT_PROVISIONED</td>
              <td className="px-4 py-3">Arslan Vuzmal</td>
              <td className="px-4 py-3 font-mono text-[11px]">Maya (agent_3701kzc5...)</td>
              <td className="px-4 py-3 font-mono text-[#64748B]">Aug 6, 2026 11:10 PM</td>
            </tr>
            <tr className="hover:bg-[#F8FAFC]">
              <td className="px-4 py-3 font-semibold text-[#0F172A]">ENV_CONFIG_UPDATED</td>
              <td className="px-4 py-3">System Admin</td>
              <td className="px-4 py-3 font-mono text-[11px]">ELEVENLABS_API_KEY</td>
              <td className="px-4 py-3 font-mono text-[#64748B]">Aug 6, 2026 10:45 PM</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
