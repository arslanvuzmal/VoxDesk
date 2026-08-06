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
        matchedPassages: [
          {
            title: "Northstar Legal Office & Consultation Guide 2026",
            snippet:
              "Initial consultations are scheduled for 30 or 60 minutes. Retainer deposits are processed prior to formal representation.",
            score: 0.94,
          },
        ],
        agentResponse:
          "Our initial legal consultations are available in 30 or 60 minute slots. Retainer deposits are required prior to representation.",
      });
    }, 600);
  };

  return (
    <div className="space-y-6 select-none">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#30363D] pb-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Agent Knowledge Base Index
          </h1>
          <p className="text-xs text-[#8B949E]">
            Grounding documents, fee schedules, and RAG knowledge sources used by AI receptionists during voice calls.
          </p>
        </div>

        <button
          type="button"
          className="px-3 py-1.5 rounded-md bg-[#238636] hover:bg-[#2ea043] text-xs font-semibold text-white flex items-center gap-1.5 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* KNOWLEDGE SOURCES TABLE */}
      <div className="rounded-lg bg-[#161B22] border border-[#30363D] overflow-hidden">
        <div className="p-4 border-b border-[#30363D] flex items-center justify-between bg-[#161B22]">
          <h2 className="text-xs font-bold text-[#8B949E] uppercase tracking-wider">
            Indexed Knowledge Documents ({sources.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0D1117] text-[#8B949E] border-b border-[#30363D] text-[11px] font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Document Title</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Chunks</th>
                <th className="px-4 py-3 font-mono">Last Indexed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#30363D] text-[#C9D1D9]">
              {sources.map((src) => (
                <tr key={src.id} className="hover:bg-[#1C2129] transition-colors">
                  <td className="px-4 py-3 font-semibold text-white">
                    {src.title}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#21262D] text-white border border-[#30363D]">
                      {src.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-[#238636]/15 text-[#3FB950] border border-[#238636]/30">
                      <CheckCircle2 className="w-3 h-3" /> {src.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-[#8B949E]">
                    {src.passagesCount} chunks
                  </td>
                  <td className="px-4 py-3 font-mono text-[#8B949E]">
                    {new Date(src.indexedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RAG GROUNDING BENCHMARK / TESTER */}
      <div className="rounded-lg bg-[#161B22] border border-[#30363D] p-5 space-y-4">
        <h2 className="text-xs font-bold text-[#8B949E] uppercase tracking-wider border-b border-[#30363D] pb-2">
          Knowledge Retrieval Inspector
        </h2>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Type a test question (e.g. 'What are consultation fee terms?')..."
            value={testQuery}
            onChange={(e) => setTestQuery(e.target.value)}
            className="flex-1 bg-[#0D1117] border border-[#30363D] rounded-md px-3 py-1.5 text-xs text-white placeholder-[#6E7681] focus:outline-none focus:border-[#58A6FF]"
          />
          <button
            type="button"
            onClick={handleRunEvaluation}
            disabled={isEvaluating}
            className="px-3 py-1.5 rounded-md bg-[#1F6FEB] hover:bg-[#388BFD] text-xs font-semibold text-white flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            {isEvaluating ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Search className="w-3.5 h-3.5" />
            )}
            <span>Inspect Retrieval</span>
          </button>
        </div>

        {evalResult && (
          <div className="p-4 rounded-md bg-[#0D1117] border border-[#30363D] space-y-3 text-xs">
            <div>
              <p className="text-[11px] font-semibold text-[#8B949E] uppercase">
                Matched RAG Chunk (Confidence: {evalResult.matchedPassages[0].score * 100}%)
              </p>
              <p className="text-white font-medium italic mt-1">
                &quot;{evalResult.matchedPassages[0].snippet}&quot;
              </p>
            </div>
            <div className="pt-2 border-t border-[#21262D]">
              <p className="text-[11px] font-semibold text-[#58A6FF] uppercase">
                Grounded Voice Response
              </p>
              <p className="text-[#C9D1D9] mt-1">{evalResult.agentResponse}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
