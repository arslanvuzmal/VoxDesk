"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Navbar } from "@/components/ui/navbar";
import { Briefcase, Sparkles, AlertTriangle } from "lucide-react";

// Client-only dynamic import with SSR disabled to prevent WebRTC/WebAudio hydration exceptions
const ElevenLabsVoiceController = dynamic(
  () =>
    import("@/components/calls/elevenlabs-voice-controller").then(
      (mod) => mod.ElevenLabsVoiceController
    ),
  {
    ssr: false,
    loading: () => (
      <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400 font-mono space-y-2 max-w-4xl mx-auto">
        <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping inline-block" />
        <p>Loading ElevenLabs Realtime WebRTC Engine...</p>
      </div>
    ),
  }
);

export default function DemoPage() {
  const [selectedPresetKey, setSelectedPresetKey] = useState<string>("LEGAL");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en-US");
  const [selectionNotice, setSelectionNotice] = useState<string | null>(null);

  const presets = [
    {
      presetKey: "LEGAL",
      name: "Northstar Legal Consultations",
      tagline: "Legal intake, appointment assistance & attorney inquiry routing",
      supported: true,
    },
    {
      presetKey: "HEALTHCARE",
      name: "Aura Health Clinic",
      tagline: "Medical consultation & specialist booking",
      supported: false,
    },
    {
      presetKey: "REAL_ESTATE",
      name: "Meridian Prime Realty",
      tagline: "Property inquiry & tour scheduling",
      supported: false,
    },
    {
      presetKey: "HOME_SERVICES",
      name: "Apex Home Services",
      tagline: "Emergency repair & service dispatch",
      supported: false,
    },
    {
      presetKey: "B2B_SERVICES",
      name: "Cortex AI Enterprise",
      tagline: "B2B software demo & sales intake",
      supported: false,
    },
  ];

  const handleSelectPreset = (key: string, supported: boolean) => {
    if (!supported) {
      setSelectionNotice(
        "Not configured for the live provider yet. Please select Northstar Legal Consultations (English)."
      );
      setSelectedPresetKey("LEGAL");
    } else {
      setSelectionNotice(null);
      setSelectedPresetKey(key);
    }
  };

  const handleSelectLanguage = (lang: string, supported: boolean) => {
    if (!supported) {
      setSelectionNotice(
        "Not configured for the live provider yet. Only English (en-US) is supported in this deployment."
      );
      setSelectedLanguage("en-US");
    } else {
      setSelectionNotice(null);
      setSelectedLanguage(lang);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-8">
        <div className="max-w-4xl mx-auto space-y-8 py-6">
          {/* Header */}
          <div className="text-center space-y-3">
            <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 font-mono text-xs border border-indigo-500/20 inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Official ElevenLabs Realtime Voice Production Sandbox
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Live Voice Agent Sandbox
            </h1>
            <p className="text-sm text-slate-400 max-w-xl mx-auto">
              Test real-time speech conversation over WebRTC powered by ElevenLabs Conversational AI.
            </p>
          </div>

          {selectionNotice && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center space-x-3 text-amber-300 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>{selectionNotice}</span>
            </div>
          )}

          {/* STEP 1: ORGANIZATION PRESET SELECTION */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase text-slate-400 tracking-wider font-semibold">
              1. Select Industry Organization Profile
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {presets.map((p) => {
                const isSelected = selectedPresetKey === p.presetKey;
                return (
                  <button
                    key={p.presetKey}
                    type="button"
                    onClick={() => handleSelectPreset(p.presetKey, p.supported)}
                    className={`p-4 rounded-xl border text-left transition-all space-y-2 relative ${
                      isSelected
                        ? "bg-slate-900 border-indigo-500 shadow-lg shadow-indigo-500/10"
                        : p.supported
                        ? "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                        : "bg-slate-900/20 border-slate-900 opacity-60 cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white text-sm">
                        {p.name}
                      </span>
                      <Briefcase
                        className={`w-4 h-4 ${
                          isSelected ? "text-indigo-400" : "text-slate-500"
                        }`}
                      />
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2">
                      {p.tagline}
                    </p>
                    {!p.supported && (
                      <span className="inline-block mt-1 text-[10px] font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                        Not configured for the live provider yet
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 2: LANGUAGE SELECTION */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase text-slate-400 tracking-wider font-semibold">
              2. Select Spoken Language
            </h3>

            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleSelectLanguage("en-US", true)}
                className={`p-3 rounded-xl border text-center text-xs font-semibold transition-all ${
                  selectedLanguage === "en-US"
                    ? "bg-slate-900 border-indigo-500 text-indigo-400"
                    : "bg-slate-900/60 border-slate-800 text-slate-300"
                }`}
              >
                🇬🇧 English (en-US)
              </button>

              <button
                type="button"
                onClick={() => handleSelectLanguage("ur-PK", false)}
                className="p-3 rounded-xl border text-center text-xs font-semibold bg-slate-900/20 border-slate-900 text-slate-500 opacity-60 cursor-not-allowed flex flex-col items-center gap-1"
              >
                <span>🇵🇰 Urdu (اردو)</span>
                <span className="text-[9px] text-amber-400">
                  Not configured for the live provider yet
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectLanguage("es-ES", false)}
                className="p-3 rounded-xl border text-center text-xs font-semibold bg-slate-900/20 border-slate-900 text-slate-500 opacity-60 cursor-not-allowed flex flex-col items-center gap-1"
              >
                <span>🇪🇸 Spanish (Español)</span>
                <span className="text-[9px] text-amber-400">
                  Not configured for the live provider yet
                </span>
              </button>
            </div>
          </div>

          {/* SINGLE BUTTON CLIENT VOICE CONTROLLER */}
          <div className="pt-4">
            <ElevenLabsVoiceController />
          </div>
        </div>
      </main>
    </div>
  );
}
