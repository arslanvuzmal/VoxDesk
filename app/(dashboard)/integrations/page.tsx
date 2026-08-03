import { Share2, Calendar, Database, CheckCircle2 } from "lucide-react";

export default function IntegrationsPage() {
  const integrations = [
    { name: "Google Calendar API v3", category: "CALENDAR", status: "CONNECTED", details: "Auto-syncs confirmed appointment slots" },
    { name: "Cal.com Scheduling v2", category: "CALENDAR", status: "READY", details: "Open-source calendar booking integration" },
    { name: "HubSpot CRM v3", category: "CRM", status: "CONNECTED", details: "Creates contacts & logs call engagement timelines" },
    { name: "Generic HMAC Webhook", category: "WEBHOOK", status: "ACTIVE", details: "Signed JSON payload dispatch to custom backends" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">CRM & Webhook Integrations</h1>
        <p className="text-sm text-gray-400">External connections for calendar booking, CRM record updates, and custom webhooks.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {integrations.map((i, idx) => (
          <div key={idx} className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Share2 className="w-5 h-5 text-teal-400" />
                <h3 className="text-base font-bold text-white">{i.name}</h3>
              </div>
              <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-mono font-bold">
                {i.status}
              </span>
            </div>
            <p className="text-xs text-gray-300">{i.details}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
