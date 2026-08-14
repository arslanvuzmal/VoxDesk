import Link from 'next/link';
import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  CircleDashed,
  Headphones,
  MessageSquareText,
  PhoneForwarded,
  ShieldCheck,
  Target,
  UserRoundCheck,
  Users,
} from 'lucide-react';
import { Footer } from '@/components/ui/footer';
import { Navbar } from '@/components/ui/navbar';

const capabilities = [
  {
    title: 'Reception and intake',
    event: 'A customer starts a voice or text conversation.',
    decision: 'Resolve identity, language, intent, urgency, and the requested outcome.',
    actions: ['Answer approved questions', 'Collect required context', 'Route safely'],
    result: 'A structured conversation and next action, not an unowned transcript.',
    icon: Headphones,
    status: 'IMPLEMENTED',
  },
  {
    title: 'Lead qualification',
    event: 'A prospect asks about a service or responds to approved outreach.',
    decision: 'Evaluate configured criteria using evidence collected in the conversation.',
    actions: ['Create or update contact', 'Create opportunity', 'Assign follow-up'],
    result: 'A traceable lead record with evidence, confidence, owner, and next action.',
    icon: Target,
    status: 'IMPLEMENTED',
  },
  {
    title: 'Scheduling',
    event: 'A customer requests a booking, change, cancellation, or callback.',
    decision: 'Apply business rules, timezone, availability, identity, and permission.',
    actions: ['Check availability', 'Book or reschedule', 'Create confirmation task'],
    result: 'The agent confirms only after the provider or database confirms.',
    icon: CalendarCheck,
    status: 'IMPLEMENTED',
  },
  {
    title: 'Human escalation',
    event: 'The request is risky, sensitive, frustrated, or outside automation policy.',
    decision: 'Choose warm transfer, callback, task, or queue according to policy.',
    actions: ['Package context', 'Create handoff', 'Track provider state'],
    result: 'The human receives identity, summary, collected fields, and attempted actions.',
    icon: PhoneForwarded,
    status: 'IMPLEMENTED',
  },
  {
    title: 'Cases, queues, and SLA',
    event: 'A support issue requires ownership beyond one conversation.',
    decision: 'Triage category, priority, queue, owner, and response target.',
    actions: ['Open case', 'Assign queue', 'Track resolution and SLA'],
    result: 'A complete service workflow linked to Customer 360.',
    icon: Users,
    status: 'PLANNED',
  },
  {
    title: 'Email and messaging adapters',
    event: 'A customer contacts the business outside voice and web chat.',
    decision: 'Normalize the channel into the canonical conversation model.',
    actions: ['Resolve identity', 'Apply the same policy', 'Persist one timeline'],
    result: 'Channels converge into one customer operations layer.',
    icon: MessageSquareText,
    status: 'PLANNED',
  },
];

const leadStages = [
  ['01', 'Capture', 'Voice, chat, campaign response, or approved external lead event.'],
  [
    '02',
    'Resolve',
    'Match an existing contact or create a provisional identity when enough data exists.',
  ],
  ['03', 'Qualify', 'Apply explicit business criteria and retain the supporting evidence.'],
  [
    '04',
    'Authorize',
    'Policy decides whether to create, update, contact, or request human approval.',
  ],
  ['05', 'Act', 'Create an opportunity, appointment, task, follow-up, or human handoff.'],
  ['06', 'Measure', 'Record outcome, ownership, completeness, and the next action.'],
];

const maturity = [
  {
    phase: 'Foundation',
    state: 'CURRENT',
    items: [
      'Canonical conversations',
      'Contacts and CRM state',
      'Authorized tools',
      'Scheduling',
      'Telephony simulation',
    ],
  },
  {
    phase: 'Customer operations',
    state: 'NEXT',
    items: ['First-class cases', 'Queues and assignment', 'SLA policies', 'Expanded Customer 360'],
  },
  {
    phase: 'Omnichannel',
    state: 'PLANNED',
    items: ['Email adapter', 'Messaging adapters', 'Contact-form ingestion', 'Unified human inbox'],
  },
  {
    phase: 'Operational intelligence',
    state: 'PARTIAL',
    items: [
      'Outcome analytics',
      'QA scorecards',
      'CSAT',
      'Resolution effectiveness',
      'Knowledge-gap reporting',
    ],
  },
];

function State({ value }: { value: string }) {
  const active = value === 'IMPLEMENTED' || value === 'CURRENT';
  return (
    <span
      className={
        active
          ? 'rounded-md border border-[#75D6C9]/25 bg-[#75D6C9]/[0.08] px-2 py-1 font-mono text-[10px] tracking-[0.12em] text-[#75D6C9]'
          : 'rounded-md border border-white/[0.1] bg-white/[0.03] px-2 py-1 font-mono text-[10px] tracking-[0.12em] text-[#737C88]'
      }
    >
      {value}
    </span>
  );
}

