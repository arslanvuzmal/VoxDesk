"use client";

import { useState } from "react";
import {
  Play,
  CheckCircle2,
  Calendar,
  Users,
  Share2,
  FileText,
  BarChart3,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

const STORY_STEPS = [
  {
    step: 1,
    title: "1. Incoming Call Ringing",
    description: "Inbound call received from Sarah Miller (+1 555-019-2834). Telephony webhook verifies signature and routes to Maya receptionist.",
    icon: Phone,
    stateBadge: "RINGING",
  },
  {
    step: 2,
    title: "2. Custom Business Greeting",
    description: "Maya answers within 150ms: 'Welcome to Northstar Legal Consultations! My name is Maya. How can I assist you today?'",
    icon: Sparkles,
    stateBadge: "GREETING",
  },
  {
    step: 3,
    title: "3. Caller Request Intake",
    description: "Sarah requests a commercial contract review consultation for next Tuesday afternoon.",
    icon: FileText,
    stateBadge: "IDENTIFYING_INTENT",
  },
  {
    step: 4,
    title: "4. Information Collection",
    description: "Agent collects caller name, email, budget range ($5,000 - $10,000), and timeline requirement.",
    icon: Users,
    stateBadge: "COLLECTING_CONTACT",
  },
  {
    step: 5,
    title: "5. Calendar Tool Query",
    description: "Agent invokes Google Calendar / Demo Calendar adapter to check business-hours availability.",
    icon: Calendar,
    stateBadge: "CHECKING_AVAILABILITY",
  },
  {
    step: 6,
    title: "6. Slot Offerings",
    description: "Agent presents 2 valid non-conflicting slots: Tuesday at 2:00 PM EST and 3:30 PM EST.",
    icon: Calendar,
    stateBadge: "OFFERING_SLOTS",
  },
  {
    step: 7,
    title: "7. Explicit Appointment Confirmation",
    description: "Sarah selects 2:00 PM EST. Agent obtains explicit confirmation and locks appointment in calendar.",
    icon: CheckCircle2,
    stateBadge: "CONFIRMING_APPOINTMENT",
  },
  {
    step: 8,
    title: "8. CRM Contact & Activity Sync",
    description: "Contact created in HubSpot CRM & generic webhook dispatches appointment event.",
    icon: Share2,
    stateBadge: "CRM_SYNCED",
  },
  {
    step: 9,
    title: "9. Call Intelligence & Summary",
    description: "Speaker-separated transcript, Zod structured summary, and HOT lead scoring (85/100) persisted.",
    icon: FileText,
    stateBadge: "SUMMARISING",
  },
  {
    step: 10,
    title: "10. Analytics Metrics Update",
    description: "Overview dashboard metrics increment: Total Calls, Completion Rate 100%, Appointments Booked +1.",
    icon: BarChart3,
    stateBadge: "COMPLETED",
  },
];

import { Phone } from "lucide-react";

export function GuidedClientStory() {
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  const currentStep = STORY_STEPS[activeStepIndex];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-teal-800/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full bg-teal-950 text-teal-400 border border-teal-800/60 font-mono text-xs font-semibold">
            WOW MOMENT 6 — 1-MINUTE CLIENT DEMO
          </span>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-2">Guided Client Story Walkthrough</h1>
          <p className="text-sm text-gray-400 mt-1">
            Follow the complete 10-step inbound call lifecycle from ringing call to appointment booking, lead scoring, and CRM synchronization.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveStepIndex((prev) => (prev < STORY_STEPS.length - 1 ? prev + 1 : 0))}
            className="bg-gradient-to-r from-teal-500 to-electric-600 hover:from-teal-600 hover:to-electric-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-lg flex items-center gap-2 transition-all"
          >
            <span>Next Step ({activeStepIndex + 1}/10)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Timeline Steps Bar */}
      <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
        {STORY_STEPS.map((s, idx) => (
          <button
            key={s.step}
            onClick={() => setActiveStepIndex(idx)}
            className={`p-2.5 rounded-xl text-center border transition-all ${
              idx === activeStepIndex
                ? "bg-teal-950 border-teal-400 text-white font-bold shadow-md shadow-teal-500/20"
                : idx < activeStepIndex
                ? "bg-gray-900 border-teal-900/60 text-teal-400"
                : "bg-gray-950 border-gray-800 text-gray-400"
            }`}
          >
            <span className="text-xs font-mono font-bold block">{s.step}</span>
          </button>
        ))}
      </div>

      {/* Active Step Details Panel */}
      <div className="glass-panel p-8 rounded-2xl border border-gray-800 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-teal-950 border border-teal-800 flex items-center justify-center text-teal-400 shadow-inner">
              <currentStep.icon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{currentStep.title}</h2>
              <span className="text-xs font-mono font-semibold text-teal-400 px-2 py-0.5 rounded bg-teal-950 border border-teal-800/60">
                STATE: {currentStep.stateBadge}
              </span>
            </div>
          </div>
        </div>

        <p className="text-base text-gray-200 leading-relaxed p-4 rounded-xl bg-gray-950/80 border border-gray-900">
          {currentStep.description}
        </p>

        {/* Highlight Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-4 rounded-xl bg-gray-900 border border-gray-800">
            <span className="text-gray-400 block mb-1">CALLER RECORD</span>
            <span className="font-bold text-white">Sarah Miller (+1 555-019-2834)</span>
          </div>
          <div className="p-4 rounded-xl bg-gray-900 border border-gray-800">
            <span className="text-gray-400 block mb-1">QUALIFICATION CATEGORY</span>
            <span className="font-bold text-emerald-400">HOT (Score: 85/100)</span>
          </div>
          <div className="p-4 rounded-xl bg-gray-900 border border-gray-800">
            <span className="text-gray-400 block mb-1">CALENDAR STATUS</span>
            <span className="font-bold text-teal-300">Tuesday 2:00 PM EST Confirmed</span>
          </div>
        </div>
      </div>
    </div>
  );
}
