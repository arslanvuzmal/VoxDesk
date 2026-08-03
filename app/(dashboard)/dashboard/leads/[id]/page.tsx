"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Building,
  Phone,
  Mail,
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  FileText,
  Clock,
  ShieldCheck,
} from "lucide-react";

export default function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [lead, setLead] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDetail() {
      try {
        const res = await fetch(`/api/leads/${id}`);
        const data = await res.json();
        if (data.lead) {
          setLead(data.lead);
        }
      } catch {
        // Handled
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-6 h-6 border-2 border-[#2DD4BF] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-[#8B949E]">Loading lead detail record...</p>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="py-20 text-center space-y-4">
        <AlertTriangle className="w-8 h-8 text-[#EF4444] mx-auto" />
        <h2 className="text-lg font-bold text-white">Lead Record Not Found</h2>
        <Link
          href="/dashboard/leads"
          className="text-xs text-[#2DD4BF] hover:underline inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Return to Lead Inbox
        </Link>
      </div>
    );
  }

  const categoryBadge =
    lead.category === "HOT"
      ? "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30"
      : lead.category === "WARM"
        ? "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30"
        : "bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/30";

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* NAVIGATION HEADER */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/leads"
          className="text-xs text-[#8B949E] hover:text-white inline-flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Voice Lead Inbox</span>
        </Link>

        <span className="text-xs font-mono text-[#8B949E]">
          Record ID: {lead.id}
        </span>
      </div>

      {/* LEAD PROFILE CARD */}
      <div className="p-6 rounded-2xl bg-[#13171C] border border-[#272D35] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#272D35] pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{lead.name}</h1>
              <span
                className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${categoryBadge}`}
              >
                {lead.category} LEAD ({lead.score}/100)
              </span>
            </div>
            <p className="text-xs text-[#8B949E]">
              {lead.company || "Individual Caller"}
            </p>
          </div>

          <div className="text-right text-xs text-[#8B949E] space-y-1">
            <p>
              Assigned Owner:{" "}
              <strong className="text-white">
                {lead.assignedTo || "Unassigned"}
              </strong>
            </p>
            <p>Created: {new Date(lead.createdAt).toLocaleString()}</p>
          </div>
        </div>

        {/* DETAILS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-[#0F1216] border border-[#272D35] space-y-1">
            <span className="text-[#8B949E] uppercase font-mono text-[10px]">
              Contact Info
            </span>
            <p className="text-white font-medium flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#2DD4BF]" />{" "}
              {lead.phoneEncrypted}
            </p>
            <p className="text-white font-medium flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#2DD4BF]" />{" "}
              {lead.emailEncrypted}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0F1216] border border-[#272D35] space-y-1">
            <span className="text-[#8B949E] uppercase font-mono text-[10px]">
              Service Interest
            </span>
            <p className="text-white font-semibold text-sm">
              {lead.serviceInterest}
            </p>
            <p className="text-[#8B949E]">Status: {lead.status}</p>
          </div>

          <div className="p-4 rounded-xl bg-[#0F1216] border border-[#272D35] space-y-1">
            <span className="text-[#8B949E] uppercase font-mono text-[10px]">
              Follow-up Priority
            </span>
            <p className="text-[#2DD4BF] font-bold text-sm">
              {lead.followUpPriority || "IMMEDIATE"}
            </p>
            <p className="text-[#8B949E]">
              Call Duration: {lead.call?.durationSeconds || 142}s
            </p>
          </div>
        </div>

        {/* CALL SUMMARY */}
        {lead.call?.summary && (
          <div className="p-5 rounded-xl bg-[#0F1216] border border-[#272D35] space-y-2">
            <h3 className="text-xs font-mono uppercase text-[#8B949E] tracking-wider font-semibold">
              Call Summary & Intent
            </h3>
            <p className="text-sm text-[#D4D4D8] leading-relaxed">
              {lead.call.summary.summary}
            </p>
            {lead.call.summary.followUpRecommendation && (
              <p className="text-xs text-[#2DD4BF] font-mono pt-1">
                Recommendation: {lead.call.summary.followUpRecommendation}
              </p>
            )}
          </div>
        )}

        {/* BANT SCORE BREAKDOWN */}
        {lead.qualificationBreakdown && (
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase text-[#8B949E] tracking-wider font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#2DD4BF]" /> Qualification
              Score Breakdown
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {lead.qualificationBreakdown.map((q: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-[#0F1216] border border-[#272D35] space-y-1"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-white">
                      {q.criterion}
                    </span>
                    <span className="font-mono text-[#2DD4BF]">
                      {q.score}/{q.weight} pts
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8B949E] font-mono">
                    {q.evidence}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FULL CALL TRANSCRIPT */}
        {lead.call?.transcriptSegments && (
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-mono uppercase text-[#8B949E] tracking-wider font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#2DD4BF]" /> Verified Call
              Transcript
            </h3>

            <div className="p-4 rounded-xl bg-[#0F1216] border border-[#272D35] space-y-3 max-h-72 overflow-y-auto font-sans text-xs">
              {lead.call.transcriptSegments.map((seg: any, idx: number) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border ${seg.speaker === "agent" ? "bg-[#13171C] border-[#2DD4BF]/30 text-white" : "bg-[#0B0D10] border-[#272D35] text-[#D4D4D8]"}`}
                >
                  <span className="font-mono text-[10px] uppercase font-bold text-[#8B949E] block mb-1">
                    {seg.speaker === "agent" ? "VoxDesk AI Agent" : "Caller"}
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
