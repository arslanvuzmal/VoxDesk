"use client";

import { useState } from "react";
import {
  FileText,
  Upload,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  BookOpen,
  Plus,
  RefreshCw,
} from "lucide-react";

interface KnowledgeSourceItem {
  id: string;
  title: string;
  type: "PDF" | "DOCX" | "TXT" | "MARKDOWN" | "URL" | "STRUCTURED_FAQ";
  status:
    | "DRAFT"
    | "PROCESSING"
    | "INDEXED"
    | "TESTING"
    | "ACTIVE"
    | "ARCHIVED"
    | "FAILED";
  sourceUrlOrPath?: string;
  indexedAt: string;
  version: string;
  language: string;
  passagesCount: number;
}

export default function KnowledgeManagementPage() {
  const [sources, setSources] = useState<KnowledgeSourceItem[]>([
    {
      id: "src-office-guide",
      title: "Northstar Legal Office & Consultation Guide 2026",
      type: "STRUCTURED_FAQ",
      status: "ACTIVE",
      indexedAt: "2026-08-01T00:00:00Z",
      version: "2.5.0",
      language: "en-US",
      passagesCount: 18,
    },
    {
      id: "src-billing-terms",
      title: "Northstar Client Billing & Retainer Agreement Standard Terms",
      type: "PDF",
      sourceUrlOrPath: "/docs/northstar-billing-2026.pdf",
      status: "ACTIVE",
      indexedAt: "2026-08-01T00:00:00Z",
      version: "1.0.0",
      language: "en-US",
      passagesCount: 42,
    },
    {
      id: "src-intake-policy",
      title: "Adverse Party Conflict Check & Emergency Triage Procedure",
      type: "DOCX",
      sourceUrlOrPath: "/docs/intake-triage.docx",
      status: "INDEXED",
      indexedAt: "2026-08-05T12:00:00Z",
      version: "1.1.0",
      language: "en-US",
      passagesCount: 15,
    },
  ]);

  const [testQuery, setTestQuery] = useState("");
  const [evalResult, setEvalResult] = useState<any | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const handleRunEvaluation = () => {
    if (!testQuery.trim()) return;
    setIsEvaluating(true);
    setTimeout(() => {
      setIsEvaluating(false);
      setEvalResult({
        query: testQuery,
        matchedSource: "Northstar Legal Office & Consultation Guide 2026",
        passage:
          "Initial strategy consultations are $250 for up to 45 minutes. If your case is accepted and retainer signed, the fee is credited toward your retainer balance.",
        confidenceScore: 0.94,
        status: "APPROVED_RETRIEVAL",
      });
    }, 600);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-white">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#272D35] pb-5">
        <div>
          <span className="text-xs font-mono text-[#2DD4BF] uppercase tracking-wider font-bold">
            Grounding & RAG Index
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Approved Business Knowledge Base
          </h1>
          <p className="text-xs text-[#8B949E] mt-1">
            Manage, index, evaluate and activate domain knowledge documents for
            voice receptionists.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-4 py-2 rounded-lg bg-[#171C22] border border-[#272D35] text-xs font-semibold text-[#D4D4D8] hover:text-white flex items-center gap-2">
            <LinkIcon className="w-3.5 h-3.5" /> Ingest URL
          </button>
          <button className="px-4 py-2 rounded-lg bg-[#2DD4BF] hover:bg-[#26b8a5] text-[#0B0D10] text-xs font-bold flex items-center gap-2">
            <Upload className="w-3.5 h-3.5" /> Upload Document
          </button>
        </div>
      </div>

      {/* RAG Status Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
        <div className="p-4 rounded-lg bg-[#13171C] border border-[#272D35] space-y-1">
          <span className="text-[#8B949E] block">Active Business Profile</span>
          <span className="font-bold text-white text-sm">
            Northstar Legal Consultations
          </span>
        </div>
        <div className="p-4 rounded-lg bg-[#13171C] border border-[#272D35] space-y-1">
          <span className="text-[#8B949E] block">Active Index Version</span>
          <span className="font-mono text-[#34D399] font-bold text-sm">
            v2.5.0
          </span>
        </div>
        <div className="p-4 rounded-lg bg-[#13171C] border border-[#272D35] space-y-1">
          <span className="text-[#8B949E] block">Indexed Passages</span>
          <span className="font-bold text-white text-sm">
            75 Approved Passages
          </span>
        </div>
        <div className="p-4 rounded-lg bg-[#13171C] border border-[#272D35] space-y-1">
          <span className="text-[#8B949E] block">Evaluation Score</span>
          <span className="font-bold text-[#2DD4BF] text-sm">
            98.4% Groundedness
          </span>
        </div>
      </div>

      {/* Main Knowledge Sources Table */}
      <div className="p-5 rounded-lg bg-[#13171C] border border-[#272D35] space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#2DD4BF]" /> Grounding Sources &
          Documents
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#272D35] text-[#8B949E] uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3 font-semibold">Document Title</th>
                <th className="py-2.5 px-3 font-semibold">Type</th>
                <th className="py-2.5 px-3 font-semibold">Version</th>
                <th className="py-2.5 px-3 font-semibold">Language</th>
                <th className="py-2.5 px-3 font-semibold">Passages</th>
                <th className="py-2.5 px-3 font-semibold">Status</th>
                <th className="py-2.5 px-3 font-semibold">Indexed At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#272D35]">
              {sources.map((src) => (
                <tr
                  key={src.id}
                  className="hover:bg-[#171C22]/50 transition-colors"
                >
                  <td className="py-3 px-3 font-medium text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#2DD4BF] shrink-0" />
                    <span>{src.title}</span>
                  </td>
                  <td className="py-3 px-3 font-mono text-[#8B949E]">
                    {src.type}
                  </td>
                  <td className="py-3 px-3 font-mono text-gray-300">
                    {src.version}
                  </td>
                  <td className="py-3 px-3 text-[#8B949E]">{src.language}</td>
                  <td className="py-3 px-3 font-mono text-white">
                    {src.passagesCount}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                        src.status === "ACTIVE"
                          ? "bg-[#34D399]/20 text-[#34D399] border border-[#34D399]/30"
                          : src.status === "INDEXED"
                            ? "bg-[#2DD4BF]/20 text-[#2DD4BF] border border-[#2DD4BF]/30"
                            : "bg-red-950/60 text-red-400 border border-red-800"
                      }`}
                    >
                      {src.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-[#8B949E] font-mono">
                    {new Date(src.indexedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RAG Evaluation & Testing Sandbox */}
      <div className="p-5 rounded-lg bg-[#13171C] border border-[#272D35] space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Search className="w-4 h-4 text-[#2DD4BF]" /> Retrieval & Grounding
          Evaluator
        </h2>

        <div className="flex items-center gap-3">
          <input
            type="text"
            value={testQuery}
            onChange={(e) => setTestQuery(e.target.value)}
            placeholder="Type a test question (e.g., 'What is your consultation fee?')"
            className="flex-1 bg-[#0F1216] border border-[#272D35] rounded-lg px-3.5 py-2 text-xs text-white placeholder-[#8B949E] focus:outline-none focus:border-[#2DD4BF]"
          />
          <button
            onClick={handleRunEvaluation}
            disabled={isEvaluating || !testQuery.trim()}
            className="px-4 py-2 rounded-lg bg-[#2DD4BF] text-[#0B0D10] text-xs font-bold hover:bg-[#26b8a5] disabled:opacity-40 flex items-center gap-1.5 shrink-0"
          >
            {isEvaluating ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Search className="w-3.5 h-3.5" />
            )}
            <span>Test Retrieval</span>
          </button>
        </div>

        {evalResult && (
          <div className="p-4 rounded bg-[#0F1216] border border-[#272D35] space-y-2 text-xs">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-[#34D399] uppercase tracking-wider font-mono">
                Matched Source: {evalResult.matchedSource}
              </span>
              <span className="font-mono text-[#2DD4BF]">
                Confidence: {(evalResult.confidenceScore * 100).toFixed(1)}%
              </span>
            </div>
            <p className="text-white italic bg-[#171C22] p-3 rounded border border-[#272D35]">
              &quot;{evalResult.passage}&quot;
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
