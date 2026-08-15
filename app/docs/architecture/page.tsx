import { Navbar } from '@/components/ui/navbar';
import { Footer } from '@/components/ui/footer';
import Link from 'next/link';
import { ArrowRight, Database, LockKeyhole, Radio, Workflow } from 'lucide-react';

// prettier-ignore
const layers = [
  { title: 'Channels', body: 'Web Voice, simulated sessions, inbound PSTN, outbound campaigns.', icon: Radio, tone: 'border-blue-200 bg-blue-50 text-blue-700' },
  { title: 'Orchestration', body: 'Authenticated session, policy checks, tool authorization, idempotency.', icon: Workflow, tone: 'border-violet-200 bg-violet-50 text-violet-700' },
  { title: 'Canonical domain', body: 'Conversation is the source of truth; calls project into it.', icon: Database, tone: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
  { title: 'Controls', body: 'Tenant isolation, secrets, leases, webhooks, audit events, recovery.', icon: LockKeyhole, tone: 'border-amber-200 bg-amber-50 text-amber-700' },
];

// prettier-ignore
export default function ArchitectureDocsPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A]">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl space-y-10 px-6 py-12">
        <header className="max-w-4xl space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1D4ED8]">Enterprise architecture</p>
          <h1 className="text-4xl font-bold tracking-tight">How VoxDesk becomes an operational system</h1>
          <p className="max-w-3xl text-base leading-7 text-[#64748B]">
            VoxDesk is organized around one canonical Conversation record. A customer can arrive through
            simulation, Web Voice, or telephony; every authorized action and outcome converges on the same
            domain model for CRM, reporting, and recovery.
          </p>
        </header>

        <section aria-labelledby="architecture-layers" className="space-y-4">
          <h2 id="architecture-layers" className="text-xl font-semibold">The four-layer boundary model</h2>
          <div className="grid gap-4 md:grid-cols-4">
            {layers.map(({ title, body, icon: Icon, tone }) => (
              <article key={title} className={`rounded-xl border p-5 ${tone}`}>
                <Icon aria-hidden="true" className="h-5 w-5" />
                <h3 className="mt-4 font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#475569]">{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="request-pipeline" className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="request-pipeline" className="text-xl font-semibold">Request-to-CRM pipeline</h2>
              <p className="mt-1 text-sm text-[#64748B]">Each boundary has an explicit owner and failure mode.</p>
            </div>
            <span className="rounded-full bg-[#FEF3C7] px-3 py-1 text-xs font-semibold text-[#92400E]">Simulation-safe default</span>
          </div>
          <div className="mt-8 grid gap-3 lg:grid-cols-7 lg:items-center">
            {['Customer', 'Channel', 'Policy gate', 'Conversation', 'Authorized tool', 'CRM projection', 'Evaluation'].map((step, index, all) => (
              <div key={step} className="contents">
                <div className="rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] p-4 text-center">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">0{index + 1}</p>
                  <p className="mt-2 text-sm font-semibold">{step}</p>
                </div>
                {index < all.length - 1 && <ArrowRight aria-hidden="true" className="mx-auto hidden h-4 w-4 text-[#94A3B8] lg:block" />}
              </div>
            ))}
          </div>
          <pre className="mt-8 overflow-x-auto rounded-lg bg-[#0F172A] p-5 text-xs leading-6 text-[#DBEAFE]"><code>{`sequenceDiagram
  participant C as Customer
  participant V as VoxDesk
  participant P as Provider or Simulation
  participant D as Conversation domain
  participant CRM as CRM projections
  C->>V: authenticated session
  V->>P: provider/session request
  P-->>V: transcript and events
  V->>D: idempotent upsert
  D->>CRM: contact, lead, opportunity, task
  CRM-->>V: durable outcome`}</code></pre>
        </section>

        <section aria-labelledby="production-boundaries" className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-xl border border-[#E2E8F0] bg-white p-6">
            <h2 id="production-boundaries" className="text-xl font-semibold">Provider responsibilities</h2>
            <dl className="mt-5 space-y-4 text-sm">
              <div><dt className="font-semibold text-[#0F172A]">ElevenLabs</dt><dd className="mt-1 leading-6 text-[#64748B]">Speech/conversation runtime and authoritative provider transcript after completion.</dd></div>
              <div><dt className="font-semibold text-[#0F172A]">Telnyx</dt><dd className="mt-1 leading-6 text-[#64748B]">PSTN transport, numbers, carrier events, and controlled call initiation.</dd></div>
              <div><dt className="font-semibold text-[#0F172A]">VoxDesk</dt><dd className="mt-1 leading-6 text-[#64748B]">Authorization, policy, persistence, reconciliation, CRM actions, and tenant isolation.</dd></div>
            </dl>
          </article>
          <article className="rounded-xl border border-[#E2E8F0] bg-white p-6">
            <h2 className="text-xl font-semibold">Failure containment</h2>
            <ul className="mt-5 space-y-3 text-sm leading-6 text-[#64748B]">
              <li><strong className="text-[#0F172A]">Before a call:</strong> missing secrets or an unverified agent fail closed.</li>
              <li><strong className="text-[#0F172A]">During a call:</strong> tool authorization and idempotency keys bound side effects.</li>
              <li><strong className="text-[#0F172A]">After a call:</strong> provider events reconcile into one conversation.</li>
              <li><strong className="text-[#0F172A]">During outages:</strong> durable events and retryable jobs preserve recovery context.</li>
            </ul>
          </article>
        </section>

        <Link href="/docs/crm" className="inline-flex items-center gap-2 text-sm font-semibold text-[#1D4ED8]">Explore the CRM model <ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
      </main>
      <Footer />
    </div>
  );
}
