'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Navbar } from '@/components/ui/navbar';
import { Briefcase, AlertTriangle } from 'lucide-react';
import { DEFAULT_DEMO_CONFIGURATION, type DemoScenario } from '@/lib/demo/configuration';

// Client-only dynamic import with SSR disabled to prevent WebRTC/WebAudio hydration exceptions
const ElevenLabsVoiceController = dynamic(
  () =>
    import('@/components/calls/elevenlabs-voice-controller').then(
      mod => mod.ElevenLabsVoiceController
    ),
  {
    ssr: false,
    loading: () => (
      <div className="mx-auto max-w-4xl border border-white/[0.08] bg-[#0D0F12] p-8 text-center text-xs text-[#A1A8B3]">
        <p>Preparing the live conversation…</p>
      </div>
    ),
  }
);

export default function DemoPage() {
  const [selectedPresetKey, setSelectedPresetKey] = useState<string>('LEGAL');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en-US');
  const [selectedScenario, setSelectedScenario] = useState<DemoScenario>('QUALIFICATION');
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
    <div className="flex min-h-screen flex-col bg-[#08090B] text-[#F4F5F7]">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:py-12">
        <div className="mx-auto max-w-4xl space-y-10">
          {/* Header */}
          <div className="text-center space-y-3">
            <span className="inline-flex border border-[#78AFFF]/25 bg-[#78AFFF]/[0.08] px-2.5 py-1 text-[11px] font-medium text-[#78AFFF]">
              Fictional demonstration workspace
            </span>
            <h1 className="text-3xl font-medium tracking-[-0.04em] text-[#F4F5F7] sm:text-4xl">
              Live business conversation
            </h1>
            <p className="mx-auto max-w-xl text-sm leading-6 text-[#A1A8B3]">
              Speak with a configured demonstration business and watch the conversation become
              structured operational data.
            </p>
          </div>

          {selectionNotice && (
            <div className="flex items-center space-x-3 border border-[#D8AE69]/25 bg-[#D8AE69]/[0.08] p-4 text-xs text-[#D8AE69]">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{selectionNotice}</span>
            </div>
          )}

          {/* STEP 1: ORGANIZATION PRESET SELECTION */}
          <div className="space-y-3">
            <h3 className="text-xs font-medium uppercase tracking-[0.12em] text-[#737C88]">
              1. Business
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {presets.map(p => {
                const isSelected = selectedPresetKey === p.presetKey;
                return (
                  <button
                    key={p.presetKey}
                    type="button"
                    onClick={() => handleSelectPreset(p.presetKey, p.supported)}
                    disabled={!p.supported}
                    className={`relative min-h-28 space-y-2 border p-4 text-left transition-colors duration-200 ${
                      isSelected
                        ? 'border-[#78AFFF]/60 bg-[#121519]'
                        : p.supported
                          ? 'border-white/[0.08] bg-[#0D0F12] hover:border-white/[0.13]'
                          : 'cursor-not-allowed border-white/[0.06] bg-[#0D0F12] opacity-45'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-[#F4F5F7]">{p.name}</span>
                      <Briefcase
                        className={`h-4 w-4 ${isSelected ? 'text-[#78AFFF]' : 'text-[#737C88]'}`}
                      />
                    </div>
                    <p className="line-clamp-2 text-xs leading-5 text-[#A1A8B3]">{p.tagline}</p>
                    {!p.supported && (
                      <span className="mt-1 inline-block text-[10px] text-[#D8AE69]">
                        Requires provider setup
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 2: LANGUAGE SELECTION */}
          <div className="space-y-3">
            <h3 className="text-xs font-medium uppercase tracking-[0.12em] text-[#737C88]">
              2. Language
            </h3>

            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleSelectLanguage('en-US', true)}
                className={`min-h-11 border p-3 text-center text-xs font-medium transition-colors ${
                  selectedLanguage === 'en-US'
                    ? 'border-[#78AFFF]/60 bg-[#121519] text-[#78AFFF]'
                    : 'border-white/[0.08] bg-[#0D0F12] text-[#A1A8B3]'
                }`}
              >
                English (en-US)
              </button>

              <button
                type="button"
                disabled
                className="flex min-h-11 cursor-not-allowed flex-col items-center gap-1 border border-white/[0.06] bg-[#0D0F12] p-3 text-center text-xs font-medium text-[#737C88] opacity-50"
              >
                <span>Urdu (Ø§Ø±Ø¯Ùˆ)</span>
                <span className="text-[9px] text-[#D8AE69]">Requires provider setup</span>
              </button>

              <button
                type="button"
                disabled
                className="flex min-h-11 cursor-not-allowed flex-col items-center gap-1 border border-white/[0.06] bg-[#0D0F12] p-3 text-center text-xs font-medium text-[#737C88] opacity-50"
              >
                <span>Spanish (Español)</span>
                <span className="text-[9px] text-[#D8AE69]">Requires provider setup</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-medium uppercase tracking-[0.12em] text-[#737C88]">
              3. Workflow
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['QUALIFICATION', 'BOOKING', 'ESCALATION', 'ROUTINE'] as DemoScenario[]).map(
                scenario => (
                  <button
                    key={scenario}
                    type="button"
                    onClick={() => setSelectedScenario(scenario)}
                    className={`min-h-11 border px-3 text-xs font-medium transition-colors ${
                      selectedScenario === scenario
                        ? 'border-[#78AFFF]/60 bg-[#121519] text-[#78AFFF]'
                        : 'border-white/[0.08] bg-[#0D0F12] text-[#A1A8B3] hover:border-white/[0.13]'
                    }`}
                  >
                    {scenario.replace('_', ' ')}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="pt-4">
            <ElevenLabsVoiceController
              configuration={{
                ...DEFAULT_DEMO_CONFIGURATION,
                presetKey: selectedPresetKey as 'LEGAL',
                language: selectedLanguage as 'en-US',
                scenario: selectedScenario,
              }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
