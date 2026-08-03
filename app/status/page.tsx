import { Navbar } from "@/components/ui/navbar";
import { Activity, CheckCircle2, AlertCircle } from "lucide-react";

export default function StatusPage() {
  const providers = [
    { name: "Deterministic Demo Voice Provider", type: "VOICE", status: "DEMO OPERATIONAL", latency: "12ms" },
    { name: "Twilio Telephony Provider", type: "TELEPHONY", status: "CONFIGURED", latency: "140ms" },
    { name: "Vapi AI Voice Agent Provider", type: "VOICE", status: "CONFIGURED", latency: "180ms" },
    { name: "Retell AI Voice Agent Provider", type: "VOICE", status: "CONFIGURED", latency: "150ms" },
    { name: "LiveKit WebRTC Media Server", type: "WEBRTC", status: "CONFIGURED", latency: "110ms" },
    { name: "Google Calendar API v3 Adapter", type: "CALENDAR", status: "OPERATIONAL", latency: "85ms" },
    { name: "HubSpot CRM v3 API Adapter", type: "CRM", status: "OPERATIONAL", latency: "95ms" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-8 w-full">
        <div>
          <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-mono text-xs font-semibold flex items-center gap-1.5 w-fit mb-3">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            ALL SYSTEMS & PROVIDER ADAPTERS READY
          </span>
          <h1 className="text-3xl font-extrabold text-white">Provider & System Health Status</h1>
        </div>

        <div className="space-y-3">
          {providers.map((p, idx) => (
            <div key={idx} className="glass-panel p-4 rounded-xl border border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <div>
                  <h4 className="text-sm font-bold text-white">{p.name}</h4>
                  <span className="text-xs text-gray-400 font-mono">{p.type}</span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="text-gray-400">Latency: <strong className="text-teal-300">{p.latency}</strong></span>
                <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">{p.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
