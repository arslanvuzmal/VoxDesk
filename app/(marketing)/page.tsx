import Link from "next/link";
import { Navbar } from "@/components/ui/navbar";
import {
  ArrowRight,
  Phone,
  Calendar,
  Users,
  PhoneForwarded,
  ShieldCheck,
  Globe,
  Briefcase,
  Layers,
  Sparkles,
  UserCheck,
  CheckCircle2,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0B0D10] text-[#F4F4F5]">
      <Navbar />

      {/* HERO SECTION — OUTCOME FIRST */}
      <section className="pt-20 pb-24 px-6 border-b border-[#272D35] relative overflow-hidden bg-gradient-to-b from-[#0F1216] via-[#0B0D10] to-[#0B0D10]">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#13171C] border border-[#272D35] text-xs font-mono text-[#2DD4BF] mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Voice Receptionist & Voice-Operations Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Never lose a valuable enquiry because nobody answered the phone.
          </h1>

          <p className="text-lg sm:text-xl text-[#D4D4D8] max-w-3xl mx-auto font-normal leading-relaxed">
            VoxDesk answers callers immediately, understands their needs,
            qualifies sales opportunities, books appointments, and turns every
            conversation into an action-ready CRM record.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/demo"
              className="w-full sm:w-auto bg-[#2DD4BF] hover:bg-[#26b8a5] text-[#0B0D10] font-bold text-sm px-8 py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#2DD4BF]/10 transition-all"
            >
              <span>Try Interactive Voice Demo</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/demo/story"
              className="w-full sm:w-auto bg-[#13171C] hover:bg-[#171C22] text-[#F4F4F5] font-medium text-sm px-8 py-4 rounded-xl border border-[#272D35] flex items-center justify-center gap-2 transition-colors"
            >
              <span>View Interactive Walkthrough</span>
            </Link>
          </div>

          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-[#8B949E] font-mono">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#2DD4BF]" /> 24/7
              Inbound Answering
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#2DD4BF]" /> English,
              Urdu & Spanish
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#2DD4BF]" /> Automated
              Lead Inbox
            </span>
          </div>
        </div>
      </section>

      {/* SECTION 2 — THE PROBLEM VS VOXDESK SOLUTION */}
      <section className="py-20 px-6 border-b border-[#272D35] bg-[#0F1216]">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Why Service Businesses Lose Revenue On Unanswered Calls
            </h2>
            <p className="text-sm text-[#8B949E] max-w-2xl mx-auto">
              Comparing traditional reception bottlenecks with VoxDesk automated
              voice operations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Traditional Problem */}
            <div className="p-6 rounded-2xl bg-[#13171C]/80 border border-[#991B1B]/40 space-y-4">
              <span className="text-xs font-mono text-[#EF4444] uppercase tracking-wider font-semibold">
                Without VoxDesk (Traditional)
              </span>
              <ul className="space-y-3 text-sm text-[#D4D4D8]">
                <li className="flex items-start gap-2">
                  <span className="text-[#EF4444] font-bold">✕</span>
                  <span>
                    After-hours calls go to voicemail; 80% of callers hang up
                    and call competitors.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#EF4444] font-bold">✕</span>
                  <span>
                    Staff waste 15+ hours/week answering repetitive FAQs about
                    hours, location, and basic pricing.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#EF4444] font-bold">✕</span>
                  <span>
                    Inconsistent lead intake missing essential contact info,
                    budget, and urgency signals.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#EF4444] font-bold">✕</span>
                  <span>
                    Scattered notes require manual data entry into CRM hours or
                    days after the call.
                  </span>
                </li>
              </ul>
            </div>

            {/* VoxDesk Solution */}
            <div className="p-6 rounded-2xl bg-[#13171C]/80 border border-[#2DD4BF]/40 space-y-4">
              <span className="text-xs font-mono text-[#2DD4BF] uppercase tracking-wider font-semibold">
                With VoxDesk AI Voice Operations
              </span>
              <ul className="space-y-3 text-sm text-[#D4D4D8]">
                <li className="flex items-start gap-2">
                  <span className="text-[#2DD4BF] font-bold">✓</span>
                  <span>
                    24/7 Immediate Answering — Zero missed calls, zero voicemail
                    dropoff.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#2DD4BF] font-bold">✓</span>
                  <span>
                    Approved Organizational Knowledge — Answers questions safely
                    without inventing facts.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#2DD4BF] font-bold">✓</span>
                  <span>
                    Dynamic BANT Lead Scoring — Automatically rates leads HOT,
                    WARM, REVIEW, or COLD.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#2DD4BF] font-bold">✓</span>
                  <span>
                    Instant CRM Lead Inbox — Complete transcript, summary, and
                    follow-up priority ready immediately.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 — 5 INDUSTRY PRESETS */}
      <section className="py-20 px-6 border-b border-[#272D35]">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Configured For Your Industry Workflow
            </h2>
            <p className="text-sm text-[#8B949E] max-w-2xl mx-auto">
              VoxDesk adapts intake rules, compliance disclaimers, and
              qualification thresholds per industry profile.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl bg-[#13171C] border border-[#272D35] space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white">
                  Legal Consultation Firm
                </h3>
                <Briefcase className="w-5 h-5 text-[#2DD4BF]" />
              </div>
              <p className="text-xs text-[#8B949E]">
                Northstar Legal — Conflict intake, retainer budget
                qualification, and senior partner calendar booking. Zero legal
                advice compliance guarantee.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#13171C] border border-[#272D35] space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white">
                  Medical & Dental Clinic
                </h3>
                <Users className="w-5 h-5 text-[#2DD4BF]" />
              </div>
              <p className="text-xs text-[#8B949E]">
                Apex Dental — Patient hygiene scheduling, insurance PPO
                verification, and acute pain triage escalation with 911
                redirection safety.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#13171C] border border-[#272D35] space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white">
                  Real-Estate Brokerage
                </h3>
                <PhoneForwarded className="w-5 h-5 text-[#2DD4BF]" />
              </div>
              <p className="text-xs text-[#8B949E]">
                Vanguard Realty — Private showing tour scheduling, pre-approval
                letter verification, and luxury listing seller qualification.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#13171C] border border-[#272D35] space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white">
                  Home Services & HVAC
                </h3>
                <Phone className="w-5 h-5 text-[#2DD4BF]" />
              </div>
              <p className="text-xs text-[#8B949E]">
                ProCraft HVAC & Plumbing — Emergency leak/outage dispatch,
                upfront diagnostic fee explanation, and 24/7 technician arrival
                window booking.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#13171C] border border-[#272D35] space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white">
                  B2B Enterprise Software
                </h3>
                <Layers className="w-5 h-5 text-[#2DD4BF]" />
              </div>
              <p className="text-xs text-[#8B949E]">
                Nexus Global SaaS — Enterprise MQL qualification, SOC2 security
                compliance Q&A, and AE technical discovery demo scheduling.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#13171C] border border-[#272D35] space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white">
                  Multilingual Receptionist
                </h3>
                <Globe className="w-5 h-5 text-[#2DD4BF]" />
              </div>
              <p className="text-xs text-[#8B949E]">
                Seamless multi-language conversations in English, Urdu, and
                Spanish with language-aware STT, LLM reasoning, and TTS voices.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4 — CALL-TO-ACTION */}
      <section className="py-20 px-6 text-center bg-[#0F1216]">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl font-bold text-white tracking-tight">
            Ready to experience an interactive voice agent in action?
          </h2>
          <p className="text-sm text-[#8B949E]">
            Test natural speech recognition, dynamic lead qualification, and
            instant CRM record creation right in your browser.
          </p>
          <div className="pt-2">
            <Link
              href="/demo"
              className="bg-[#2DD4BF] hover:bg-[#26b8a5] text-[#0B0D10] font-bold text-sm px-8 py-4 rounded-xl inline-flex items-center gap-2 transition-all shadow-lg shadow-[#2DD4BF]/10"
            >
              <span>Launch VoxDesk Live Demo</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
