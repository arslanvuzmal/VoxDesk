"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  PhoneCall,
  Calendar,
  Sparkles,
  RefreshCw,
} from "lucide-react";

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [urgencyFilter, setUrgencyFilter] = useState("ALL");

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.set("search", search);
      if (categoryFilter !== "ALL") query.set("category", categoryFilter);
      if (urgencyFilter !== "ALL") query.set("urgency", urgencyFilter);

      const res = await fetch(`/api/leads?${query.toString()}`);
      const data = await res.json();
      if (data.leads) {
        setLeads(data.leads);
      }
    } catch {
      // Handled gracefully
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilter, urgencyFilter]);

  const hotCount = leads.filter((l) => l.category === "HOT").length;
  const warmCount = leads.filter((l) => l.category === "WARM").length;
  const reviewCount = leads.filter((l) => l.category === "REVIEW").length;
  const coldCount = leads.filter((l) => l.category === "COLD").length;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2DD4BF]/10 border border-[#2DD4BF]/30 text-xs font-mono text-[#2DD4BF] mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Database-Backed CRM Lead Inbox</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Voice Lead Inbox</h1>
          <p className="text-sm text-[#8B949E]">
            Qualified leads automatically processed, scored, and persisted from
            inbound VoxDesk calls.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchLeads}
          className="px-4 py-2 rounded-xl bg-[#13171C] border border-[#272D35] text-xs text-[#F4F4F5] hover:border-[#8B949E] flex items-center gap-2 transition-colors self-start sm:self-auto"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
          />
          <span>Refresh Inbox</span>
        </button>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-[#EF4444]/30 bg-[#EF4444]/5 space-y-1">
          <span className="text-[10px] font-mono uppercase text-[#EF4444] font-bold">
            HOT LEADS (≥75)
          </span>
          <div className="text-2xl font-extrabold text-white">{hotCount}</div>
          <p className="text-[11px] text-[#8B949E]">
            Immediate priority response
          </p>
        </div>

        <div className="p-4 rounded-xl border border-[#F59E0B]/30 bg-[#F59E0B]/5 space-y-1">
          <span className="text-[10px] font-mono uppercase text-[#F59E0B] font-bold">
            WARM LEADS (≥50)
          </span>
          <div className="text-2xl font-extrabold text-white">{warmCount}</div>
          <p className="text-[11px] text-[#8B949E]">Scheduled follow-up</p>
        </div>

        <div className="p-4 rounded-xl border border-[#3B82F6]/30 bg-[#3B82F6]/5 space-y-1">
          <span className="text-[10px] font-mono uppercase text-[#3B82F6] font-bold">
            HUMAN REVIEW (≥25)
          </span>
          <div className="text-2xl font-extrabold text-white">
            {reviewCount}
          </div>
          <p className="text-[11px] text-[#8B949E]">Needs operator review</p>
        </div>

        <div className="p-4 rounded-xl border border-[#272D35] bg-[#0F1216] space-y-1">
          <span className="text-[10px] font-mono uppercase text-[#8B949E] font-bold">
            COLD LEADS (&lt;25)
          </span>
          <div className="text-2xl font-extrabold text-white">{coldCount}</div>
          <p className="text-[11px] text-[#8B949E]">General nurture sequence</p>
        </div>
      </div>

      {/* FILTERS & SEARCH */}
      <div className="p-4 rounded-xl bg-[#13171C] border border-[#272D35] flex flex-col sm:flex-row items-center justify-between gap-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchLeads();
          }}
          className="relative w-full sm:w-96"
        >
          <Search className="w-4 h-4 text-[#8B949E] absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search leads by name, company, service..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0B0D10] border border-[#272D35] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-[#8B949E] focus:outline-none focus:border-[#2DD4BF]"
          />
        </form>

        <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <div className="flex items-center gap-1 text-xs text-[#8B949E]">
            <Filter className="w-3.5 h-3.5" />
            <span>Category:</span>
          </div>

          <div className="flex items-center gap-1 bg-[#0B0D10] p-1 rounded-xl border border-[#272D35]">
            {["ALL", "HOT", "WARM", "REVIEW"].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors ${
                  categoryFilter === cat
                    ? "bg-[#2DD4BF] text-[#0B0D10] font-bold"
                    : "text-[#8B949E] hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* LEADS TABLE LIST */}
      <div className="p-6 rounded-2xl bg-[#13171C] border border-[#272D35] space-y-4">
        {loading ? (
          <div className="py-12 text-center space-y-3">
            <RefreshCw className="w-6 h-6 text-[#2DD4BF] animate-spin mx-auto" />
            <p className="text-xs text-[#8B949E]">
              Fetching voice leads from database...
            </p>
          </div>
        ) : leads.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <Users className="w-8 h-8 text-[#8B949E] mx-auto" />
            <p className="text-sm font-semibold text-white">
              No leads match your filter criteria.
            </p>
            <p className="text-xs text-[#8B949E]">
              Try placing a test call in the interactive demo page.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {leads.map((l) => {
              const categoryBadge =
                l.category === "HOT"
                  ? "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30"
                  : l.category === "WARM"
                    ? "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30"
                    : "bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/30";

              return (
                <div
                  key={l.id}
                  className="p-5 rounded-xl bg-[#0F1216] border border-[#272D35] hover:border-[#2DD4BF]/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h4 className="text-base font-bold text-white">
                        {l.name}
                      </h4>
                      {l.company && (
                        <span className="text-xs text-[#8B949E] bg-[#13171C] px-2.5 py-0.5 rounded-full border border-[#272D35]">
                          {l.company}
                        </span>
                      )}
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${categoryBadge}`}
                      >
                        {l.category} ({l.score}/100)
                      </span>
                    </div>

                    <p className="text-xs text-[#D4D4D8]">
                      Service Interest:{" "}
                      <strong className="text-white">
                        {l.serviceInterest || "General Consultation"}
                      </strong>
                    </p>

                    {l.call?.summary?.summary && (
                      <p className="text-xs text-[#8B949E] line-clamp-2 pt-1 font-mono">
                        &quot;{l.call.summary.summary}&quot;
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 self-end md:self-auto">
                    <Link
                      href={`/dashboard/leads/${l.id}`}
                      className="px-4 py-2 rounded-xl bg-[#2DD4BF] hover:bg-[#26b8a5] text-[#0B0D10] font-bold text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <span>View Lead Detail</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
