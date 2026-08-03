import { ShieldAlert, Lock } from "lucide-react";

export default function AuditPage() {
  const auditLogs = [
    { id: "audit-01", action: "VOICE_AGENT_UPDATED", entity: "VoiceAgent (Maya)", user: "Arslan Vuzmal Lone", time: "1 hour ago" },
    { id: "audit-02", action: "APPOINTMENT_CONFIRMED", entity: "Appointment (Sarah Miller)", user: "System (Voice Agent)", time: "2 hours ago" },
    { id: "audit-03", action: "PROVIDER_CREDENTIAL_ENCRYPTED", entity: "ProviderConnection (Google Calendar)", user: "Arslan Vuzmal Lone", time: "1 day ago" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Immutable Security Audit Logs</h1>
        <p className="text-sm text-gray-400">Append-only audit trail capturing all system mutations, credential updates, and agent changes.</p>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
        <div className="space-y-3">
          {auditLogs.map((a) => (
            <div key={a.id} className="p-4 rounded-xl bg-gray-950 border border-gray-900 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-4 h-4 text-teal-400" />
                <div>
                  <span className="font-bold text-teal-300">{a.action}</span>
                  <p className="text-gray-400 mt-0.5">{a.entity} • User: <strong className="text-white">{a.user}</strong></p>
                </div>
              </div>

              <span className="text-gray-400">{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
