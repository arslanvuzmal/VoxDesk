import { Navbar } from '@/components/ui/navbar';
import {
  Mic,
  Calendar,
  Users,
  PhoneForwarded,
  ShieldCheck,
  Share2,
  BarChart3,
  Bot,
} from 'lucide-react';

export default function FeaturesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-16 space-y-12">
        <div className="text-center space-y-4">
          <span className="px-3 py-1 rounded-full bg-teal-950 text-teal-400 border border-teal-800/60 font-mono text-xs font-semibold">
            PLATFORM CAPABILITIES
          </span>
          <h1 className="text-4xl font-extrabold text-white">Full Feature Specification</h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm">
            VoxDesk AI provides enterprise-grade call automation, calendar scheduling, lead scoring,
            and CRM integration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-panel p-8 rounded-2xl border border-gray-800 space-y-4">
            <Bot className="w-8 h-8 text-teal-400" />
            <h3 className="text-xl font-bold text-white">16-State Server-Enforced Machine</h3>
            <p className="text-sm text-gray-300">
              Combines flexible natural language interpretation with strict state machine guardrails
              to prevent hallucinated appointments or invalid business responses.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-2xl border border-gray-800 space-y-4">
            <Calendar className="w-8 h-8 text-electric-400" />
            <h3 className="text-xl font-bold text-white">Pluggable Calendar Scheduling</h3>
            <p className="text-sm text-gray-300">
              Supports Google Calendar API v3, Cal.com v2, and Demo Calendar. Handles timezone
              conversions, business hours rules, buffer times, and instant confirmations.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-2xl border border-gray-800 space-y-4">
            <Users className="w-8 h-8 text-emerald-400" />
            <h3 className="text-xl font-bold text-white">Lead Qualification & Scoring</h3>
            <p className="text-sm text-gray-300">
              Scoring criteria across Service Fit, Budget, Timeline, Authority, and Urgency.
              Automatically categorizes leads into HOT, WARM, REVIEW, or COLD.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-2xl border border-gray-800 space-y-4">
            <PhoneForwarded className="w-8 h-8 text-amber-400" />
            <h3 className="text-xl font-bold text-white">Human Escalation & Transfer Briefs</h3>
            <p className="text-sm text-gray-300">
              Detects caller frustration or emergency keywords. Generates structured Transfer
              Briefings for human operators before transferring the call.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
