'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useState } from 'react';
import { AlertTriangle, Briefcase, Database, Mic } from 'lucide-react';
import { Navbar } from '@/components/ui/navbar';
import { DEFAULT_DEMO_CONFIGURATION, type DemoScenario } from '@/lib/demo/configuration';

const ElevenLabsVoiceController = dynamic(
  () =>
    import('@/components/calls/elevenlabs-voice-controller').then(
      mod => mod.ElevenLabsVoiceController
    ),
  {
    ssr: false,
    loading: () => (
      <div className="mx-auto max-w-4xl border border-white/[0.08] bg-[#0D0F12] p-8 text-center text-xs text-[#A1A8B3]">
        Preparing the live conversation...
      </div>
    ),
  }
);

const presets = [
  {
    presetKey: 'LEGAL',
    name: 'Northstar Legal Consultations',
    tagline: 'Legal intake, appointment assistance and attorney inquiry routing',
    supported: true,
  },
  {
    presetKey: 'HEALTHCARE',
    name: 'Aura Health Clinic',
    tagline: 'Medical consultation and specialist booking',
    supported: false,
  },
  {
    presetKey: 'REAL_ESTATE',
    name: 'Meridian Prime Realty',
    tagline: 'Property inquiry and tour scheduling',
    supported: false,
  },
  {
    presetKey: 'HOME_SERVICES',
    name: 'Apex Home Services',
    tagline: 'Emergency repair and service dispatch',
    supported: false,
  },
  {
    presetKey: 'B2B_SERVICES',
    name: 'Cortex AI Enterprise',
    tagline: 'B2B software demo and sales intake',
    supported: false,
  },
] as const;

