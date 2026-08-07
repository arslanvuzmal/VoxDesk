'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Phone,
  Clock,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';

export default function CallDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [call, setCall] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCall() {
      try {
        const res = await fetch(`/api/calls/${id}`);
        const data = await res.json();
        if (data.call) {
          setCall(data.call);
        }
      } catch {
        // Handled
      } finally {
        setLoading(false);
      }
    }
    fetchCall();
  }, [id]);

  if (loading) {
    return (
      <div className="py-20 text-center space-y-2">
        <div className="w-6 h-6 border-2 border-[#2DD4BF] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-[#8B949E]">Loading call detail...</p>
      </div>
    );
  }

  if (!call) {
    return (
      <div className="py-20 text-center space-y-4">
        <AlertTriangle className="w-8 h-8 text-[#EF4444] mx-auto" />
        <h2 className="text-lg font-bold text-white">Call Record Not Found</h2>
        <Link
          href="/dashboard/calls"
          className="text-xs text-[#2DD4BF] hover:underline inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Return to Calls Log
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/calls"
          className="text-xs text-[#8B949E] hover:text-white inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Call Log</span>
        </Link>
        <span className="text-xs font-mono text-[#8B949E]">Call ID: {call.id}</span>
      </div>

      <div className="p-6 rounded-2xl bg-[#13171C] border border-[#272D35] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#272D35] pb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {call.callerName || 'Anonymous Caller'}
            </h1>
            <p className="text-xs text-[#8B949E]">
              {call.callerNumberMasked} • {new Date(call.startedAt).toLocaleString()}
            </p>
          </div>

          <div className="px-4 py-2 rounded-xl bg-[#0F1216] border border-[#272D35] text-right">
            <span className="text-[10px] font-mono text-[#8B949E] uppercase block">Outcome</span>
            <span className="text-sm font-bold text-[#2DD4BF]">{call.outcome}</span>
          </div>
        </div>

        {call.summary && (
          <div className="p-4 rounded-xl bg-[#0F1216] border border-[#272D35] space-y-2">
            <h3 className="text-xs font-mono uppercase text-[#8B949E] font-semibold">
              Executive Call Summary
            </h3>
            <p className="text-sm text-[#D4D4D8] leading-relaxed">{call.summary.summary}</p>
          </div>
        )}

        {call.transcriptSegments && call.transcriptSegments.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase text-[#8B949E] font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#2DD4BF]" /> Audio Transcript
            </h3>

            <div className="p-4 rounded-xl bg-[#0F1216] border border-[#272D35] space-y-3 max-h-72 overflow-y-auto text-xs">
              {call.transcriptSegments.map((seg: any, idx: number) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border ${seg.speaker === 'agent' ? 'bg-[#13171C] border-[#2DD4BF]/30 text-white' : 'bg-[#0B0D10] border-[#272D35] text-[#D4D4D8]'}`}
                >
                  <span className="font-mono text-[10px] uppercase text-[#8B949E] block mb-1">
                    {seg.speaker === 'agent' ? 'VoxDesk AI Agent' : 'Caller'}
                  </span>
                  <p>{seg.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
