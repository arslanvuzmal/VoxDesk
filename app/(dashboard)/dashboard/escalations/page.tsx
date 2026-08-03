import { PhoneForwarded, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function EscalationsPage() {
  const escalations = [
    {
      id: "esc-01",
      caller: "Michael Chen",
      number: "+1 (555) 012-7788",
      reason: "Urgent legal court filing notice requested human operator",
      urgency: "CRITICAL",
      time: "4 hours ago",
      status: "CALLBACK_CREATED",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">
          Human Escalations & Transfer Briefs
        </h1>
        <p className="text-sm text-gray-400">
          Context-rich handoff briefings generated when callers request a human
          or trigger urgent keywords.
        </p>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
        <div className="space-y-3">
          {escalations.map((e) => (
            <div
              key={e.id}
              className="p-5 rounded-xl bg-gray-950 border border-gray-900 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      {e.caller}{" "}
                      <span className="text-xs text-gray-400">
                        ({e.number})
                      </span>
                    </h4>
                    <span className="text-xs text-gray-400">{e.time}</span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded bg-red-950 text-red-300 border border-red-800 font-bold font-mono text-xs">
                  {e.urgency}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-gray-900 text-xs text-gray-200 border border-gray-800">
                <strong className="text-amber-400 block mb-1">
                  TRIGGER REASON & TRANSFER BRIEF:
                </strong>
                <p>&quot;{e.reason}&quot;</p>
                <p className="text-gray-400 mt-2 font-mono">
                  Recommended Action: Duty attorney to perform direct phone
                  callback within 15 minutes.
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
