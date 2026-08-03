"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  RefreshCw,
  ArrowRight,
  CheckCircle2,
  Clock,
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Appointments & Calendar
          </h1>
          <p className="text-sm text-[#8B949E]">
            Confirmed bookings, timeslot reservations, and calendar
            synchronization status.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchAppointments}
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
              Loading appointments from database...
            </p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <Calendar className="w-8 h-8 text-[#8B949E] mx-auto" />
            <p className="text-sm font-semibold text-white">
              No appointments found in database.
            </p>
            <p className="text-xs text-[#8B949E]">
              Run a booking scenario in the interactive demo page.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map((a) => (
              <div
                key={a.id}
                className="p-4 rounded-xl bg-[#0F1216] border border-[#272D35] flex items-center justify-between text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">
                      {a.callerName}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#2DD4BF]/10 text-[#2DD4BF] border border-[#2DD4BF]/30 text-[10px] font-bold">
                      {a.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#D4D4D8]">
                    Service: <strong className="text-white">{a.service}</strong>
                  </p>
                  <p className="text-[#8B949E]">
                    Start Time: {new Date(a.startTime).toLocaleString()} (
                    {a.timezone})
                  </p>
                </div>

                <Link
                  href={`/dashboard/appointments/${a.id}`}
                  className="px-3.5 py-2 rounded-lg bg-[#2DD4BF] text-[#0B0D10] font-bold text-xs flex items-center gap-1 hover:bg-[#26b8a5]"
                >
                  <span>View Details</span>
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
