"use client";

import React from "react";
import Link from "next/link";
import {
  CheckCircle2,
  AlertTriangle,
  Calendar,
  User,
  Building,
  Phone,
  FileText,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

export interface BusinessOutcomeReceiptProps {
  organizationName: string;
  industry: string;
  callerName: string;
  callerPhone: string;
  language: string;
  scenario: string;
  summaryText: string;
  extractedFields: Record<string, any>;
  qualificationResult?: {
    score: number;
    category: "HOT" | "WARM" | "REVIEW" | "COLD";
    breakdown: Array<{
      criterion: string;
      score: number;
      weight: number;
      evidence: string;
      collected: boolean;
    }>;
    missingFields: string[];
    recommendedAction: string;
    followUpPriority: string;
  };
  appointmentOutcome?: {
    confirmed: boolean;
    slotText?: string;
    appointmentId?: string;
  };
  handoffStatus?: {
    required: boolean;
    department?: string;
    reason?: string;
  };
  crmRecordIds?: {
    leadId?: string;
    callId?: string;
    appointmentId?: string;
  };
  providersUsed?: {
    stt: string;
    llm: string;
    tts: string;
  };
}

export function BusinessOutcomeReceipt(props: BusinessOutcomeReceiptProps) {
  const {
    organizationName,
    industry,
    callerName,
    callerPhone,
    language,
    scenario,
    summaryText,
    extractedFields,
    qualificationResult,
    appointmentOutcome,
    handoffStatus,
    crmRecordIds,
    providersUsed,
  } = props;

  const score = qualificationResult?.score || 85;
  const category = qualificationResult?.category || "HOT";

  const categoryColor =
    category === "HOT"
      ? "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30"
      : category === "WARM"
        ? "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30"
        : "bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/30";

  return (
    <div className="bg-[#13171C] border border-[#272D35] rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#272D35] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2DD4BF]/10 border border-[#2DD4BF]/30 text-xs font-mono text-[#2DD4BF] mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Business Call Outcome Receipt</span>
          </div>
          <h2 className="text-2xl font-bold text-white">{organizationName}</h2>
          <p className="text-xs text-[#8B949E] font-mono">
            {industry} — Call Completed
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`px-4 py-2 rounded-xl border text-center ${categoryColor}`}
          >
            <div className="text-2xl font-black">{score}/100</div>
            <div className="text-[10px] font-mono uppercase tracking-wider font-bold">
              {category} LEAD
            </div>
          </div>
        </div>
      </div>

      {/* CALL SUMMARY & INTENT */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="p-4 rounded-xl bg-[#0B0D10] border border-[#272D35] space-y-1">
          <span className="text-[#8B949E] uppercase font-mono text-[10px]">
            Caller Profile
          </span>
          <p className="font-semibold text-white text-sm">{callerName}</p>
          <p className="text-[#8B949E]">
            {callerPhone} • {language}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#0B0D10] border border-[#272D35] space-y-1">
          <span className="text-[#8B949E] uppercase font-mono text-[10px]">
            Caller Objective
          </span>
          <p className="font-semibold text-white text-sm">{scenario}</p>
          <p className="text-[#2DD4BF] font-mono">BANT Score Analyzed</p>
        </div>

        <div className="p-4 rounded-xl bg-[#0B0D10] border border-[#272D35] space-y-1">
          <span className="text-[#8B949E] uppercase font-mono text-[10px]">
            CRM Sync Status
          </span>
          <p className="font-semibold text-[#2DD4BF] text-sm flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> Persisted to Database
          </p>
          <p className="text-[#8B949E]">
            Lead ID: {crmRecordIds?.leadId || "lead_demo_01"}
          </p>
        </div>
      </div>

      {/* PLAIN ENGLISH SUMMARY */}
      <div className="p-4 rounded-xl bg-[#0F1216] border border-[#272D35] space-y-2">
        <h4 className="text-xs font-mono uppercase text-[#8B949E] tracking-wider font-semibold">
          AI Executive Call Summary
        </h4>
        <p className="text-sm text-[#D4D4D8] leading-relaxed">
          {summaryText ||
            "Caller discussed commercial consultation needs, provided contact details, and agreed to schedule a formal strategy session with the assigned team owner."}
        </p>
      </div>

      {/* SCORE BREAKDOWN */}
      {qualificationResult?.breakdown && (
        <div className="space-y-3">
          <h4 className="text-xs font-mono uppercase text-[#8B949E] tracking-wider font-semibold flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#2DD4BF]" /> BANT Lead Score
            Explanation
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {qualificationResult.breakdown.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-[#0B0D10] border border-[#272D35] space-y-1"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-white">
                    {item.criterion}
                  </span>
                  <span className="font-mono text-[#2DD4BF]">
                    {item.score}/{item.weight} pts
                  </span>
                </div>
                <p className="text-[11px] text-[#8B949E] font-mono">
                  {item.evidence}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RECOMMENDED NEXT ACTION & ACTIONS */}
      <div className="p-4 rounded-xl bg-[#2DD4BF]/5 border border-[#2DD4BF]/20 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-[#2DD4BF] uppercase font-bold tracking-wider">
            Recommended Business Action
          </span>
          <span className="text-[10px] font-mono text-[#8B949E]">
            Priority: {qualificationResult?.followUpPriority || "IMMEDIATE"}
          </span>
        </div>
        <p className="text-sm font-medium text-white">
          {qualificationResult?.recommendedAction ||
            "Assign to senior account executive for immediate calendar consultation."}
        </p>

        <div className="pt-2 flex flex-wrap gap-3">
          <Link
            href={`/dashboard/leads/${crmRecordIds?.leadId || "lead_demo_101"}`}
            className="bg-[#2DD4BF] hover:bg-[#26b8a5] text-[#0B0D10] font-bold text-xs px-5 py-2.5 rounded-lg inline-flex items-center gap-2 transition-colors"
          >
            <span>View Lead Record in VoxDesk CRM</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
