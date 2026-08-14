import Link from 'next/link';
import {
  ArrowDown,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Database,
  Headphones,
  MessageSquareText,
  Network,
  Phone,
  ShieldCheck,
  Users,
  Workflow,
} from 'lucide-react';
import { Footer } from '@/components/ui/footer';
import { Navbar } from '@/components/ui/navbar';

const layers = [
  {
    number: '01',
    title: 'Channel gateway',
    description: 'Normalizes every interaction before business logic runs.',
    items: ['Web voice', 'Web chat', 'PSTN / SIP', 'Approved campaigns'],
    accent: 'text-[#75D6C9]',
  },
  {
    number: '02',
    title: 'Conversation intelligence',
    description: 'Maintains turns, language, intent, context, and requested outcome.',
    items: [
      'ElevenLabs realtime voice',
      'Conversation state',
      'Intent and risk',
      'Context assembly',
    ],
    accent: 'text-[#78AFFF]',
  },
  {
    number: '03',
    title: 'VoxDesk orchestration',
    description: 'Establishes tenant, policy, authority, and the workflow allowed to proceed.',
    items: ['Tenant context', 'Policy evaluation', 'Tool authorization', 'Specialist routing'],
    accent: 'text-[#A1A8B3]',
  },
  {
    number: '04',
    title: 'Operations domain',
    description: 'Turns an authorized request into durable business state.',
    items: ['Contacts and leads', 'Appointments', 'Tasks and follow-ups', 'Human handoffs'],
    accent: 'text-[#75D6C9]',
  },
  {
    number: '05',
    title: 'Quality and control',
    description: 'Makes outcomes visible and keeps production changes supervised.',
    items: ['Audit trail', 'Analytics', 'Evaluation', 'Human-approved improvement'],
    accent: 'text-[#D8AE69]',
  },
];

const boundaries = [
  {
    name: 'ElevenLabs',
    role: 'Conversational voice intelligence',
    owns: 'Speech, turn-taking, interruptions, realtime agent sessions, and provider conversation history.',
    doesNotOwn: 'Tenant authority, CRM writes, business policy, or campaign permission.',
  },
  {
    name: 'Telnyx',
    role: 'PSTN and SIP infrastructure',
    owns: 'Phone numbers, inbound/outbound transport, caller ID, call-control events, and transfer primitives.',
    doesNotOwn: 'Conversation reasoning, CRM state, or customer-operation decisions.',
  },
  {
    name: 'VoxDesk',
    role: 'Customer operations control plane',
    owns: 'Identity, tenant scope, policy, tools, CRM state, campaigns, audit, analytics, and human review.',
    doesNotOwn: 'Carrier infrastructure or the realtime speech engine.',
  },
];

