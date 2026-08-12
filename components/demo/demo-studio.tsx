'use client';

import dynamic from 'next/dynamic';
import { useCallback, useMemo, useState } from 'react';
import { Activity, CheckCircle2, CircleDot, Clock3, Database, Flag, GitBranch, MessageSquare, ShieldCheck, UserRound, Volume2 } from 'lucide-react';
import { DEFAULT_DEMO_CONFIGURATION, type DemoConfiguration, type DemoScenario } from '@/lib/demo/configuration';
import type { CallState, FinalizationResult, VoiceTranscriptLine } from '@/components/calls/elevenlabs-voice-controller';

const ElevenLabsVoiceController = dynamic(() => import('@/components/calls/elevenlabs-voice-controller').then(module => module.ElevenLabsVoiceController), { ssr: false, loading: () => <div className="flex min-h-[420px] items-center justify-center border border-white/[0.08] bg-[#0D131D] text-sm text-[#94A3B8]">Loading the conversation workspace…</div> });

const scenarios: Array<{ key: DemoScenario; label: string; description: string }> = [
  { key: 'QUALIFICATION', label: 'Qualified lead', description: 'Capture a new enquiry and qualify the next action.' },
  { key: 'BOOKING', label: 'Appointment booking', description: 'Move from intent to a confirmed scheduling workflow.' },
  { key: 'ESCALATION', label: 'Human escalation', description: 'Package context for a human team handoff.' },
  { key: 'ROUTINE', label: 'Routine enquiry', description: 'Answer an approved business question.' },
];

const stateLabels: Record<CallState, string> = { IDLE: 'Ready', CHECKING_CONFIGURATION: 'Checking provider', REQUESTING_MICROPHONE: 'Microphone permission', BOOTSTRAPPING_SESSION: 'Creating session', CONNECTING: 'Connecting', CONNECTED: 'Connected', LISTENING: 'Listening', CALLER_SPEAKING: 'Customer speaking', AGENT_SPEAKING: 'Agent speaking', INTERRUPTED: 'Turn interrupted', ENDING: 'Ending conversation', FINALIZING: 'Persisting CRM record', COMPLETED: 'Complete', FAILED: 'Needs attention' };

function StatePill({ state }: { state: CallState }) {
  const active = !['IDLE', 'FAILED', 'COMPLETED'].includes(state);
  const tone = state === 'FAILED' ? 'border-[#F87171]/30 bg-[#F87171]/10 text-[#F87171]' : state === 'COMPLETED' ? 'border-[#6EF3B0]/30 bg-[#6EF3B0]/10 text-[#6EF3B0]' : 'border-[#6EE7F9]/25 bg-[#6EE7F9]/10 text-[#6EE7F9]';
  return <span className={'inline-flex items-center gap-2 border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ' + tone}><CircleDot className={'h-3 w-3 ' + (active ? 'animate-pulse' : '')} />{stateLabels[state]}</span>;
}