export default function OperationsPage() {
  return (
    <div className="min-h-screen bg-[#08090B] text-[#F4F5F7]">
      <Navbar />
      <main>
        <section className="border-b border-white/[0.08] px-5 py-20 sm:px-8 lg:py-28">
          <div className="mx-auto max-w-7xl">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#75D6C9]">
              Customer-service engine
            </p>
            <div className="mt-6 grid gap-12 lg:grid-cols-[1fr_.8fr] lg:items-end">
              <div>
                <h1 className="max-w-4xl text-4xl font-semibold leading-[1.03] tracking-[-0.045em] sm:text-6xl">
                  Run customer operations from the conversation outward.
                </h1>
                <p className="mt-7 max-w-2xl text-base leading-7 text-[#A1A8B3] sm:text-lg">
                  VoxDesk connects reception, lead qualification, scheduling, follow-up, support,
                  and human escalation through one controlled operating layer.
                </p>
              </div>
              <div className="rounded-[10px] border border-white/[0.1] bg-[#0D0F12] p-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#737C88]">
                  Operating objective
                </p>
                <p className="mt-4 text-xl leading-8">
                  Every interaction ends with an owner, an outcome, or an explicit reason review is
                  required.
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
                  Controlled capabilities
                </p>
                <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] sm:text-5xl">
                  A department, not an uncontrolled agent swarm.
                </h2>
              </div>
              <p className="max-w-md text-sm leading-6 text-[#737C88]">
                Each capability receives scoped context and explicit tools. Roadmap functions remain
                clearly marked.
              </p>
            </div>

            <div className="mt-12 grid overflow-hidden rounded-[10px] border border-white/[0.1] lg:grid-cols-2">
              {capabilities.map((capability, index) => {
                const Icon = capability.icon;
                return (
                  <article
                    key={capability.title}
                    className={`p-6 sm:p-8 ${index % 2 === 0 ? 'lg:border-r' : ''} ${index < capabilities.length - 2 ? 'border-b' : ''} border-white/[0.08]`}
                  >
                    <div className="flex items-start justify-between gap-5">
                      <Icon className="h-5 w-5 text-[#78AFFF]" />
                      <State value={capability.status} />
                    </div>
                    <h3 className="mt-6 text-xl font-medium">{capability.title}</h3>
                    <dl className="mt-6 space-y-5 text-sm leading-6">
                      <div className="grid grid-cols-[5.5rem_1fr] gap-3">
                        <dt className="text-[#737C88]">Event</dt>
                        <dd className="text-[#A1A8B3]">{capability.event}</dd>
                      </div>
                      <div className="grid grid-cols-[5.5rem_1fr] gap-3">
                        <dt className="text-[#737C88]">Decision</dt>
                        <dd className="text-[#A1A8B3]">{capability.decision}</dd>
                      </div>
                      <div className="grid grid-cols-[5.5rem_1fr] gap-3">
                        <dt className="text-[#737C88]">Actions</dt>
                        <dd>
                          <ul className="space-y-1 text-[#A1A8B3]">
                            {capability.actions.map(action => (
                              <li key={action}>— {action}</li>
                            ))}
                          </ul>
                        </dd>
                      </div>
                      <div className="grid grid-cols-[5.5rem_1fr] gap-3 border-t border-white/[0.08] pt-5">
                        <dt className="text-[#75D6C9]">Result</dt>
                        <dd className="text-[#DCE6F2]">{capability.result}</dd>
                      </div>
                    </dl>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="border-b border-white/[0.08] px-5 py-20 sm:px-8">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.72fr_1.28fr]">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#75D6C9]">
                Lead operations
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] sm:text-5xl">
                From inquiry to owned next action.
              </h2>
              <p className="mt-6 text-sm leading-7 text-[#A1A8B3]">
                Qualification is evidence-based. VoxDesk records the criteria, observed evidence,
                confidence, recommendation, and the server-authorized action.
              </p>
            </div>
            <ol className="overflow-hidden rounded-[10px] border border-white/[0.1]">
              {leadStages.map(([number, title, copy]) => (
                <li
                  key={number}
                  className="grid gap-3 border-b border-white/[0.08] p-5 last:border-0 sm:grid-cols-[3rem_9rem_1fr]"
                >
                  <span className="font-mono text-[10px] text-[#75D6C9]">{number}</span>
                  <strong className="text-sm font-medium">{title}</strong>
                  <span className="text-sm leading-6 text-[#737C88]">{copy}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="border-b border-white/[0.08] px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-10 lg:grid-cols-[.75fr_1.25fr]">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#D8AE69]">
                  Optional lead ecosystem
                </p>
                <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] sm:text-5xl">
                  LeadPilot and Sales Qualifier can extend the pipeline through adapters.
                </h2>
                <p className="mt-6 text-sm leading-7 text-[#A1A8B3]">
                  These integrations are not connected in the public deployment. They are
                  well-defined extension points for sourcing, enrichment, scoring, or specialist
                  qualification without bypassing VoxDesk policy and CRM authority.
                </p>
              </div>

              <div className="overflow-hidden rounded-[10px] border border-white/[0.1] bg-[#0D0F12]">
                <div className="grid gap-px bg-white/[0.08] md:grid-cols-[1fr_auto_1fr_auto_1fr]">
                  <div className="bg-[#121519] p-6">
                    <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#737C88]">
                      Optional source
                    </p>
                    <h3 className="mt-4 text-lg font-medium">LeadPilot / Sales Qualifier</h3>
                    <p className="mt-2 text-sm leading-6 text-[#737C88]">
                      Candidate lead, enrichment, qualification evidence, or workflow signal.
                    </p>
                    <div className="mt-5">
                      <State value="ADAPTER NOT CONNECTED" />
                    </div>
                  </div>
                  <div className="hidden items-center bg-[#0D0F12] px-3 md:flex">
                    <ArrowRight className="h-4 w-4 text-[#737C88]" />
                  </div>
                  <div className="bg-[#121519] p-6">
                    <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#78AFFF]">
                      VoxDesk boundary
                    </p>
                    <h3 className="mt-4 text-lg font-medium">Validate and authorize</h3>
                    <p className="mt-2 text-sm leading-6 text-[#737C88]">
                      Tenant, consent, suppression, provenance, payload policy, and idempotency.
                    </p>
                  </div>
                  <div className="hidden items-center bg-[#0D0F12] px-3 md:flex">
                    <ArrowRight className="h-4 w-4 text-[#737C88]" />
                  </div>
                  <div className="bg-[#121519] p-6">
                    <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#75D6C9]">
                      System of record
                    </p>
                    <h3 className="mt-4 text-lg font-medium">CRM and operations</h3>
                    <p className="mt-2 text-sm leading-6 text-[#737C88]">
                      Contact, opportunity, appointment, task, owner, outcome, and audit history.
                    </p>
                  </div>
                </div>
                <div className="border-t border-white/[0.08] p-6">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#75D6C9]" />
                    <p className="text-sm leading-6 text-[#A1A8B3]">
                      External lead systems may propose data or work. They do not receive
                      unrestricted CRM authority and cannot initiate outreach outside VoxDesk
                      consent, suppression, calling-window, approval, and attempt controls.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-white/[0.08] px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#78AFFF]">
              Capability maturity
            </p>
            <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-[-0.035em] sm:text-5xl">
              A controlled path to a complete customer-service department.
            </h2>
            <div className="mt-12 grid overflow-hidden rounded-[10px] border border-white/[0.1] md:grid-cols-2 lg:grid-cols-4">
              {maturity.map((stage, index) => (
                <article
                  key={stage.phase}
                  className={`p-6 ${index < maturity.length - 1 ? 'border-b border-white/[0.08] md:border-r lg:border-b-0' : ''}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    {stage.state === 'CURRENT' ? (
                      <CheckCircle2 className="h-4 w-4 text-[#75D6C9]" />
                    ) : (
                      <CircleDashed className="h-4 w-4 text-[#737C88]" />
                    )}
                    <State value={stage.state} />
                  </div>
                  <h3 className="mt-6 text-lg font-medium">{stage.phase}</h3>
                  <ul className="mt-5 space-y-3 text-sm text-[#737C88]">
                    {stage.items.map(item => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-20 sm:px-8">
          <div className="mx-auto grid max-w-7xl gap-8 rounded-[10px] border border-white/[0.1] bg-[#0D0F12] p-8 sm:p-12 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="flex items-center gap-3 text-[#75D6C9]">
                <UserRoundCheck className="h-5 w-5" />
                <span className="font-mono text-[10px] uppercase tracking-[0.14em]">
                  Human-supervised operations
                </span>
              </div>
              <h2 className="mt-5 text-3xl font-semibold tracking-[-0.035em]">
                See conversation, decision, action, and CRM effect together.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[#A1A8B3]">
                The demo exposes what the system did, what remains pending, and whether the
                interaction used simulation or a configured voice provider.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/platform"
                className="inline-flex min-h-11 items-center justify-center rounded-md border border-white/[0.13] px-5 text-sm font-medium hover:bg-white/[0.04]"
              >
                View architecture
              </Link>
              <Link
                href="/demo"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#78AFFF] px-5 text-sm font-medium text-[#08090B] hover:bg-[#91BEFF]"
              >
                Open demo <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
