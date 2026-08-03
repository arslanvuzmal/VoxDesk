import Link from "next/link";
import { Navbar } from "@/components/ui/navbar";
import { CheckCircle2, Shield, Info, ArrowLeft } from "lucide-react";

export default function SystemStatusPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0B0D10] text-[#F4F4F5]">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-[#272D35] pb-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              System Status & Environment Health
            </h1>
            <p className="text-xs text-[#8B949E]">
              Current operational state of system components and provider
              connections.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="text-xs text-[#2DD4BF] hover:underline flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
        </div>

        {/* Current Environment Banner */}
        <div className="p-4 rounded-lg bg-[#13171C] border border-[#272D35] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-[#60A5FA]"></div>
            <div>
              <span className="text-sm font-bold text-white">
                Environment Mode: Demo Sandbox
              </span>
              <p className="text-xs text-[#8B949E]">
                Operating with deterministic Demo Voice Provider & fictional
                business data.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded bg-[#171C22] text-[#60A5FA] text-xs font-mono border border-[#272D35]">
            Demo Active
          </span>
        </div>

        {/* System Components Table */}
        <div className="p-4 rounded-lg bg-[#13171C] border border-[#272D35] space-y-4">
          <h2 className="text-sm font-bold text-white">
            Component Health Checks
          </h2>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-3 rounded bg-[#171C22] border border-[#272D35]">
              <div>
                <span className="font-semibold text-white block">
                  16-State Conversation Engine
                </span>
                <span className="text-[#8B949E] text-[11px]">
                  Server-enforced state machine & Zod summary validation
                </span>
              </div>
              <span className="text-[#34D399] font-mono flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Healthy
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded bg-[#171C22] border border-[#272D35]">
              <div>
                <span className="font-semibold text-white block">
                  Demo Telephony Adapter
                </span>
                <span className="text-[#8B949E] text-[11px]">
                  Deterministic browser/server call simulation
                </span>
              </div>
              <span className="text-[#34D399] font-mono flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Healthy
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded bg-[#171C22] border border-[#272D35]">
              <div>
                <span className="font-semibold text-white block">
                  Prisma PostgreSQL Database
                </span>
                <span className="text-[#8B949E] text-[11px]">
                  22 relational schema models & workspace scoping
                </span>
              </div>
              <span className="text-[#34D399] font-mono flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Healthy
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded bg-[#171C22] border border-[#272D35]">
              <div>
                <span className="font-semibold text-white block">
                  Twilio / Vapi / LiveKit Adapters
                </span>
                <span className="text-[#8B949E] text-[11px]">
                  Live PSTN telephony connections
                </span>
              </div>
              <span className="text-[#8B949E] font-mono">
                Not Configured (Demo Mode)
              </span>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-6 px-6 border-t border-[#272D35] bg-[#0F1216] mt-auto text-xs text-[#8B949E] text-center">
        © 2026 VoxDesk AI. Operations workspace managed by Arslan Vuzmal Lone.
      </footer>
    </div>
  );
}
