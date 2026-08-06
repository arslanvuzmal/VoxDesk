import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { Code2, Terminal } from "lucide-react";

export default function DocsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-8 w-full flex-1">
        <div className="space-y-2 border-b border-[#E2E8F0] pb-6">
          <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">
            VoxDesk Technical Documentation & API Reference
          </h1>
          <p className="text-sm text-[#64748B]">
            System specifications, WebRTC token endpoints, webhook payloads, and calendar integration contracts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="bg-white p-6 rounded-xl border border-[#E2E8F0] space-y-3 shadow-sm">
            <Code2 className="w-5 h-5 text-[#1D4ED8]" />
            <h3 className="text-sm font-bold text-[#0F172A]">
              POST /api/demo/voice-bootstrap
            </h3>
            <p className="text-[#64748B]">
              Issues a server-authorized WebSocket/WebRTC conversation token for ElevenLabs voice sessions.
            </p>
            <pre className="p-3.5 rounded-lg bg-[#F8FAFC] text-xs font-mono text-[#1D4ED8] overflow-x-auto border border-[#E2E8F0]">
              {`{
  "presetKey": "LEGAL",
  "language": "en-US"
}`}
            </pre>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#E2E8F0] space-y-3 shadow-sm">
            <Terminal className="w-5 h-5 text-[#15803D]" />
            <h3 className="text-sm font-bold text-[#0F172A]">
              POST /api/calendar/book
            </h3>
            <p className="text-[#64748B]">
              Creates a confirmed calendar appointment with validated caller details.
            </p>
            <pre className="p-3.5 rounded-lg bg-[#F8FAFC] text-xs font-mono text-[#15803D] overflow-x-auto border border-[#E2E8F0]">
              {`{
  "callerName": "Sarah Miller",
  "service": "Legal Consultation",
  "startTime": "2026-08-08T14:00:00Z",
  "timezone": "America/New_York"
}`}
            </pre>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
