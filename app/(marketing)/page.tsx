import Link from "next/link";
import { Navbar } from "@/components/ui/navbar";
import {
  Mic,
  Calendar,
  Users,
  PhoneForwarded,
  ShieldCheck,
  Zap,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Bot,
  Layers,
  BarChart3,
  Play,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 px-6 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-teal-500/15 to-electric-600/15 rounded-full blur-3xl -z-10 pointer-events-none"></div>

        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-950/70 border border-teal-800/60 text-teal-300 text-xs font-semibold uppercase tracking-wider shadow-inner">
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span>FIVERR FLAGSHIP PORTFOLIO PROOF • ARSLAN VUZMAL LONE</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
            Configurable AI Voice Receptionist for <span className="bg-gradient-to-r from-teal-400 via-teal-300 to-electric-400 bg-clip-text text-transparent">Inbound Call Automation</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto font-normal leading-relaxed">
            VoxDesk AI answers inbound business calls, answers approved enquiries, qualifies sales leads, checks calendar availability, schedules appointments, and transfers priority calls with full context.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/demo"
              className="w-full sm:w-auto bg-gradient-to-r from-teal-500 to-electric-600 hover:from-teal-600 hover:to-electric-700 text-white font-bold text-base px-8 py-4 rounded-xl shadow-xl shadow-teal-500/25 flex items-center justify-center gap-3 transition-all transform hover:-translate-y-0.5"
            >
              <span>Launch Live Call Console</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              href="/demo/story"
              className="w-full sm:w-auto glass-panel hover:bg-gray-900 text-gray-200 font-semibold text-base px-7 py-4 rounded-xl border border-gray-800 flex items-center justify-center gap-2 transition-all"
            >
              <Play className="w-4 h-4 text-teal-400 fill-teal-400" />
              <span>Watch 1-Min Guided Story</span>
            </Link>
          </div>

          {/* Honest Badges */}
          <div className="pt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-gray-400 font-mono">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-teal-400" /> Multi-Tenant Workspace</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-teal-400" /> 100% Deterministic Demo Mode</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-teal-400" /> AES-256 Encrypted Credentials</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-teal-400" /> Pluggable Telephony Adapters</span>
          </div>
        </div>
      </section>

      {/* 6 Key Client WOW Moments */}
      <section className="py-20 px-6 bg-navy-900/60 border-y border-gray-800/80">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Built for Memorable Client Demonstrations</h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-sm">
              Demonstrate complete operational call automation across six high-impact workflow capabilities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-panel p-6 rounded-2xl border border-gray-800 hover:border-teal-500/40 transition-colors space-y-4">
              <div className="w-12 h-12 rounded-xl bg-teal-950 border border-teal-800 flex items-center justify-center text-teal-400">
                <Mic className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">1. Live Call Console</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Interactive audio waveform visualizer, speaker-separated live transcript, state badges, and turn-by-turn state transitions.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-gray-800 hover:border-teal-500/40 transition-colors space-y-4">
              <div className="w-12 h-12 rounded-xl bg-electric-950 border border-electric-800 flex items-center justify-center text-electric-400">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">2. Appointment Scheduling</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Queries Google Calendar or Cal.com, offers valid non-conflicting slots, obtains explicit confirmation, and dispatches invites.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-gray-800 hover:border-teal-500/40 transition-colors space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">3. BANT Lead Scoring</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Evaluates budget range, project scope, timeline, and decision authority to classify leads into HOT, WARM, REVIEW, or COLD.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-gray-800 hover:border-teal-500/40 transition-colors space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-950 border border-amber-800 flex items-center justify-center text-amber-400">
                <PhoneForwarded className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">4. Human Escalation</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Detects escalation keywords, pauses automation, and creates a context-rich Transfer Briefing for human operators.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-gray-800 hover:border-teal-500/40 transition-colors space-y-4">
              <div className="w-12 h-12 rounded-xl bg-purple-950 border border-purple-800 flex items-center justify-center text-purple-400">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">5. Call Intelligence</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Zod-validated structured summaries, sentiment analysis, urgency detection, and commitment tracking.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-gray-800 hover:border-teal-500/40 transition-colors space-y-4">
              <div className="w-12 h-12 rounded-xl bg-teal-950 border border-teal-800 flex items-center justify-center text-teal-400">
                <Play className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">6. 1-Minute Guided Story</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Guided 10-step client trajectory demonstrating call intake to appointment booking, lead scoring, and CRM sync.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-800/80 bg-navy-950 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>© 2026 VoxDesk AI. Developed by <strong className="text-white">Arslan Vuzmal Lone</strong>.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white">Terms of Service</Link>
            <Link href="/docs" className="hover:text-white">API Reference</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
