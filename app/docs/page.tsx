import { Navbar } from "@/components/ui/navbar";
import { BookOpen, Code2, Terminal, Shield } from "lucide-react";

export default function DocsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-8 w-full">
        <div>
          <h1 className="text-3xl font-extrabold text-white">VoxDesk AI Documentation & API Reference</h1>
          <p className="text-sm text-gray-400 mt-1">Complete technical specifications, API contracts, webhook payloads, and deployment guides.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-3">
            <Code2 className="w-6 h-6 text-teal-400" />
            <h3 className="text-lg font-bold text-white">POST /api/voice/start</h3>
            <p className="text-xs text-gray-400">Initiates a call session with specified provider, agent, and scenario parameters.</p>
            <pre className="p-3 rounded-lg bg-gray-950 text-xs font-mono text-teal-300 overflow-x-auto border border-gray-900">
{`{
  "workspaceId": "northstar-legal-ws",
  "agentId": "agent-maya",
  "callerNumber": "+15550192834",
  "provider": "DEMO"
}`}
            </pre>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-3">
            <Terminal className="w-6 h-6 text-electric-400" />
            <h3 className="text-lg font-bold text-white">POST /api/calendar/book</h3>
            <p className="text-xs text-gray-400">Creates a confirmed calendar appointment with caller details.</p>
            <pre className="p-3 rounded-lg bg-gray-950 text-xs font-mono text-electric-300 overflow-x-auto border border-gray-900">
{`{
  "callerName": "Sarah Miller",
  "service": "Legal Consultation",
  "startTime": "2026-08-04T14:00:00Z",
  "timezone": "America/New_York"
}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