function Status({
  children,
  tone = 'blue',
}: {
  children: React.ReactNode;
  tone?: 'blue' | 'mint' | 'amber';
}) {
  const tones = {
    blue: 'border-[#78AFFF]/25 bg-[#78AFFF]/[0.08] text-[#78AFFF]',
    mint: 'border-[#75D6C9]/25 bg-[#75D6C9]/[0.08] text-[#75D6C9]',
    amber: 'border-[#D8AE69]/25 bg-[#D8AE69]/[0.08] text-[#D8AE69]',
  };

  return (
    <span
      className={`inline-flex rounded-md border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export default function PlatformPage() {
  return (
    <div className="min-h-screen bg-[#08090B] text-[#F4F5F7]">
      <Navbar />
      <main>
        <section className="border-b border-white/[0.08] px-5 py-20 sm:px-8 lg:py-28">
          <div className="mx-auto max-w-7xl">
            <Status>Platform architecture</Status>
            <div className="mt-7 grid gap-12 lg:grid-cols-[.9fr_1.1fr] lg:items-end">
              <div>
                <h1 className="max-w-3xl text-4xl font-semibold leading-[1.04] tracking-[-0.045em] sm:text-6xl">
                  Conversations become controlled business operations.
                </h1>
                <p className="mt-7 max-w-2xl text-base leading-7 text-[#A1A8B3] sm:text-lg">
                  VoxDesk separates conversational intelligence, provider infrastructure, and
                  business authority. The model can request an action; the server decides whether it
                  is permitted and records the result.
                </p>
              </div>
              <div className="border-l border-white/[0.13] pl-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#737C88]">
                  Core principle
                </p>
                <p className="mt-3 text-xl leading-8">
                  Customer interaction
                  <span className="mx-3 text-[#737C88]">→</span>
                  verified context
                  <span className="mx-3 text-[#737C88]">→</span>
                  authorized action
                  <span className="mx-3 text-[#737C88]">→</span>
                  durable CRM state
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-white/[0.08] px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#78AFFF]">
                  System map
                </p>
                <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] sm:text-5xl">
                  One operational conversation layer.
                </h2>
              </div>
              <p className="max-w-md text-sm leading-6 text-[#737C88]">
                Channels are adapters. Customer identity, authority, business actions, and outcomes
                converge in the same domain.
              </p>
            </div>

            <div className="mt-12 overflow-hidden rounded-[10px] border border-white/[0.1] bg-[#0D0F12]">
              {layers.map((layer, index) => (
                <div key={layer.title}>
                  <article className="grid gap-6 border-b border-white/[0.08] p-6 last:border-0 md:grid-cols-[4rem_1fr_1.15fr] md:p-8">
                    <span className={`font-mono text-xs ${layer.accent}`}>{layer.number}</span>
                    <div>
                      <h3 className="text-xl font-medium">{layer.title}</h3>
                      <p className="mt-2 max-w-md text-sm leading-6 text-[#737C88]">
                        {layer.description}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-white/[0.08] bg-white/[0.08]">
                      {layer.items.map(item => (
                        <div key={item} className="bg-[#121519] px-4 py-4 text-sm text-[#A1A8B3]">
                          {item}
                        </div>
                      ))}
                    </div>
                  </article>
                  {index < layers.length - 1 && (
                    <div className="sr-only" aria-hidden="true">
                      <ArrowDown />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-white/[0.08] px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#75D6C9]">
              Voice provider boundaries
            </p>
            <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-[-0.035em] sm:text-5xl">
              Each system owns one clear responsibility.
            </h2>

            <div className="mt-12 grid overflow-hidden rounded-[10px] border border-white/[0.1] lg:grid-cols-3">
              {boundaries.map((boundary, index) => (
                <article
                  key={boundary.name}
                  className={`p-6 sm:p-8 ${index < boundaries.length - 1 ? 'border-b border-white/[0.08] lg:border-b-0 lg:border-r' : ''}`}
                >
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#737C88]">
                    {boundary.role}
                  </p>
                  <h3 className="mt-4 text-2xl font-medium">{boundary.name}</h3>
                  <dl className="mt-7 space-y-6 text-sm leading-6">
                    <div>
                      <dt className="text-[#75D6C9]">Owns</dt>
                      <dd className="mt-1 text-[#A1A8B3]">{boundary.owns}</dd>
                    </div>
                    <div>
                      <dt className="text-[#737C88]">Does not own</dt>
                      <dd className="mt-1 text-[#737C88]">{boundary.doesNotOwn}</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-2">
              <div className="rounded-[10px] border border-[#75D6C9]/20 bg-[#75D6C9]/[0.04] p-6">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-medium">Web voice</h3>
                  <Status tone="mint">Configuration dependent</Status>
                </div>
                <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-[#A1A8B3]">
                  <span>Customer browser</span>
                  <ArrowRight className="h-4 w-4 text-[#737C88]" />
                  <span>ElevenLabs</span>
                  <ArrowRight className="h-4 w-4 text-[#737C88]" />
                  <span>VoxDesk tools</span>
                  <ArrowRight className="h-4 w-4 text-[#737C88]" />
                  <span>CRM</span>
                </div>
              </div>
              <div className="rounded-[10px] border border-[#D8AE69]/20 bg-[#D8AE69]/[0.04] p-6">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-medium">Production telephone</h3>
                  <Status tone="amber">Activation required</Status>
                </div>
                <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-[#A1A8B3]">
                  <span>Customer phone</span>
                  <ArrowRight className="h-4 w-4 text-[#737C88]" />
                  <span>Telnyx</span>
                  <ArrowRight className="h-4 w-4 text-[#737C88]" />
                  <span>ElevenLabs</span>
                  <ArrowRight className="h-4 w-4 text-[#737C88]" />
                  <span>VoxDesk</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-white/[0.08] px-5 py-20 sm:px-8">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.8fr_1.2fr]">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#78AFFF]">
                Authorized execution
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] sm:text-5xl">
                The model cannot directly write to the CRM.
              </h2>
              <p className="mt-6 text-sm leading-7 text-[#A1A8B3]">
                Every consequential request crosses validation, tenant authorization, policy,
                session-aware risk evaluation, idempotency, and an audited domain service.
              </p>
            </div>
            <ol className="overflow-hidden rounded-[10px] border border-white/[0.1]">
              {[
                [
                  '01',
                  'Tool proposal',
                  'The voice or text agent proposes a typed business action.',
                ],
                [
                  '02',
                  'Signed context',
                  'VoxDesk binds the request to its conversation and tenant.',
                ],
                ['03', 'Policy decision', 'Allow, deny, or escalate for human approval.'],
                [
                  '04',
                  'Execution integrity',
                  'Idempotency prevents duplicate consequential writes.',
                ],
                [
                  '05',
                  'Domain result',
                  'CRM, calendar, task, opportunity, or handoff state is persisted.',
                ],
                [
                  '06',
                  'Audit and response',
                  'The decision and safe result return to the conversation.',
                ],
              ].map(([number, title, copy]) => (
                <li
                  key={number}
                  className="grid grid-cols-[3rem_1fr] gap-3 border-b border-white/[0.08] p-5 last:border-0 sm:grid-cols-[3rem_12rem_1fr]"
                >
                  <span className="font-mono text-[10px] text-[#78AFFF]">{number}</span>
                  <strong className="text-sm font-medium">{title}</strong>
                  <span className="text-sm leading-6 text-[#737C88]">{copy}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-7xl rounded-[10px] border border-white/[0.1] bg-[#0D0F12] p-8 sm:p-12">
            <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <Status tone="mint">Architecture implemented</Status>
                <h2 className="mt-5 max-w-3xl text-3xl font-semibold tracking-[-0.035em] sm:text-5xl">
                  See the customer-service operating model in action.
                </h2>
                <p className="mt-5 max-w-2xl text-sm leading-7 text-[#A1A8B3]">
                  The public demo distinguishes persisted simulation, Web Voice, and carrier
                  activation. No simulated interaction is represented as a real PSTN call.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/operations"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-white/[0.13] px-5 text-sm font-medium hover:bg-white/[0.04]"
                >
                  Customer operations <Workflow className="h-4 w-4" />
                </Link>
                <Link
                  href="/demo"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#78AFFF] px-5 text-sm font-medium text-[#08090B] hover:bg-[#91BEFF]"
                >
                  Open demo <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-white/[0.08] bg-white/[0.08] sm:grid-cols-4">
              {[
                [Phone, 'Voice'],
                [MessageSquareText, 'Chat'],
                [ShieldCheck, 'Policy'],
                [Database, 'CRM'],
                [CalendarDays, 'Scheduling'],
                [Users, 'Human handoff'],
                [Network, 'Providers'],
                [Headphones, 'Customer operations'],
              ].map(([Icon, label]) => {
                const Component = Icon as typeof CheckCircle2;
                return (
                  <div key={String(label)} className="bg-[#121519] p-4 text-sm text-[#A1A8B3]">
                    <Component className="mb-3 h-4 w-4 text-[#78AFFF]" />
                    {String(label)}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
