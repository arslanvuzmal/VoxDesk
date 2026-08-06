"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Download,
  Building2,
  Clock,
  UserCheck,
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
    <div className="space-y-6 select-none">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#30363D] pb-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Voice Lead Operations Inbox
          </h1>
          <p className="text-xs text-[#8B949E]">
            Qualified inbound prospects, intake recordings, and BANT scoring records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchLeads}
            className="px-3 py-1.5 rounded-md bg-[#21262D] hover:bg-[#30363D] text-xs font-medium text-white border border-[#30363D] flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
            />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {/* SUMMARY STATS BAR */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="p-3 rounded-lg bg-[#161B22] border border-[#30363D] flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold text-[#8B949E] uppercase tracking-wider">
              Priority Hot (≥75)
            </p>
            <p className="text-lg font-bold text-white font-mono mt-0.5">{hotCount}</p>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-[#F85149]" />
        </div>

        <div className="p-3 rounded-lg bg-[#161B22] border border-[#30363D] flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold text-[#8B949E] uppercase tracking-wider">
              Warm Opportunities
            </p>
            <p className="text-lg font-bold text-white font-mono mt-0.5">{warmCount}</p>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-[#D29922]" />
        </div>

        <div className="p-3 rounded-lg bg-[#161B22] border border-[#30363D] flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold text-[#8B949E] uppercase tracking-wider">
              Review Required
            </p>
            <p className="text-lg font-bold text-white font-mono mt-0.5">{reviewCount}</p>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-[#58A6FF]" />
        </div>

        <div className="p-3 rounded-lg bg-[#161B22] border border-[#30363D] flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold text-[#8B949E] uppercase tracking-wider">
              Cold / Unqualified
            </p>
            <p className="text-lg font-bold text-white font-mono mt-0.5">{coldCount}</p>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-[#6E7681]" />
        </div>
      </div>

      {/* FILTER TOOLBAR */}
      <div className="p-3 rounded-lg bg-[#161B22] border border-[#30363D] flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto text-xs">
          {[
            { id: "ALL", label: "All Leads" },
            { id: "HOT", label: "Hot (≥75)" },
            { id: "WARM", label: "Warm (≥50)" },
            { id: "REVIEW", label: "Review Needed" },
            { id: "COLD", label: "Cold" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setCategoryFilter(tab.id)}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors shrink-0 ${
                categoryFilter === tab.id
                  ? "bg-[#21262D] text-white border border-[#30363D]"
                  : "text-[#8B949E] hover:text-white hover:bg-[#161B22]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Urgency Filters */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8B949E]" />
            <input
              type="text"
              placeholder="Filter by lead name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchLeads()}
              className="bg-[#0D1117] border border-[#30363D] rounded-md pl-8 pr-3 py-1.5 text-xs text-white placeholder-[#6E7681] focus:outline-none focus:border-[#58A6FF]"
            />
          </div>

          <select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
            className="bg-[#0D1117] border border-[#30363D] rounded-md px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#58A6FF]"
          >
            <option value="ALL">All Urgency</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="rounded-lg bg-[#161B22] border border-[#30363D] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0D1117] text-[#8B949E] border-b border-[#30363D] text-[11px] font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Lead Contact</th>
                <th className="px-4 py-3">BANT Qualification</th>
                <th className="px-4 py-3">Matter / Category</th>
                <th className="px-4 py-3">Urgency</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#30363D] text-[#C9D1D9]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#8B949E]">
                    Loading leads database...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#8B949E]">
                    No leads matching current filters.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="hover:bg-[#1C2129] transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/leads/${lead.id}`}
                        className="font-semibold text-white hover:text-[#58A6FF]"
                      >
                        {lead.name}
                      </Link>
                      <p className="text-[11px] text-[#8B949E] font-mono">
                        {lead.email}
                      </p>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white font-mono text-sm">
                          {lead.score}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                            lead.category === "HOT"
                              ? "bg-[#F85149]/15 text-[#F85149] border-[#F85149]/30"
                              : lead.category === "WARM"
                              ? "bg-[#D29922]/15 text-[#D29922] border-[#D29922]/30"
                              : lead.category === "REVIEW"
                              ? "bg-[#58A6FF]/15 text-[#58A6FF] border-[#58A6FF]/30"
                              : "bg-[#6E7681]/15 text-[#6E7681] border-[#6E7681]/30"
                          }`}
                        >
                          {lead.category}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3 font-medium text-[#C9D1D9]">
                      {lead.legalServiceNeeded || lead.practiceArea || "Legal Inquiry"}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`text-[11px] font-mono ${
                          lead.urgency === "URGENT"
                            ? "text-[#F85149] font-bold"
                            : lead.urgency === "HIGH"
                            ? "text-[#D29922] font-semibold"
                            : "text-[#8B949E]"
                        }`}
                      >
                        {lead.urgency}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#21262D] text-white border border-[#30363D]">
                        {lead.status}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/dashboard/leads/${lead.id}`}
                        className="text-[#58A6FF] hover:underline font-semibold text-xs"
                      >
                        Inspect Record &rarr;
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