export function DemoStudio() {
  const [scenario, setScenario] = useState<DemoScenario>('QUALIFICATION');
  const [state, setState] = useState<CallState>('IDLE');
  const [transcript, setTranscript] = useState<VoiceTranscriptLine[]>([]);
  const [result, setResult] = useState<FinalizationResult | null>(null);
  const configuration = useMemo<DemoConfiguration>(() => ({ ...DEFAULT_DEMO_CONFIGURATION, scenario }), [scenario]);
  const handleStateChange = useCallback((next: CallState) => setState(next), []);
  const handleTranscriptChange = useCallback((next: VoiceTranscriptLine[]) => setTranscript(next), []);
  const handleFinalization = useCallback((next: FinalizationResult | null) => setResult(next), []);
  const effects = [
    { label: 'Conversation session', value: state === 'IDLE' ? 'Not started' : 'Active', icon: MessageSquare },
    { label: 'Customer context', value: transcript.length ? 'Signals captured' : 'Waiting for turns', icon: UserRound },
    { label: 'Authorized action', value: state === 'FINALIZING' || state === 'COMPLETED' ? 'Reconciled' : 'Pending', icon: GitBranch },
    { label: 'CRM persistence', value: result?.persistenceStatus ?? 'Pending', icon: Database },
  ];
  return <div className="min-h-screen bg-[#080C12] text-[#F1F5F9]">
    <div className="border-b border-white/[0.08] bg-[#0A0E14]/90 px-5 py-4 sm:px-8"><div className="mx-auto flex max-w-[1500px] flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div><div className="flex items-center gap-3"><span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#6EE7F9]">Demo Studio</span><span className="border border-[#FBBF24]/30 bg-[#FBBF24]/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#FBBF24]">Simulation</span></div><h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">Conversations into operations.</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-[#94A3B8]">Run a deterministic scenario through the same conversation, authorization, persistence, and CRM boundaries used by the product.</p></div><p className="max-w-sm text-xs leading-5 text-[#64748B]">Simulation — no external phone call is being placed.</p></div></div>
    <main className="mx-auto grid max-w-[1500px] gap-4 px-4 py-5 sm:px-6 lg:grid-cols-[260px_minmax(0,1fr)_280px] lg:px-8">
      <aside className="border border-white/[0.08] bg-[#0D131D] p-4"><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#94A3B8]"><Flag className="h-4 w-4 text-[#7C8CFF]" />Scenario</div><div className="mt-4 space-y-2">{scenarios.map(item => <button key={item.key} type="button" disabled={state !== 'IDLE' && state !== 'COMPLETED' && state !== 'FAILED'} onClick={() => setScenario(item.key)} className={'w-full border p-3 text-left transition-colors ' + (item.key === scenario ? 'border-[#7C8CFF]/60 bg-[#172233]' : 'border-white/[0.08] bg-[#101826] hover:border-white/[0.16]')}><span className="block text-sm font-medium">{item.label}</span><span className="mt-1 block text-xs leading-5 text-[#64748B]">{item.description}</span></button>)}</div><div className="mt-5 border-t border-white/[0.08] pt-4 text-xs text-[#64748B]"><div className="flex items-center justify-between"><span>Business</span><span className="text-[#DCE6F2]">Northstar Legal</span></div><div className="mt-3 flex items-center justify-between"><span>Channel</span><span className="text-[#DCE6F2]">Web voice</span></div><div className="mt-3 flex items-center justify-between"><span>Language</span><span className="text-[#DCE6F2]">English</span></div></div></aside>
      <section className="min-w-0 border border-white/[0.08] bg-[#0D131D]"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] px-4 py-3"><div className="flex items-center gap-3"><Volume2 className="h-4 w-4 text-[#6EE7F9]" /><span className="text-sm font-medium">{configuration.businessName}</span><span className="text-xs text-[#64748B]">Agent {configuration.agentDisplayName}</span></div><StatePill state={state} /></div><div className="p-3 sm:p-5"><ElevenLabsVoiceController configuration={configuration} onStateChange={handleStateChange} onTranscriptChange={handleTranscriptChange} onFinalization={handleFinalization} /></div></section>
      <aside className="space-y-4"><section className="border border-white/[0.08] bg-[#0D131D] p-4"><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#94A3B8]"><Activity className="h-4 w-4 text-[#6EF3B0]" />Business effects</div><div className="mt-4 space-y-3">{effects.map(effect => { const Icon = effect.icon; return <div key={effect.label} className="flex items-start gap-3 border-b border-white/[0.06] pb-3 last:border-0 last:pb-0"><Icon className="mt-0.5 h-4 w-4 text-[#7C8CFF]" /><div><p className="text-xs text-[#64748B]">{effect.label}</p><p className="mt-1 text-sm text-[#DCE6F2]">{effect.value}</p></div></div>; })}</div></section><section className="border border-white/[0.08] bg-[#0D131D] p-4"><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#94A3B8]"><Clock3 className="h-4 w-4 text-[#FBBF24]" />Pipeline trace</div><ol className="mt-4 space-y-3 text-xs text-[#94A3B8]"><li><span className="mr-2 font-mono text-[#6EE7F9]">01</span>Conversation event</li><li><span className="mr-2 font-mono text-[#6EE7F9]">02</span>Orchestrator context</li><li><span className="mr-2 font-mono text-[#6EE7F9]">03</span>Server-authorized tool</li><li><span className="mr-2 font-mono text-[#6EE7F9]">04</span>Database / CRM state</li><li><span className="mr-2 font-mono text-[#6EE7F9]">05</span>Outcome and follow-up</li></ol></section><div className="flex items-start gap-3 border border-[#6EF3B0]/20 bg-[#6EF3B0]/[0.06] p-4 text-xs leading-5 text-[#94A3B8]"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#6EF3B0]" />Provider events are simulated; no Telnyx route is entered.</div>{result && <div className="border border-[#6EF3B0]/30 bg-[#6EF3B0]/[0.08] p-4"><div className="flex items-center gap-2 text-sm font-medium text-[#6EF3B0]"><CheckCircle2 className="h-4 w-4" />CRM receipt ready</div><p className="mt-2 text-xs leading-5 text-[#94A3B8]">Session {result.sessionId} persisted with {result.callerTurns + result.agentTurns} turns.</p></div>}</aside>
    </main></div>;
}