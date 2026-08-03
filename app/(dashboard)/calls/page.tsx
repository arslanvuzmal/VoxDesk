import Link from "next/link";
import { PhoneCall, Clock, CheckCircle2, ArrowRight } from "lucide-react";

export default function CallsPage() {
  const calls = [
    {
      id: "call-demo-001",
      agent: "Maya — Reception",
      caller: "Sarah Miller",
      number: "+1 (555) 019-2834",
      duration: "2m 00s",
      outcome: "APPOINTMENT_SCHEDULED",
      category: "HOT",
      score: 85,
      date: "2026-08-03 12:10 PM",
    },
    {
      id: "call-demo-002",
      agent: "Alex — Lead Qual",
      caller: "Daniel Brooks",
      number: "+1 (555) 014-9921",
      duration: "1m 35s",
      outcome: "APPOINTMENT_RESCHEDULED",
      category: "WARM",
      score: 65,
      date: "2026-08-03 11:15 AM",
    },
    {
      id: "call-demo-003",
      agent: "Maya — Reception",
      caller: "Priya Shah",
      number: "+1 (555) 018-4490",
      duration: "2m 30s",
      outcome: "LEAD_QUALIFIED",
      category: "HOT",
      score: 92,
      date: "2026-08-03 10:00 AM",
    },
    {
      id: "call-demo-004",
      agent: "Maya — Reception",
      caller: "Michael Chen",
      number: "+1 (555) 012-7788",
      duration: "0m 45s",
      outcome: "ESCALATED_HUMAN",
      category: "REVIEW",
      score: 40,
      date: "2026-08-03 08:30 AM",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Call History</h1>
        <p className="text-sm text-gray-400">
          Complete log of all inbound call sessions, transcripts, and outcomes.
        </p>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
        <div className="space-y-3">
          {calls.map((c) => (
            <div
              key={c.id}
              className="p-4 rounded-xl bg-gray-950 border border-gray-900 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-teal-950 border border-teal-800 flex items-center justify-center text-teal-400">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    {c.caller}{" "}
                    <span className="text-xs font-normal text-gray-400">
                      ({c.number})
                    </span>
                  </h4>
                  <p className="text-gray-400 mt-0.5">
                    {c.date} • Agent:{" "}
                    <strong className="text-white">{c.agent}</strong> •
                    Duration: {c.duration}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span
                  className={`px-2.5 py-1 rounded font-bold font-mono ${c.category === "HOT" ? "bg-emerald-950 text-emerald-400 border border-emerald-800" : "bg-teal-950 text-teal-300 border border-teal-800"}`}
                >
                  {c.category} ({c.score}/100)
                </span>
                <Link
                  href={`/dashboard/calls/${c.id}`}
                  className="bg-gray-900 hover:bg-gray-800 text-white px-3 py-2 rounded-lg font-semibold border border-gray-800 flex items-center gap-1"
                >
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
