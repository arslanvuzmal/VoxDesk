'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Navbar } from '@/components/ui/navbar';
import { Briefcase, AlertTriangle } from 'lucide-react';

// Client-only dynamic import with SSR disabled to prevent WebRTC/WebAudio hydration exceptions
const ElevenLabsVoiceController = dynamic(
  () =>
    import('@/components/calls/elevenlabs-voice-controller').then(
      mod => mod.ElevenLabsVoiceController
    ),
  {
    ssr: false,
    loading: () => (
      <div className="p-8 rounded-xl bg-white border border-[#E2E8F0] text-center text-xs text-[#64748B] font-mono space-y-2 max-w-4xl mx-auto shadow-sm">
        <span className="w-2.5 h-2.5 rounded-full bg-[#1D4ED8] animate-ping inline-block" />
        <p>Loading ElevenLabs Realtime WebRTC Engine...</p>
      </div>
    ),
  }
);

export default function DemoPage() {
  const [selectedPresetKey, setSelectedPresetKey] = useState<string>('LEGAL');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en-US');
  const [selectionNotice, setSelectionNotice] = useState<string | null>(null);

  const presets = [
    {
      presetKey: 'LEGAL',
      name: 'Northstar Legal Consultations',
      tagline: 'Legal intake, appointment assistance & attorney inquiry routing',
      supported: true,
    },
    {
      presetKey: 'HEALTHCARE',
      name: 'Aura Health Clinic',
      tagline: 'Medical consultation & specialist booking',
      supported: false,
    },
    {
      presetKey: 'REAL_ESTATE',
      name: 'Meridian Prime Realty',
      tagline: 'Property inquiry & tour scheduling',
      supported: false,
    },
    {
      presetKey: 'HOME_SERVICES',
      name: 'Apex Home Services',
      tagline: 'Emergency repair & service dispatch',
      supported: false,
    },
    {
      presetKey: 'B2B_SERVICES',
      name: 'Cortex AI Enterprise',
      tagline: 'B2B software demo & sales intake',
      supported: false,
    },
  ];

  const handleSelectPreset = (key: string, supported: boolean) => {
    if (!supported) {
      setSelectionNotice(
        'Not configured for the live provider yet. Please select Northstar Legal Consultations (English).'
      );
      setSelectedPresetKey('LEGAL');
    } else {
      setSelectionNotice(null);
      setSelectedPresetKey(key);
    }
  };

  const handleSelectLanguage = (lang: string, supported: boolean) => {
    if (!supported) {
      setSelectionNotice(
        'Not configured for the live provider yet. Only English (en-US) is supported in this deployment.'
      );
      setSelectedLanguage('en-US');
    } else {
      setSelectionNotice(null);
      setSelectedLanguage(lang);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-8">
        <div className="max-w-4xl mx-auto space-y-8 py-6">
          {/* Header */}
          <div className="text-center space-y-3">
            <span className="px-3 py-1 rounded-full bg-[#EFF6FF] text-[#1D4ED8] font-mono text-xs border border-[#1D4ED8]/20 inline-flex items-center gap-1.5 font-semibold">
              ElevenLabs Realtime Voice Production Sandbox
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
              Live Voice Agent Sandbox
            </h1>
            <p className="text-sm text-[#64748B] max-w-xl mx-auto">
              Test real-time speech conversation over WebRTC powered by ElevenLabs Conversational
              AI.
            </p>
          </div>

          {selectionNotice && (
            <div className="p-4 rounded-xl bg-[#FFFBEB] border border-[#FCD34D] flex items-center space-x-3 text-[#78350F] text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 text-[#B45309]" />
              <span>{selectionNotice}</span>
            </div>
          )}

          {/* STEP 1: ORGANIZATION PRESET SELECTION */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase text-[#64748B] tracking-wider">
              1. Select Industry Organization Profile
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {presets.map(p => {
                const isSelected = selectedPresetKey === p.presetKey;
                return (
                  <button
                    key={p.presetKey}
                    type="button"
                    onClick={() => handleSelectPreset(p.presetKey, p.supported)}
                    className={`p-4 rounded-xl border text-left transition-all space-y-2 relative shadow-sm ${
                      isSelected
                        ? 'bg-white border-[#1D4ED8] shadow-md ring-2 ring-[#1D4ED8]/10'
                        : p.supported
                          ? 'bg-white border-[#E2E8F0] hover:border-[#CBD5E1]'
                          : 'bg-[#F1F5F9] border-[#E2E8F0] opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#0F172A] text-sm">{p.name}</span>
                      <Briefcase
                        className={`w-4 h-4 ${isSelected ? 'text-[#1D4ED8]' : 'text-[#64748B]'}`}
                      />
                    </div>
                    <p className="text-xs text-[#64748B] line-clamp-2">{p.tagline}</p>
                    {!p.supported && (
                      <span className="inline-block mt-1 text-[10px] font-mono text-[#B45309] bg-[#FFFBEB] px-2 py-0.5 rounded border border-[#FCD34D]">
                        Not configured for live provider
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 2: LANGUAGE SELECTION */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase text-[#64748B] tracking-wider">
              2. Select Spoken Language
            </h3>

            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleSelectLanguage('en-US', true)}
                className={`p-3 rounded-xl border text-center text-xs font-semibold transition-all shadow-sm ${
                  selectedLanguage === 'en-US'
                    ? 'bg-white border-[#1D4ED8] text-[#1D4ED8] ring-2 ring-[#1D4ED8]/10'
                    : 'bg-white border-[#E2E8F0] text-[#475569]'
                }`}
              >
                🇬🇧 English (en-US)
              </button>

              <button
                type="button"
                onClick={() => handleSelectLanguage('ur-PK', false)}
                className="p-3 rounded-xl border text-center text-xs font-semibold bg-[#F1F5F9] border-[#E2E8F0] text-[#94A3B8] opacity-60 cursor-not-allowed flex flex-col items-center gap-1"
              >
                <span>🇵🇰 Urdu (اردو)</span>
                <span className="text-[9px] text-[#B45309]">Not configured for live provider</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectLanguage('es-ES', false)}
                className="p-3 rounded-xl border text-center text-xs font-semibold bg-[#F1F5F9] border-[#E2E8F0] text-[#94A3B8] opacity-60 cursor-not-allowed flex flex-col items-center gap-1"
              >
                <span>🇪🇸 Spanish (Español)</span>
                <span className="text-[9px] text-[#B45309]">Not configured for live provider</span>
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