export default function DemoPage() {
  const [selectedPresetKey, setSelectedPresetKey] = useState<string>('LEGAL');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en-US');
  const [selectedScenario, setSelectedScenario] = useState<DemoScenario>('QUALIFICATION');
  const [selectionNotice, setSelectionNotice] = useState<string | null>(null);
  const [simulationState, setSimulationState] = useState<string | null>(null);

  const runSimulation = async () => {
    setSimulationState('Starting a protected demo session...');
    try {
      const sessionResponse = await fetch('/api/demo/session/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario: selectedScenario,
          presetKey: selectedPresetKey,
          language: selectedLanguage,
        }),
      });
      const sessionPayload = await sessionResponse.json().catch(() => null);
      const scenarioMap = {
        BOOKING: 'appointment-booked',
        QUALIFICATION: 'qualified-lead',
        ESCALATION: 'human-escalation',
        ROUTINE: 'support-resolution',
      } as const;
      const sessionUnavailable = sessionResponse.status === 503;
      if (!sessionResponse.ok && !sessionUnavailable) {
        throw new Error(sessionPayload?.error || 'Demo session could not be started.');
      }
      setSimulationState('Running the persisted simulation...');
      const response = await fetch(
        sessionUnavailable ? '/api/telephony/simulations' : '/api/demo/simulation',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scenario: sessionUnavailable ? scenarioMap[selectedScenario] : selectedScenario,
          }),
        }
      );
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.error?.message || 'Simulation could not be completed.');
      }
      setSimulationState(
        `Simulation complete. Conversation ${payload.data.conversationId} is now in the CRM.`
      );
    } catch (error) {
      setSimulationState(
        error instanceof Error ? error.message : 'Simulation could not be completed.'
      );
    }
  };

  const selectPreset = (key: string, supported: boolean) => {
    if (!supported) {
      setSelectionNotice(
        'This business is not configured for the current provider. Select Northstar Legal Consultations to continue.'
      );
      setSelectedPresetKey('LEGAL');
      return;
    }
    setSelectionNotice(null);
    setSelectedPresetKey(key);
  };

  const selectLanguage = (language: string, supported: boolean) => {
    if (!supported) {
      setSelectionNotice(
        'Only English (en-US) is verified for this deployment. Other languages require provider setup.'
      );
      setSelectedLanguage('en-US');
      return;
    }
    setSelectionNotice(null);
    setSelectedLanguage(language);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#08090B] text-[#F4F5F7]">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:py-12">
        <div className="mx-auto max-w-5xl space-y-8">
          <header className="space-y-3 text-center">
            <span className="inline-flex border border-[#78AFFF]/25 bg-[#78AFFF]/[0.08] px-2.5 py-1 text-[11px] font-medium text-[#78AFFF]">
              Fictional demonstration workspace
            </span>
            <h1 className="text-3xl font-medium tracking-[-0.04em] sm:text-4xl">
              Conversation to operational record
            </h1>
            <p className="mx-auto max-w-2xl text-sm leading-6 text-[#A1A8B3]">
              Try verified Web Voice when ElevenLabs is ready, or run a persisted simulation from
              the authenticated Providers workspace. No external phone call is placed by the
              simulation.
            </p>
          </header>

          {selectionNotice && (
            <div className="flex items-center gap-3 border border-[#D8AE69]/25 bg-[#D8AE69]/[0.08] p-4 text-xs text-[#D8AE69]">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{selectionNotice}</span>
            </div>
          )}

          <section className="grid gap-4 border border-[#78AFFF]/20 bg-[#0D0F12] p-5 md:grid-cols-[1fr_auto] md:items-center">
            <div className="flex items-start gap-3">
              <Database className="mt-0.5 h-4 w-4 shrink-0 text-[#75D6C9]" />
              <div>
                <p className="text-sm font-medium">Persisted simulation</p>
                <p className="mt-1 text-xs leading-5 text-[#A1A8B3]">
                  Run a normalized call lifecycle through the real authorization, CRM and
                  conversation persistence path. Authentication is required to protect workspace
                  data.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={runSimulation}
                className="inline-flex min-h-11 items-center justify-center bg-[#78AFFF] px-4 text-xs font-semibold text-[#08090B] transition-colors hover:bg-[#9ac1ff]"
              >
                Run persisted simulation
              </button>
              <Link
                href="/dashboard/providers"
                className="inline-flex min-h-11 items-center justify-center border border-[#78AFFF]/50 px-4 text-xs font-medium text-[#78AFFF] transition-colors hover:bg-[#78AFFF]/10"
              >
                Open simulation controls
              </Link>
            </div>
          </section>
          {simulationState && (
            <p className="border border-[#75D6C9]/30 bg-[#75D6C9]/[0.08] p-3 text-xs text-[#B8F3E8]" role="status">
              {simulationState}
            </p>
          )}

          <section className="space-y-3">
            <h2 className="text-xs font-medium uppercase tracking-[0.12em] text-[#737C88]">
              Business
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {presets.map(preset => {
                const selected = selectedPresetKey === preset.presetKey;
                return (
                  <button
                    key={preset.presetKey}
                    type="button"
                    disabled={!preset.supported}
                    onClick={() => selectPreset(preset.presetKey, preset.supported)}
                    className={`relative min-h-28 space-y-2 border p-4 text-left transition-colors ${
                      selected
                        ? 'border-[#78AFFF]/60 bg-[#121519]'
                        : preset.supported
                          ? 'border-white/[0.08] bg-[#0D0F12] hover:border-white/[0.13]'
                          : 'cursor-not-allowed border-white/[0.06] bg-[#0D0F12] opacity-45'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{preset.name}</span>
                      <Briefcase className={`h-4 w-4 ${
                        selected ? 'text-[#78AFFF]' : 'text-[#737C88]'
                      }`} />
                    </div>
                    <p className="line-clamp-2 text-xs leading-5 text-[#A1A8B3]">
                      {preset.tagline}
                    </p>
                    {!preset.supported && (
                      <span className="text-[10px] text-[#D8AE69]">Requires provider setup</span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xs font-medium uppercase tracking-[0.12em] text-[#737C88]">
              Language
            </h2>
            <div className="grid gap-3 sm:grid-cols-3">
              <button
                type="button"
                onClick={() => selectLanguage('en-US', true)}
                className={`min-h-11 border p-3 text-xs font-medium ${
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
                className="min-h-11 border border-white/[0.06] bg-[#0D0F12] p-3 text-xs text-[#737C88] opacity-50"
              >
                Urdu — Requires provider setup
              </button>
              <button
                type="button"
                disabled
                className="min-h-11 border border-white/[0.06] bg-[#0D0F12] p-3 text-xs text-[#737C88] opacity-50"
              >
                Spanish — Requires provider setup
              </button>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xs font-medium uppercase tracking-[0.12em] text-[#737C88]">
              Workflow
            </h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(['QUALIFICATION', 'BOOKING', 'ESCALATION', 'ROUTINE'] as DemoScenario[]).map(
                scenario => (
                  <button
                    key={scenario}
                    type="button"
                    onClick={() => setSelectedScenario(scenario)}
                    className={`min-h-11 border px-3 text-xs font-medium ${
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
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xs font-medium uppercase tracking-[0.12em] text-[#737C88]">
                Verified Web Voice
              </h2>
              <span className="inline-flex items-center gap-2 text-[11px] text-[#A1A8B3]">
                <Mic className="h-3.5 w-3.5 text-[#78AFFF]" />
                Provider readiness required
              </span>
            </div>
            <ElevenLabsVoiceController
              configuration={{
                ...DEFAULT_DEMO_CONFIGURATION,
                presetKey: selectedPresetKey as 'LEGAL',
                language: selectedLanguage as 'en-US',
                scenario: selectedScenario,
              }}
            />
          </section>
        </div>
      </main>
    </div>
  );
}
