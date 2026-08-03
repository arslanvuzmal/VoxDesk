import Link from "next/link";
import { Navbar } from "@/components/ui/navbar";
import { ArrowRight, Phone, Calendar, Users, PhoneForwarded, CheckCircle2, ShieldCheck, FileText, Layers } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0B0D10] text-[#F4F4F5]">
      <Navbar />

      {/* SECTION 1 — PRODUCT HERO */}
      <section className="pt-16 pb-20 px-6 border-b border-[#272D35]">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Calls answered. Appointments booked. Context preserved.
          </h1>

          <p className="text-lg text-[#D4D4D8] max-w-2xl mx-auto font-normal leading-relaxed">
            VoxDesk helps service businesses handle inbound enquiries, qualify opportunities, schedule appointments and prepare human handoffs from one voice operations workspace.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/demo"
              className="w-full sm:w-auto bg-[#2DD4BF] hover:bg-[#26b8a5] text-[#0B0D10] font-semibold text-sm px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <span>Explore the interactive demo</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/demo/story"
              className="w-full sm:w-auto bg-[#13171C] hover:bg-[#171C22] text-[#F4F4F5] font-medium text-sm px-6 py-3 rounded-lg border border-[#272D35] flex items-center justify-center gap-2 transition-colors"
            >
              <span>View how a call is handled</span>
            </Link>
          </div>

          <p className="text-xs text-[#8B949E] font-mono pt-1">
            Interactive demo using fictional business and caller data.
          </p>
        </div>
      </section>

      {/* SECTION 2 — COMPLETE CALL JOURNEY SEQUENCE */}
      <section className="py-16 px-6 border-b border-[#272D35] bg-[#0F1216]">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="space-y-2 text-center sm:text-left">
            <h2 className="text-2xl font-bold text-white tracking-tight">The Complete Inbound Call Journey</h2>
            <p className="text-sm text-[#8B949E]">How VoxDesk processes inbound calls from initial ring to CRM entry.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-4 rounded-lg bg-[#13171C] border border-[#272D35] space-y-2">
              <span className="text-[#2DD4BF] font-bold block">1. INBOUND CALL</span>
              <p className="text-[#D4D4D8] font-sans text-xs">Caller connects. Verified webhook routes call to designated voice agent.</p>
            </div>
            <div className="p-4 rounded-lg bg-[#13171C] border border-[#272D35] space-y-2">
              <span className="text-[#2DD4BF] font-bold block">2. INTENT & INTAKE</span>
              <p className="text-[#D4D4D8] font-sans text-xs">Agent understands intent, answers approved questions, and collects contact data.</p>
            </div>
            <div className="p-4 rounded-lg bg-[#13171C] border border-[#272D35] space-y-2">
              <span className="text-[#2DD4BF] font-bold block">3. CALENDAR CHECK</span>
              <p className="text-[#D4D4D8] font-sans text-xs">Checks real-time availability and confirms appointment slot with caller.</p>
            </div>
            <div className="p-4 rounded-lg bg-[#13171C] border border-[#272D35] space-y-2">
              <span className="text-[#2DD4BF] font-bold block">4. RECORD & SYNC</span>
              <p className="text-[#D4D4D8] font-sans text-xs">Generates transcript, Zod-validated summary, BANT lead score, and CRM activity.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 — OPERATIONAL OUTCOMES */}
      <section className="py-16 px-6 border-b border-[#272D35]">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white tracking-tight">Core Operations Capabilities</h2>
            <p className="text-sm text-[#8B949E]">Four key outcomes managed automatically by VoxDesk voice receptionists.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-lg bg-[#13171C] border border-[#272D35] space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#171C22] border border-[#272D35] flex items-center justify-center text-[#2DD4BF]">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Appointment Scheduling</h3>
              <p className="text-sm text-[#D4D4D8] leading-relaxed">
                Connects with Google Calendar, Cal.com, or custom scheduling endpoints. Presents valid openings, prevents double booking, and requests caller confirmation before booking.
              </p>
            </div>

            <div className="p-6 rounded-lg bg-[#13171C] border border-[#272D35] space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#171C22] border border-[#272D35] flex items-center justify-center text-[#34D399]">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Lead Qualification & Scoring</h3>
              <p className="text-sm text-[#D4D4D8] leading-relaxed">
                Evaluates service requirements, estimated budget, desired timeline, and decision authority to categorize inbound opportunities as Hot, Warm, Review, or Cold.
              </p>
            </div>

            <div className="p-6 rounded-lg bg-[#13171C] border border-[#272D35] space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#171C22] border border-[#272D35] flex items-center justify-center text-[#FBBF24]">
                <PhoneForwarded className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Human Escalation & Transfer Briefing</h3>
              <p className="text-sm text-[#D4D4D8] leading-relaxed">
                Detects caller dissatisfaction or emergency phrases. Pauses automated handling and generates a structured Transfer Briefing for human staff.
              </p>
            </div>

            <div className="p-6 rounded-lg bg-[#13171C] border border-[#272D35] space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#171C22] border border-[#272D35] flex items-center justify-center text-[#60A5FA]">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Call Records & CRM Synchronization</h3>
              <p className="text-sm text-[#D4D4D8] leading-relaxed">
                Every call produces a speaker-separated transcript, structured summary, sentiment assessment, and action item checklist synced directly to your CRM.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4 — CONTROLS AND SAFEGUARDS */}
      <section className="py-16 px-6 border-b border-[#272D35] bg-[#0F1216]">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white tracking-tight">Built-in Controls & Security Safeguards</h2>
            <p className="text-sm text-[#8B949E]">Server-enforced guardrails that keep your voice receptionists accurate and compliant.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div className="p-5 rounded-lg bg-[#13171C] border border-[#272D35] space-y-2">
              <h4 className="font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2DD4BF]" />
                Approved Knowledge Rules
              </h4>
              <p className="text-xs text-[#8B949E]">
                Agents only answer questions from approved Q&A entries, preventing inaccurate pricing or false commitments.
              </p>
            </div>

            <div className="p-5 rounded-lg bg-[#13171C] border border-[#272D35] space-y-2">
              <h4 className="font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#34D399]" />
                AES-256 Credential Encryption
              </h4>
              <p className="text-xs text-[#8B949E]">
                Provider credentials and sensitive customer information are encrypted at rest and never sent to client bundles.
              </p>
            </div>

            <div className="p-5 rounded-lg bg-[#13171C] border border-[#272D35] space-y-2">
              <h4 className="font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#60A5FA]" />
                Pluggable Provider Adapters
              </h4>
              <p className="text-xs text-[#8B949E]">
                Switch seamlessly between Demo Mode and live telephony providers (Twilio, Vapi, Retell) when ready.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5 — FINAL ACTION */}
      <section className="py-16 px-6 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Explore the complete call workflow</h2>
          <p className="text-sm text-[#D4D4D8]">
            Test live call handling, appointment booking, and lead qualification in the interactive sandbox environment.
          </p>

          <div className="flex items-center justify-center gap-3">
            <Link
              href="/demo"
              className="bg-[#2DD4BF] hover:bg-[#26b8a5] text-[#0B0D10] font-semibold text-sm px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
            >
              <span>Open interactive demo</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/architecture"
              className="bg-[#13171C] hover:bg-[#171C22] text-[#F4F4F5] font-medium text-sm px-6 py-3 rounded-lg border border-[#272D35] transition-colors"
            >
              <span>Technical architecture</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-[#272D35] bg-[#0F1216] mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8B949E]">
          <p>© 2026 VoxDesk AI. Developed by Arslan Vuzmal Lone.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
            <Link href="/terms" className="hover:text-white">Terms</Link>
            <Link href="/docs" className="hover:text-white">API Reference</Link>
            <Link href="/status" className="hover:text-white">Status</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
