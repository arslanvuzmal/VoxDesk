import { Calendar, CheckCircle2, Clock } from "lucide-react";

export default function AppointmentsPage() {
  const appointments = [
    {
      id: "appt-01",
      caller: "Sarah Miller",
      service: "Initial Legal Consultation",
      time: "Next Tuesday at 2:00 PM EST",
      status: "CONFIRMED",
      provider: "Google Calendar API v3",
    },
    {
      id: "appt-02",
      caller: "Daniel Brooks",
      service: "Contract Strategy Session",
      time: "Next Thursday at 11:00 AM EST",
      status: "RESCHEDULED",
      provider: "Demo Calendar Provider",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Scheduled Appointments</h1>
        <p className="text-sm text-gray-400">All calendar bookings created by AI voice receptionists.</p>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
        <div className="space-y-3">
          {appointments.map((a) => (
            <div key={a.id} className="p-4 rounded-xl bg-gray-950 border border-gray-900 flex items-center justify-between text-xs">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-electric-950 border border-electric-800 flex items-center justify-center text-electric-400">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{a.caller}</h4>
                  <p className="text-gray-400 mt-0.5">{a.service} • <strong className="text-teal-300">{a.time}</strong></p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded bg-gray-900 border border-gray-800 text-gray-400 font-mono text-[11px]">{a.provider}</span>
                <span className="px-3 py-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold font-mono">
                  {a.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
