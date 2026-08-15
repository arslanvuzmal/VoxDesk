import { Navbar } from '@/components/ui/navbar';
import { Footer } from '@/components/ui/footer';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, CircleDot, UsersRound } from 'lucide-react';

const records = [
  ['Contact', 'Person or organization identity', 'Conversation, consent, suppression'],
  ['Lead', 'Qualified demand and lifecycle state', 'Source, score, owner'],
  ['Opportunity', 'Commercial intent and value', 'Stage, amount, close date'],
  ['Appointment', 'Confirmed or pending calendar action', 'Time, timezone, status'],
  ['Task / Follow-up', 'Human work created by the interaction', 'Assignee, due time, completion'],
  ['Handoff', 'Escalation requiring a human operator', 'Reason, owner, resolution'],
];

export default function CrmDocsPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A]">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl space-y-10 px-6 py-12">
        <header className="max-w-4xl space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#15803D]">CRM operating model</p>
          <h1 className="text-4xl font-bold tracking-tight">From conversation to customer operations</h1>
          <p className="text-base leading-7 text-[#64748B]">The CRM is not a separate notes screen. It is the durable projection of authorized conversation outcomes, scoped to the active workspace.</p>
        </header>

        <section aria-labelledby="crm-loop" className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
          <h2 id="crm-loop" className="text-xl font-semibold">The CRM loop</h2>
          <div className="mt-7 grid gap-3 md:grid-cols-5 md:items-center">
            {[
              ['1', 'Understand', 'Transcript and structured fields'],
              ['2', 'Qualify', 'Intent, consent, and eligibility'],
              ['3', 'Act', 'Authorized calendar or CRM tool'],
              ['4', 'Project', 'Contact, lead, opportunity, task'],
              ['5', 'Review', 'Human handoff and evaluation'],
            ].map(([number, title, body], index, all) => (
              <div key={title} className="contents">
                <div className="rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] p-4">
                  <div className="flex items-center gap-2 text-[#15803D]"><CircleDot aria-hidden="true" className="h-4 w-4" /><span className="text-xs font-semibold">STEP {number}</span></div>
                  <h3 className="mt-3 font-semibold">{title}</h3>
                  <p className="mt-1 text-sm leading-5 text-[#475569]">{body}</p>
                </div>
                {index < all.length - 1 && <ArrowRight aria-hidden="true" className="mx-auto hidden h-4 w-4 text-[#94A3B8] md:block" />}
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="record-map">
          <div className="mb-4 flex items-center gap-3"><UsersRound aria-hidden="true" className="h-5 w-5 text-[#15803D]" /><h2 id="record-map" className="text-xl font-semibold">Record map</h2></div>
          <div className="overflow-x-auto rounded-xl border border-[#E2E8F0] bg-white">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[#F8FAFC] text-xs uppercase tracking-wide text-[#64748B]"><tr><th className="px-5 py-3">Record</th><th className="px-5 py-3">Purpose</th><th className="px-5 py-3">Typical evidence</th></tr></thead>
              <tbody className="divide-y divide-[#E2E8F0]">{records.map(([record, purpose, evidence]) => <tr key={record}><th scope="row" className="px-5 py-4 font-semibold">{record}</th><td className="px-5 py-4 text-[#475569]">{purpose}</td><td className="px-5 py-4 text-[#475569]">{evidence}</td></tr>)}</tbody>
            </table>
          </div>
        </section>

        <section aria-labelledby="crm-invariants" className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-xl border border-[#E2E8F0] bg-white p-6">
            <h2 id="crm-invariants" className="text-xl font-semibold">Enterprise invariants</h2>
            <ul className="mt-5 space-y-3 text-sm leading-6 text-[#64748B]">
              <li className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[#15803D]" aria-hidden="true" /><span>Every query is scoped by workspace before data leaves the server.</span></li>
              <li className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[#15803D]" aria-hidden="true" /><span>Encrypted values stay server-side; browsers receive only masked operational fields.</span></li>
              <li className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[#15803D]" aria-hidden="true" /><span>Side effects use idempotency keys to prevent duplicate contacts or appointments.</span></li>
            </ul>
          </article>
          <article className="rounded-xl border border-[#E2E8F0] bg-[#0F172A] p-6 text-white">
            <h2 className="text-xl font-semibold">Operator view</h2>
            <p className="mt-3 text-sm leading-6 text-[#CBD5E1]">An operator should be able to answer: what happened, what was promised, what is blocked, and what must happen next—without reading raw provider internals.</p>
            <Link href="/dashboard/conversations" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#93C5FD]">Open conversations <ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
          </article>
        </section>
      </main>
      <Footer />
    </div>
  );
}
