"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/ui/navbar";
import { RealVoiceConsole } from "@/components/calls/real-voice-console";
import {
  Mic,
  ArrowRight,
  Calendar,
  Users,
  PhoneForwarded,
  HelpCircle,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

export default function DemoPage() {
  const [selectedScenario, setSelectedScenario] = useState<
    "BOOKING" | "QUALIFICATION" | "ESCALATION" | "ROUTINE"
  >("BOOKING");
  const [demoMode, setDemoMode] = useState<"VOICE" | "GUIDED">("VOICE");
  const [hasConsented, setHasConsented] = useState(false);
  const [activeSession, setActiveSession] = useState(false);

  const startDemoSession = async () => {
    if (!hasConsented) return;
    try {
      await fetch("/api/demo/session/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario: selectedScenario }),
      });
      setActiveSession(true);
    } catch {
      setActiveSession(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0D10] text-[#F4F4F5]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-8">
        {!activeSession ? (
          <div className="max-w-4xl mx-auto space-y-8 py-6">
            {/* Header */}
            <div className="text-center space-y-3">
              <span className="px-3 py-1 rounded-full bg-[#171C22] text-[#2DD4BF] font-mono text-xs border border-[#272D35]">
                Interactive Voice Sandbox
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Try the VoxDesk voice receptionist
              </h1>
              <p className="text-sm text-[#D4D4D8] max-w-xl mx-auto">
                Choose a business problem, speak naturally and watch VoxDesk
                turn the conversation into an appointment, qualified enquiry or
                human handoff.
              </p>
            </div>

            {/* 4 Scenario Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card 1: Booking */}
              <div
                onClick={() => setSelectedScenario("BOOKING")}
                className={`p-5 rounded-lg border cursor-pointer transition-all ${
                  selectedScenario === "BOOKING"
                    ? "bg-[#171C22] border-[#2DD4BF] shadow-lg shadow-[#2DD4BF]/5"
                    : "bg-[#13171C] border-[#272D35] hover:border-[#8B949E]"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded bg-[#2DD4BF]/10 border border-[#2DD4BF]/20 flex items-center justify-center text-[#2DD4BF]">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-mono text-[#8B949E]">
                    Max 3 mins
                  </span>
                </div>
                <h3 className="font-bold text-white text-base">
                  1. Book a Consultation
                </h3>
                <p className="text-xs text-[#D4D4D8] mt-1">
                  <strong>Problem:</strong> After-hours callers cannot book
                  legal consultation slots.
                </p>
                <p className="text-xs text-[#8B949E] mt-1">
                  <strong>Outcome:</strong> Checks Google Calendar availability
                  & confirms slot.
                </p>
              </div>

              {/* Card 2: Qualification */}
              <div
                onClick={() => setSelectedScenario("QUALIFICATION")}
                className={`p-5 rounded-lg border cursor-pointer transition-all ${
                  selectedScenario === "QUALIFICATION"
                    ? "bg-[#171C22] border-[#2DD4BF] shadow-lg shadow-[#2DD4BF]/5"
                    : "bg-[#13171C] border-[#272D35] hover:border-[#8B949E]"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded bg-[#34D399]/10 border border-[#34D399]/20 flex items-center justify-center text-[#34D399]">
                    <Users className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-mono text-[#8B949E]">
                    Max 3 mins
                  </span>
                </div>
                <h3 className="font-bold text-white text-base">
                  2. Qualify a Sales Enquiry
                </h3>
                <p className="text-xs text-[#D4D4D8] mt-1">
                  <strong>Problem:</strong> Manual lead intake takes too much
                  staff time.
                </p>
                <p className="text-xs text-[#8B949E] mt-1">
                  <strong>Outcome:</strong> Evaluates BANT budget, timeline &
                  outputs HOT score.
                </p>
              </div>

              {/* Card 3: Escalation */}
              <div
                onClick={() => setSelectedScenario("ESCALATION")}
                className={`p-5 rounded-lg border cursor-pointer transition-all ${
                  selectedScenario === "ESCALATION"
                    ? "bg-[#171C22] border-[#2DD4BF] shadow-lg shadow-[#2DD4BF]/5"
                    : "bg-[#13171C] border-[#272D35] hover:border-[#8B949E]"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded bg-[#FBBF24]/10 border border-[#FBBF24]/20 flex items-center justify-center text-[#FBBF24]">
                    <PhoneForwarded className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-mono text-[#8B949E]">
                    Max 3 mins
                  </span>
                </div>
                <h3 className="font-bold text-white text-base">
                  3. Request a Human Handoff
                </h3>
                <p className="text-xs text-[#D4D4D8] mt-1">
                  <strong>Problem:</strong> Urgent callers trapped in automated
                  phone trees.
                </p>
                <p className="text-xs text-[#8B949E] mt-1">
                  <strong>Outcome:</strong> Detects urgency & generates
                  structured Transfer Brief.
                </p>
              </div>

              {/* Card 4: Routine Question */}
              <div
                onClick={() => setSelectedScenario("ROUTINE")}
                className={`p-5 rounded-lg border cursor-pointer transition-all ${
                  selectedScenario === "ROUTINE"
                    ? "bg-[#171C22] border-[#2DD4BF] shadow-lg shadow-[#2DD4BF]/5"
                    : "bg-[#13171C] border-[#272D35] hover:border-[#8B949E]"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded bg-[#60A5FA]/10 border border-[#60A5FA]/20 flex items-center justify-center text-[#60A5FA]">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-mono text-[#8B949E]">
                    Max 2 mins
                  </span>
                </div>
                <h3 className="font-bold text-white text-base">
                  4. Ask a Routine Question
                </h3>
                <p className="text-xs text-[#D4D4D8] mt-1">
                  <strong>Problem:</strong> Staff repeatedly answering basic
                  business questions.
                </p>
                <p className="text-xs text-[#8B949E] mt-1">
                  <strong>Outcome:</strong> Answers from approved knowledge
                  base.
                </p>
              </div>
            </div>

            {/* Disclosures & Consent Box */}
            <div className="p-4 rounded-lg bg-[#13171C] border border-[#272D35] space-y-3 text-xs">
              <div className="flex items-center gap-2 text-white font-bold">
                <ShieldCheck className="w-4 h-4 text-[#2DD4BF]" />
                <span>
                  Sandbox Security & Microphone Permission Disclosures
                </span>
              </div>
              <ul className="space-y-1 text-[#8B949E]">
                <li>
                  • Microphone audio is processed only for this demonstration
                  and is not retained by VoxDesk.
                </li>
                <li>
                  • The demonstration uses fictional business data
                  (&quot;Northstar Legal Consultations&quot;) and does not place
                  real phone calls.
                </li>
                <li>
                  • Calls are limited to a maximum of 3 minutes and 6
                  conversational turns.
                </li>
              </ul>

              <label className="flex items-center gap-2 pt-2 text-[#D4D4D8] cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasConsented}
                  onChange={(e) => setHasConsented(e.target.checked)}
                  className="rounded border-[#272D35] bg-[#0F1216] text-[#2DD4BF] focus:ring-0"
                />
                <span>
                  I understand the disclosures and agree to grant temporary
                  microphone access.
                </span>
              </label>
            </div>

            {/* Start Button */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                disabled={!hasConsented}
                onClick={startDemoSession}
                className="w-full sm:w-auto bg-[#2DD4BF] hover:bg-[#26b8a5] text-[#0B0D10] font-bold text-sm px-8 py-3.5 rounded-lg flex items-center justify-center gap-2 disabled:opacity-40 transition-colors"
              >
                <Mic className="w-4 h-4" />
                <span>Start Short Voice Demo</span>
              </button>

              <Link
                href="/demo/story"
                className="w-full sm:w-auto bg-[#13171C] hover:bg-[#171C22] text-[#D4D4D8] font-medium text-xs px-6 py-3.5 rounded-lg border border-[#272D35] text-center"
              >
                Guided no-microphone walkthrough
              </Link>
            </div>
          </div>
        ) : (
          <RealVoiceConsole
            scenario={selectedScenario}
            onResetScenario={() => setActiveSession(false)}
          />
        )}
      </main>
    </div>
  );
}
