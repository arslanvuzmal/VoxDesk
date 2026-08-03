"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Phone,
  Search,
  RefreshCw,
  ArrowRight,
  Clock,
  FileText,
  CheckCircle2,
} from "lucide-react";

export default function CallsPage() {
  const [calls, setCalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCalls = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/calls");
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Call Log & Operations
          </h1>
          <p className="text-sm text-[#8B949E]">
            Real-time transcript logs, outcomes, and execution data for all
            inbound voice calls.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchCalls}
          className="px-4 py-2 rounded-xl bg-[#13171C] border border-[#272D35] text-xs text-[#F4F4F5] hover:border-[#8B949E] flex items-center gap-2"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
          />
          <span>Refresh</span>
        </button>
      </div>

      <div className="p-6 rounded-2xl bg-[#13171C] border border-[#272D35] space-y-4">
        {loading ? (
          <div className="py-12 text-center space-y-2">
            <RefreshCw className="w-6 h-6 text-[#2DD4BF] animate-spin mx-auto" />
            <p className="text-xs text-[#8B949E]">
              Loading call records from database...
            </p>
          </div>
        ) : calls.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <Phone className="w-8 h-8 text-[#8B949E] mx-auto" />
            <p className="text-sm font-semibold text-white">
              No call records found in database.
            </p>
            <p className="text-xs text-[#8B949E]">
              Run a live demo call to generate database call logs.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {calls.map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-xl bg-[#0F1216] border border-[#272D35] flex items-center justify-between text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">
                      {c.callerName || "Anonymous Caller"}
                    </span>
                    <span className="text-[#8B949E]">
                      ({c.callerNumberMasked})
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#13171C] border border-[#272D35] text-[10px] text-[#2DD4BF]">
                      {c.outcome}
                    </span>
                  </div>
                  <p className="text-[#8B949E]">
                    Started: {new Date(c.startedAt).toLocaleString()} •
                    Duration: {c.durationSeconds}s
                  </p>
                  {c.summary?.summary && (
                    <p className="text-xs text-[#D4D4D8] line-clamp-1 font-mono pt-0.5">
                      &quot;{c.summary.summary}&quot;
                    </p>
                  )}
                </div>

                <Link
                  href={`/dashboard/calls/${c.id}`}
                  className="px-3.5 py-2 rounded-lg bg-[#2DD4BF] text-[#0B0D10] font-bold text-xs flex items-center gap-1 hover:bg-[#26b8a5]"
                >
                  <span>View Call</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
