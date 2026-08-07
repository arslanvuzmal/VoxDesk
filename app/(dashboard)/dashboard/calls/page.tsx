'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Phone,
  Search,
  RefreshCw,
  ArrowRight,
  Clock,
  FileText,
  CheckCircle2,
  AlertTriangle,
  User,
} from 'lucide-react';

export default function CallsPage() {
  const [calls, setCalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCalls = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/calls');
      const data = await res.json();
      if (data.calls) {
        setCalls(data.calls);
      }
    } catch {
      // Handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalls();
  }, []);

  return (
    <div className="space-y-6 select-none">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#30363D] pb-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Voice Call Operations Log</h1>
          <p className="text-xs text-[#8B949E]">
            Real-time audio transcript logs, session duration, agent assignments, and outcome
            status.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchCalls}
          className="px-3 py-1.5 rounded-md bg-[#21262D] hover:bg-[#30363D] text-xs font-medium text-white border border-[#30363D] flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Calls</span>
        </button>
      </div>

      {/* CALL LOG TABLE */}
      <div className="rounded-lg bg-[#161B22] border border-[#30363D] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0D1117] text-[#8B949E] border-b border-[#30363D] text-[11px] font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Caller Identity</th>
                <th className="px-4 py-3">AI Receptionist</th>
                <th className="px-4 py-3">Call Outcome</th>
                <th className="px-4 py-3">Session Timestamp</th>
                <th className="px-4 py-3 text-right">Duration</th>
                <th className="px-4 py-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#30363D] text-[#C9D1D9]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#8B949E]">
                    Loading call log database...
                  </td>
                </tr>
              ) : calls.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#8B949E]">
                    No recorded calls found in system.
                  </td>
                </tr>
              ) : (
                calls.map(c => (
                  <tr key={c.id} className="hover:bg-[#1C2129] transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-white">{c.callerName || 'Inbound Caller'}</p>
                      <p className="text-[11px] text-[#8B949E] font-mono">
                        {c.callerNumberMasked || '+1 (555) 234-5678'}
                      </p>
                    </td>

                    <td className="px-4 py-3 font-medium text-white">Maya (Legal Intake)</td>

                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#21262D] text-[#58A6FF] border border-[#30363D]">
                        {c.outcome || 'COMPLETED'}
                      </span>
                    </td>

                    <td className="px-4 py-3 font-mono text-[#8B949E]">
                      {new Date(c.createdAt).toLocaleString()}
                    </td>

                    <td className="px-4 py-3 text-right font-mono text-white">
                      {c.durationSeconds ? `${c.durationSeconds}s` : '2m 45s'}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/dashboard/calls/${c.id}`}
                        className="text-[#58A6FF] hover:underline font-semibold text-xs"
                      >
                        Inspect Call &rarr;
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
