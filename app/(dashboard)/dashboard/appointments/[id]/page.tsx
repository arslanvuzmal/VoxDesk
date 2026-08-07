'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, User, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function AppointmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [appointment, setAppointment] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAppt() {
      try {
        const res = await fetch(`/api/appointments/${id}`);
        const data = await res.json();
        if (data.appointment) {
          setAppointment(data.appointment);
        }
      } catch {
        // Handled
      } finally {
        setLoading(false);
      }
    }
    fetchAppt();
  }, [id]);

  if (loading) {
    return (
      <div className="py-20 text-center space-y-2">
        <div className="w-6 h-6 border-2 border-[#2DD4BF] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-[#8B949E]">Loading appointment detail...</p>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="py-20 text-center space-y-4">
        <AlertTriangle className="w-8 h-8 text-[#EF4444] mx-auto" />
        <h2 className="text-lg font-bold text-white">Appointment Record Not Found</h2>
        <Link
          href="/dashboard/appointments"
          className="text-xs text-[#2DD4BF] hover:underline inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Return to Appointments Log
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/appointments"
          className="text-xs text-[#8B949E] hover:text-white inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Appointments Log</span>
        </Link>
        <span className="text-xs font-mono text-[#8B949E]">ID: {appointment.id}</span>
      </div>

      <div className="p-6 rounded-2xl bg-[#13171C] border border-[#272D35] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#272D35] pb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">{appointment.callerName}</h1>
            <p className="text-xs text-[#8B949E]">Service: {appointment.service}</p>
          </div>

          <div className="px-4 py-2 rounded-xl bg-[#2DD4BF]/10 border border-[#2DD4BF]/30 text-right">
            <span className="text-[10px] font-mono text-[#8B949E] uppercase block">
              Confirmation
            </span>
            <span className="text-sm font-bold text-[#2DD4BF]">{appointment.status}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-[#0F1216] border border-[#272D35] space-y-1">
            <span className="text-[#8B949E] uppercase font-mono text-[10px]">Start Time</span>
            <p className="text-white font-semibold text-sm">
              {new Date(appointment.startTime).toLocaleString()}
            </p>
            <p className="text-[#8B949E]">Timezone: {appointment.timezone}</p>
          </div>

          <div className="p-4 rounded-xl bg-[#0F1216] border border-[#272D35] space-y-1">
            <span className="text-[#8B949E] uppercase font-mono text-[10px]">End Time</span>
            <p className="text-white font-semibold text-sm">
              {new Date(appointment.endTime).toLocaleString()}
            </p>
            <p className="text-[#8B949E]">Status: {appointment.confirmationStatus}</p>
          </div>
        </div>

        {appointment.call?.summary && (
          <div className="p-4 rounded-xl bg-[#0F1216] border border-[#272D35] space-y-2">
            <h3 className="text-xs font-mono uppercase text-[#8B949E] font-semibold">
              Related Inbound Call Summary
            </h3>
            <p className="text-sm text-[#D4D4D8] leading-relaxed">
              {appointment.call.summary.summary}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
