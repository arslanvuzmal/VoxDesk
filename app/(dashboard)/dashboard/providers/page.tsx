import { Layers, CheckCircle2, AlertCircle } from "lucide-react";

export default function ProvidersPage() {
  const providers = [
    {
      name: "Deterministic Demo Voice Provider",
      type: "VOICE",
      status: "DEMO OPERATIONAL",
      latency: "12ms",
    },
    {
      name: "Twilio Voice Telephony Adapter",
      type: "TELEPHONY",
      status: "CONFIGURED",
      latency: "140ms",
    },
    {
      name: "Vapi AI Voice Agent Adapter",
      type: "VOICE",
      status: "CONFIGURED",
      latency: "180ms",
    },
    {
      name: "Retell AI Voice Agent Adapter",
      type: "VOICE",
      status: "CONFIGURED",
      latency: "150ms",
    },
    {
      name: "LiveKit WebRTC Agent Adapter",
      type: "WEBRTC",
      status: "LIVE OPERATIONAL",
      latency: "45ms",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">
          Voice & Telephony Providers
        </h1>
        <p className="text-sm text-gray-400">
          Pluggable provider connections for voice, speech recognition,
          synthesis, and telephony.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {providers.map((p, idx) => (
          <div
            key={idx}
            className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Layers className="w-6 h-6 text-teal-400" />
                <h3 className="text-base font-bold text-white">{p.name}</h3>
              </div>
              <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-mono font-bold">
                {p.status}
              </span>
            </div>
            <p className="text-xs text-gray-400 font-mono">
              Type: {p.type} • Latency Benchmark:{" "}
              <strong className="text-teal-300">{p.latency}</strong>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
