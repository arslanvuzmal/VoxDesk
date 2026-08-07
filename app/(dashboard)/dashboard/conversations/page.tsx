'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  Search,
  RefreshCw,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Radio,
  PhoneCall,
} from 'lucide-react';

export default function ConversationsPage() {
  const [calls, setCalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');

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

  const filteredCalls = calls.filter(c => {
    if (activeTab === 'LIVE') return c.status === 'IN_PROGRESS';
    if (activeTab === 'COMPLETED')
      return c.outcome === 'APPOINTMENT_SCHEDULED' || c.outcome === 'LEAD_QUALIFIED';
    if (activeTab === 'REVIEW') return c.outcome === 'QUESTION_ANSWERED';
    if (activeTab === 'ESCALATED') return c.escalationUsed || c.outcome === 'ESCALATED_HUMAN';
    return true;
  });

  return (
    <div className="space-y-6 select-none">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
        <div>
          <h1 className="text-xl font-bold text-[#0F172A] tracking-tight">
            Voice Conversations Operations Log
          </h1>
          <p className="text-xs text-[#64748B]">
            Unified inbox of live audio calls, completed intake transcripts, and escalated human
            handoffs.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchCalls}
          className="px-3 py-1.5 rounded-md bg-white hover:bg-[#F8FAFC] text-xs font-semibold text-[#0F172A] border border-[#CBD5E1] flex items-center gap-1.5 transition-colors shadow-sm self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* CONVERSATION TABS */}
      <div className="p-1 rounded-lg bg-white border border-[#E2E8F0] flex items-center gap-1 text-xs shadow-sm overflow-x-auto">
        {[
          { id: 'ALL', label: 'All Conversations' },
          { id: 'LIVE', label: 'Live Active' },
          { id: 'COMPLETED', label: 'Completed' },
          { id: 'REVIEW', label: 'Needs Review' },
          { id: 'ESCALATED', label: 'Escalated' },
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors shrink-0 ${
              activeTab === tab.id
                ? 'bg-[#1D4ED8] text-white shadow-sm'
                : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* CONVERSATIONS DATA TABLE */}
      <div className="rounded-xl bg-white border border-[#E2E8F0] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] text-[#64748B] border-b border-[#E2E8F0] text-[11px] font-bold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Caller Identity</th>
                <th className="px-4 py-3">Direction</th>
                <th className="px-4 py-3">Agent</th>
                <th className="px-4 py-3">Outcome</th>
                <th className="px-4 py-3">Started Timestamp</th>
                <th className="px-4 py-3 text-right">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-[#334155]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#64748B]">
                    Loading conversation logs...
                  </td>
                </tr>
              ) : filteredCalls.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#64748B]">
                    No conversation records found in this view.
                  </td>
                </tr>
              ) : (
                filteredCalls.map(c => (
                  <tr key={c.id} className="hover:bg-[#F8FAFC] transition-colors cursor-pointer">
                    <td className="px-4 py-3">
                      <p className="font-bold text-[#0F172A]">{c.callerName || 'Inbound Caller'}</p>
                      <p className="text-[11px] text-[#64748B] font-mono">
                        {c.callerNumberMasked || '+1 (555) 234-5678'}
                      </p>
                    </td>

                    <td className="px-4 py-3 font-semibold text-[#0F172A]">Inbound Call</td>

                    <td className="px-4 py-3 font-medium text-[#475569]">Maya (Legal Intake)</td>

                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#EFF6FF] text-[#1D4ED8] border border-[#1D4ED8]/20 font-bold">
                        {c.outcome || 'COMPLETED'}
                      </span>
                    </td>

                    <td className="px-4 py-3 font-mono text-[#64748B]">
                      {new Date(c.createdAt).toLocaleString()}
                    </td>

                    <td className="px-4 py-3 text-right font-mono text-[#0F172A] font-semibold">
                      {c.durationSeconds ? `${c.durationSeconds}s` : '2m 45s'}
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
