'use client';

import { useState } from 'react';

type Scenario =
  | 'qualified-lead'
  | 'appointment-booked'
  | 'support-resolution'
  | 'human-escalation'
  | 'voicemail'
  | 'no-answer'
  | 'opt-out'
  | 'provider-failure';

type Capability = {
  status: string;
  reason?: string;
  implemented: boolean;
  configured: boolean;
  demoAvailable: boolean;
};

export function TelephonyCapabilityPanel({
  mode,
  readiness,
  livePstn,
  simulation,
  activationRequirements,
}: {
  mode: string;
  readiness: string;
  livePstn: Capability;
  simulation: Capability;
  activationRequirements: string[];
}) {
  const [scenario, setScenario] = useState<Scenario>('qualified-lead');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<{
    disclosure: string;
    callId: string;
    conversationId: string;
    timeline: Array<{ state: string; event: string; at: string }>;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setRunning(true);
    setResult(null);
    setError(null);
    try {
      const response = await fetch('/api/telephony/simulations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok)
        throw new Error(payload?.error?.message || 'Simulation could not be started.');
      setResult(payload.data);
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : 'Simulation could not be started.'
      );
    } finally {
      setRunning(false);
    }
  };

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            Telephony
          </p>
          <h2 className="mt-2 text-lg font-semibold text-slate-950">
            Production architecture, safe portfolio execution
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            ElevenLabs provides conversational intelligence. Telnyx remains the production PSTN and
            SIP adapter. This deployment exercises the application workflow without placing a
            carrier call.
          </p>
        </div>
        <span className="w-fit rounded border border-teal-200 bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-800">
          {readiness.replaceAll('_', ' ')}
        </span>
      </div>

      <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="text-xs text-slate-500">Mode</dt>
          <dd className="mt-1 text-sm font-semibold text-slate-950">{mode}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Conversational AI</dt>
          <dd className="mt-1 text-sm font-semibold text-slate-950">ElevenLabs</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Production PSTN</dt>
          <dd className="mt-1 text-sm font-semibold text-slate-950">Telnyx</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Live activation</dt>
          <dd className="mt-1 text-sm font-semibold text-slate-950">
            {livePstn.status.replaceAll('_', ' ')}
          </dd>
        </div>
      </dl>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">
        <div className="border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Run demonstration
          </p>
          <p className="mt-2 text-sm text-slate-700">
            Simulation — no external phone call is being placed.
          </p>
          <label
            className="mt-4 block text-xs font-medium text-slate-600"
            htmlFor="simulation-scenario"
          >
            Scenario
          </label>
          <select
            id="simulation-scenario"
            value={scenario}
            onChange={event => setScenario(event.target.value as Scenario)}
            className="mt-1 min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900"
            disabled={!simulation.demoAvailable || running}
          >
            <option value="qualified-lead">Qualified lead</option>
            <option value="appointment-booked">Appointment booked</option>
            <option value="support-resolution">Support resolution</option>
            <option value="human-escalation">Human escalation</option>
            <option value="voicemail">Voicemail</option>
            <option value="no-answer">No answer</option>
            <option value="opt-out">Opt-out</option>
            <option value="provider-failure">Provider failure</option>
          </select>
          <button
            type="button"
            onClick={run}
            disabled={!simulation.demoAvailable || running}
            className="mt-3 min-h-11 w-full rounded-md bg-slate-950 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {running ? 'Running simulation…' : 'Run simulated call'}
          </button>
          {simulation.reason && <p className="mt-3 text-xs text-amber-700">{simulation.reason}</p>}
          {error && <p className="mt-3 text-xs text-rose-700">{error}</p>}
        </div>

        <div className="border border-slate-200 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Live PSTN activation
          </p>
          <p className="mt-2 text-sm text-slate-700">
            Customer-owned Telnyx resources activate live inbound and outbound calling without
            replacing the core workflow.
          </p>
          {activationRequirements.length ? (
            <ul className="mt-3 space-y-2 text-xs text-slate-600">
              {activationRequirements.map(requirement => (
                <li key={requirement}>○ {requirement}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-xs text-slate-600">
              Configuration is present; run provider verification before enabling live calls.
            </p>
          )}
        </div>
      </div>

      {result && (
        <div className="mt-5 border border-teal-200 bg-teal-50 p-4">
          <p className="text-sm font-semibold text-teal-900">Simulated call completed</p>
          <p className="mt-1 text-xs text-teal-800">{result.disclosure}</p>
          <div className="mt-3 space-y-1 font-mono text-[11px] text-teal-900">
            {result.timeline.map(item => (
              <p key={`${item.event}-${item.at}`}>
                {item.state} · {item.event}
              </p>
            ))}
          </div>
          <p className="mt-3 text-xs text-teal-800">
            Call and conversation records were persisted: {result.callId.slice(0, 10)}… /{' '}
            {result.conversationId.slice(0, 10)}…
          </p>
        </div>
      )}
    </section>
  );
}
