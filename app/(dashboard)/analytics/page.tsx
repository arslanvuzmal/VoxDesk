import { BarChart3, TrendingUp, DollarSign, Clock } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Call Analytics & Provider Costs</h1>
        <p className="text-sm text-gray-400">Database-backed metrics, duration breakdowns, and provider cost estimates.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-2">
          <span className="text-xs text-gray-400 font-medium">Estimated Provider Cost (This Month)</span>
          <p className="text-3xl font-extrabold text-teal-400">$11.84</p>
          <span className="text-xs text-gray-400 font-mono">Avg cost per call: $0.08</span>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-2">
          <span className="text-xs text-gray-400 font-medium">Total Call Duration</span>
          <p className="text-3xl font-extrabold text-white">4h 48m</p>
          <span className="text-xs text-teal-400 font-mono">148 inbound calls</span>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-2">
          <span className="text-xs text-gray-400 font-medium">Conversion / Booking Rate</span>
          <p className="text-3xl font-extrabold text-emerald-400">28.3%</p>
          <span className="text-xs text-emerald-400 font-mono">42 appointments confirmed</span>
        </div>
      </div>
    </div>
  );
}
