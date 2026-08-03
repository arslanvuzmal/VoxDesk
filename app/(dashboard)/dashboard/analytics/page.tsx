"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  RefreshCw,
  PhoneCall,
  Calendar,
  Users,
  Percent,
  Clock,
} from "lucide-react";

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/analytics");
      const data = await res.json();
      if (data.metrics) {
        setMetrics(data.metrics);
      }
    } catch {
      // Handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Voice Analytics & Performance
          </h1>
          <p className="text-sm text-[#8B949E]">
            Calculated database metrics for inbound call volumes, booking
            conversion, and lead qualification scores.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchAnalytics}
          className="px-4 py-2 rounded-xl bg-[#13171C] border border-[#272D35] text-xs text-[#F4F4F5] hover:border-[#8B949E] flex items-center gap-2"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
          />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-2">
          <RefreshCw className="w-6 h-6 text-[#2DD4BF] animate-spin mx-auto" />
          <p className="text-xs text-[#8B949E]">
            Calculating voice metrics from database...
          </p>
        </div>
      ) : !metrics ? (
        <div className="py-20 text-center space-y-2">
          <TrendingUp className="w-8 h-8 text-[#8B949E] mx-auto" />
          <p className="text-sm font-semibold text-white">
            No database analytics available.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl bg-[#13171C] border border-[#272D35] space-y-1">
              <span className="text-xs font-mono text-[#8B949E] uppercase">
                Total Inbound Calls
              </span>
              <div className="text-3xl font-black text-white">
                {metrics.totalCalls}
              </div>
              <p className="text-xs text-[#8B949E]">Calls logged in system</p>
            </div>

            <div className="p-5 rounded-xl bg-[#13171C] border border-[#272D35] space-y-1">
              <span className="text-xs font-mono text-[#8B949E] uppercase">
                Appointments Booked
              </span>
              <div className="text-3xl font-black text-[#2DD4BF]">
                {metrics.appointmentsBooked}
              </div>
              <p className="text-xs text-[#8B949E]">
                Confirmed calendar events
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#13171C] border border-[#272D35] space-y-1">
              <span className="text-xs font-mono text-[#8B949E] uppercase">
                Leads Qualified
              </span>
              <div className="text-3xl font-black text-[#F59E0B]">
                {metrics.leadsCreated}
              </div>
              <p className="text-xs text-[#8B949E]">CRM lead inbox entries</p>
            </div>

            <div className="p-5 rounded-xl bg-[#13171C] border border-[#272D35] space-y-1">
              <span className="text-xs font-mono text-[#8B949E] uppercase">
                Booking Conversion
              </span>
              <div className="text-3xl font-black text-[#3B82F6]">
                {metrics.conversionRate}%
              </div>
              <p className="text-xs text-[#8B949E]">
                Calls to booked appointments
              </p>
            </div>
          </div>

          {/* LEAD CATEGORY DISTRIBUTION */}
          <div className="p-6 rounded-2xl bg-[#13171C] border border-[#272D35] space-y-4">
            <h3 className="text-base font-bold text-white">
              Lead Qualification Distribution
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono text-center">
              <div className="p-4 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 space-y-1">
                <span className="text-[#EF4444] font-bold block">
                  HOT LEADS
                </span>
                <span className="text-2xl font-black text-white">
                  {metrics.leadCategories.hot}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/30 space-y-1">
                <span className="text-[#F59E0B] font-bold block">
                  WARM LEADS
                </span>
                <span className="text-2xl font-black text-white">
                  {metrics.leadCategories.warm}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-[#3B82F6]/10 border border-[#3B82F6]/30 space-y-1">
                <span className="text-[#3B82F6] font-bold block">
                  HUMAN REVIEW
                </span>
                <span className="text-2xl font-black text-white">
                  {metrics.leadCategories.review}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-[#0F1216] border border-[#272D35] space-y-1">
                <span className="text-[#8B949E] font-bold block">
                  COLD LEADS
                </span>
                <span className="text-2xl font-black text-white">
                  {metrics.leadCategories.cold}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
