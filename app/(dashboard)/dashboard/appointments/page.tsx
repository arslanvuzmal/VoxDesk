"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  RefreshCw,
  ArrowRight,
  CheckCircle2,
  Clock,
  UserCheck,
} from "lucide-react";

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/appointments");
      const data = await res.json();
      if (data.appointments) {
        setAppointments(data.appointments);
      }
    } catch {
      // Handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  return (
    <div className="space-y-6 select-none">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#30363D] pb-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Appointments & Calendar Booking Log
          </h1>
          <p className="text-xs text-[#8B949E]">
            Confirmed client consultation bookings, staff assignments, and calendar sync status.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchAppointments}
          className="px-3 py-1.5 rounded-md bg-[#21262D] hover:bg-[#30363D] text-xs font-medium text-white border border-[#30363D] flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
          />
          <span>Refresh Bookings</span>
        </button>
      </div>

      {/* APPOINTMENTS TABLE */}
      <div className="rounded-lg bg-[#161B22] border border-[#30363D] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0D1117] text-[#8B949E] border-b border-[#30363D] text-[11px] font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Client / Prospect</th>
                <th className="px-4 py-3">Requested Legal Service</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Scheduled Time Slot</th>
                <th className="px-4 py-3">Assigned Staff</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#30363D] text-[#C9D1D9]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#8B949E]">
                    Loading appointments database...
                  </td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#8B949E]">
                    No confirmed appointments found in database.
                  </td>
                </tr>
              ) : (
                appointments.map((a) => (
                  <tr
                    key={a.id}
                    className="hover:bg-[#1C2129] transition-colors"
                  >
                    <td className="px-4 py-3">
                      <p className="font-semibold text-white">{a.callerName}</p>
                      <p className="text-[11px] text-[#8B949E] font-mono">
                        {a.timezone || "America/New_York"}
                      </p>
                    </td>

                    <td className="px-4 py-3 font-medium text-white">
                      {a.service || "Initial Legal Consultation"}
                    </td>

                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-[#238636]/15 text-[#3FB950] border border-[#238636]/30">
                        <CheckCircle2 className="w-3 h-3" /> {a.status}
                      </span>
                    </td>

                    <td className="px-4 py-3 font-mono text-[#8B949E]">
                      {new Date(a.startTime).toLocaleString()}
                    </td>

                    <td className="px-4 py-3 font-medium text-[#C9D1D9]">
                      Senior Legal Partner
                    </td>

                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/dashboard/appointments/${a.id}`}
                        className="text-[#58A6FF] hover:underline font-semibold text-xs"
                      >
                        Inspect Details &rarr;
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
