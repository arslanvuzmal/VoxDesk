"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/ui/navbar";
import { ElevenLabsVoiceConsole } from "@/components/calls/elevenlabs-voice-console";
import { BusinessOutcomeReceipt } from "@/components/demo/business-outcome-receipt";
import { startDemoSession, DemoApiError } from "@/lib/client/demo-api";
import { listOrganizationPresets } from "@/lib/organization/registry";
import {
  Mic,
  Calendar,
  Users,
  PhoneForwarded,
  HelpCircle,
  AlertTriangle,
  Briefcase,
  Sparkles,
} from "lucide-react";

export default function DemoPage() {
  const presets = listOrganizationPresets();
  const [selectedPresetKey, setSelectedPresetKey] = useState<string>("LEGAL");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en-US");
  const [selectedScenario, setSelectedScenario] = useState<
    "BOOKING" | "QUALIFICATION" | "ESCALATION" | "ROUTINE"
  >("BOOKING");
  const [hasConsented, setHasConsented] = useState(true);
  const [activeSession, setActiveSession] = useState(false);
  const [isStartingSession, setIsStartingSession] = useState(false);
  const [sessionStartError, setSessionStartError] = useState<{
    message: string;
    code?: string;
    guidedDemoUrl?: string;
  } | null>(null);

  const [callEndedResult, setCallEndedResult] = useState<any | null>(null);

  const activeProfile =
    presets.find((p) => p.presetKey === selectedPresetKey) || presets[0];

  const handleStartSession = async () => {
    if (!hasConsented || isStartingSession) return;
    setIsStartingSession(true);
    setSessionStartError(null);
    setCallEndedResult(null);

    try {
      const res = await startDemoSession(selectedScenario, {
        presetKey: selectedPresetKey,
        language: selectedLanguage,
      });
      if (res.success && res.sessionId) {
        setActiveSession(true);
      } else {
        setSessionStartError({
          message: "Could not initialize voice session.",
        });
      }
    } catch (err: any) {
      if (err instanceof DemoApiError) {
        setSessionStartError({
          message: err.message,
          code: err.code,
          guidedDemoUrl: err.guidedDemoUrl,
        });
      } else {
        setSessionStartError({
          message: "Connection error: Unable to start live demo session.",
        });
      }
      setActiveSession(false);
    } finally {
      setIsStartingSession(false);
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
              <span className="px-3 py-1 rounded-full bg-[#171C22] text-[#2DD4BF] font-mono text-xs border border-[#272D35] inline-flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Official ElevenLabs Realtime Voice Sandbox
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Try the VoxDesk Voice Receptionist
              </h1>
              <p className="text-sm text-[#D4D4D8] max-w-xl mx-auto">
                Select your industry profile, language, and caller scenario to
                test real-time speech recognition, policy enforcement, lead
                scoring, and instant CRM record creation.
              </p>
            </div>

            {/* Error Message */}
            {sessionStartError && (
              <div className="p-4 rounded-xl bg-[#991B1B]/10 border border-[#991B1B]/40 space-y-3">
                <div className="flex items-start gap-3 text-xs text-[#EF4444]">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold text-white">
                      Session Start Notice
                    </p>
                    <p>{sessionStartError.message}</p>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 1: ORGANIZATION PRESET SELECTION */}
            <div className="space-y-3">
              <h3 className="text-xs font-mono uppercase text-[#8B949E] tracking-wider font-semibold">
                1. Select Industry Organization Profile
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {presets.map((p) => (
                  <button
                    key={p.presetKey}
                    type="button"
                    onClick={() => setSelectedPresetKey(p.presetKey)}
                    className={`p-4 rounded-xl border text-left transition-all space-y-2 ${
                      selectedPresetKey === p.presetKey
                        ? "bg-[#13171C] border-[#2DD4BF] shadow-lg shadow-[#2DD4BF]/5"
                        : "bg-[#0F1216] border-[#272D35] hover:border-[#8B949E]/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white text-sm">
                        {p.name}
                      </span>
                      <Briefcase
                        className={`w-4 h-4 ${selectedPresetKey === p.presetKey ? "text-[#2DD4BF]" : "text-[#8B949E]"}`}
                      />
                    </div>
                    <p className="text-xs text-[#8B949E] line-clamp-2">
                      {p.tagline}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* STEP 2: LANGUAGE SELECTION */}
            <div className="space-y-3">
              <h3 className="text-xs font-mono uppercase text-[#8B949E] tracking-wider font-semibold">
                2. Select Spoken Conversation Language
              </h3>

              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedLanguage("en-US")}
                  className={`p-3 rounded-xl border text-center text-xs font-semibold transition-all ${
                    selectedLanguage === "en-US"
                      ? "bg-[#13171C] border-[#2DD4BF] text-[#2DD4BF]"
                      : "bg-[#0F1216] border-[#272D35] text-[#D4D4D8]"
                  }`}
                >
                  🇬🇧 English (en-US)
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedLanguage("ur-PK")}
                  className={`p-3 rounded-xl border text-center text-xs font-semibold transition-all ${
                    selectedLanguage === "ur-PK"
                      ? "bg-[#13171C] border-[#2DD4BF] text-[#2DD4BF]"
                      : "bg-[#0F1216] border-[#272D35] text-[#D4D4D8]"
                  }`}
                >
                  🇵🇰 Urdu (اردو)
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedLanguage("es-ES")}
                  className={`p-3 rounded-xl border text-center text-xs font-semibold transition-all ${
                    selectedLanguage === "es-ES"
                      ? "bg-[#13171C] border-[#2DD4BF] text-[#2DD4BF]"
                      : "bg-[#0F1216] border-[#272D35] text-[#D4D4D8]"
                  }`}
                >
                  🇪🇸 Spanish (Español)
                </button>
              </div>
            </div>

            {/* STEP 3: CALLER SCENARIO SELECTION */}
            <div className="space-y-3">
              <h3 className="text-xs font-mono uppercase text-[#8B949E] tracking-wider font-semibold">
                3. Select Caller Objective & Scenario
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedScenario("BOOKING")}
                  className={`p-4 rounded-xl border text-left space-y-1 transition-all ${
                    selectedScenario === "BOOKING"
                      ? "bg-[#13171C] border-[#2DD4BF]"
                      : "bg-[#0F1216] border-[#272D35]"
                  }`}
                >
                  <div className="flex items-center gap-2 text-white font-semibold text-sm">
                    <Calendar className="w-4 h-4 text-[#2DD4BF]" />
                    <span>Appointment Scheduling</span>
                  </div>
                  <p className="text-xs text-[#8B949E]">
                    Caller requests a consultation, checks available slots, and
                    confirms an appointment.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedScenario("QUALIFICATION")}
                  className={`p-4 rounded-xl border text-left space-y-1 transition-all ${
                    selectedScenario === "QUALIFICATION"
                      ? "bg-[#13171C] border-[#2DD4BF]"
                      : "bg-[#0F1216] border-[#272D35]"
                  }`}
                >
                  <div className="flex items-center gap-2 text-white font-semibold text-sm">
                    <Users className="w-4 h-4 text-[#2DD4BF]" />
                    <span>Lead Intake & BANT Qualification</span>
                  </div>
                  <p className="text-xs text-[#8B949E]">
                    Caller describes their needs, budget, and timeline for BANT
                    scoring.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedScenario("ESCALATION")}
                  className={`p-4 rounded-xl border text-left space-y-1 transition-all ${
                    selectedScenario === "ESCALATION"
                      ? "bg-[#13171C] border-[#2DD4BF]"
                      : "bg-[#0F1216] border-[#272D35]"
                  }`}
                >
                  <div className="flex items-center gap-2 text-white font-semibold text-sm">
                    <PhoneForwarded className="w-4 h-4 text-[#2DD4BF]" />
                    <span>Urgent Human Escalation</span>
                  </div>
                  <p className="text-xs text-[#8B949E]">
                    High-urgency request triggers policy rule and generates
                    transfer brief.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedScenario("ROUTINE")}
                  className={`p-4 rounded-xl border text-left space-y-1 transition-all ${
                    selectedScenario === "ROUTINE"
                      ? "bg-[#13171C] border-[#2DD4BF]"
                      : "bg-[#0F1216] border-[#272D35]"
                  }`}
                >
                  <div className="flex items-center gap-2 text-white font-semibold text-sm">
                    <HelpCircle className="w-4 h-4 text-[#2DD4BF]" />
                    <span>Approved FAQ Q&A</span>
                  </div>
                  <p className="text-xs text-[#8B949E]">
                    Caller asks questions about hours, fees, insurance, or
                    services.
                  </p>
                </button>
              </div>
            </div>

            {/* STEP 4: CONSENT & LAUNCH */}
            <div className="p-6 rounded-2xl bg-[#13171C] border border-[#272D35] space-y-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasConsented}
                  onChange={(e) => setHasConsented(e.target.checked)}
                  className="mt-1 rounded bg-[#0B0D10] border-[#272D35] text-[#2DD4BF] focus:ring-0"
                />
                <span className="text-xs text-[#D4D4D8] leading-relaxed">
                  I understand this is a live interactive demonstration using
                  fictional business data for{" "}
                  <strong className="text-white">{activeProfile.name}</strong>{" "}
                  in <strong className="text-white">{selectedLanguage}</strong>.
                  My browser microphone will be used for natural speech input.
                </span>
              </label>

              <button
                type="button"
                disabled={!hasConsented || isStartingSession}
                onClick={handleStartSession}
                className="w-full bg-[#2DD4BF] hover:bg-[#26b8a5] disabled:opacity-50 text-[#0B0D10] font-bold text-sm py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#2DD4BF]/10"
              >
                <Mic className="w-4 h-4" />
                <span>
                  {isStartingSession
                    ? "Initializing Voice Agent..."
                    : "Start Live Voice Call"}
                </span>
              </button>
            </div>

            {/* Display After-Call Receipt if available */}
            {callEndedResult && (
              <div className="pt-4">
                <BusinessOutcomeReceipt
                  organizationName={activeProfile.name}
                  industry={activeProfile.industry}
                  callerName={
                    callEndedResult.extractedFields?.fullName || "Sarah Jenkins"
                  }
                  callerPhone={
                    callEndedResult.extractedFields?.contactPhone ||
                    "+1 (555) 234-5678"
                  }
                  language={selectedLanguage}
                  scenario={selectedScenario}
                  summaryText={
                    callEndedResult.spokenReply ||
                    "Call completed with full transcript and lead record saved to CRM database."
                  }
                  extractedFields={callEndedResult.extractedFields || {}}
                  qualificationResult={callEndedResult.qualificationResult}
                  crmRecordIds={callEndedResult.businessAction?.recordIds}
                />
              </div>
            )}
          </div>
        ) : (
          /* ACTIVE LIVE VOICE CONSOLE */
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#272D35] pb-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2DD4BF] animate-pulse" />
                  {activeProfile.name} — Live Call
                </h2>
                <p className="text-xs text-[#8B949E] font-mono">
                  Agent: {activeProfile.voiceIdentity.name} • Language:{" "}
                  {selectedLanguage}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveSession(false)}
                className="px-4 py-2 rounded-lg bg-[#13171C] border border-[#272D35] text-xs text-[#F4F4F5] hover:border-[#8B949E]"
              >
                End Call & Review Outcome
              </button>
            </div>

            <ElevenLabsVoiceConsole
              scenario={selectedScenario}
              presetKey={selectedPresetKey}
              language={selectedLanguage as any}
              organizationProfile={activeProfile}
              onCallEnded={(finalTurnData) => {
                setCallEndedResult(finalTurnData);
                setActiveSession(false);
              }}
            />
          </div>
        )}
      </main>
    </div>
  );
}
