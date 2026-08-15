import { Navbar } from '@/components/ui/navbar';
import { Footer } from '@/components/ui/footer';
import Link from 'next/link';
import { ArrowRight, CircleCheck, ShieldCheck } from 'lucide-react';

const stages = [
  ['Configure', 'Environment values are present but never prove readiness.'],
  ['Verify', 'Provider access, database, and queues are actively checked.'],
  ['Simulate', 'Qualification, booking, handoff, failure, and opt-out paths run without paid calls.'],
  ['Activate', 'Only authorized test resources can unlock live telephony.'],
  ['Observe', 'Events, retries, leases, and reconciliation remain visible.'],
];

export default function OperationsDocsPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A]">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl space-y-10 px-6 py-12">
        <header className="max-w-4xl space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#B45309]">Runbooks & controls</p>
          <h1 className="text-4xl font-bold tracking-tight">Enterprise readiness is a sequence, not a toggle</h1>
          <p className="text-base leading-7 text-[#64748B]">Use this page to separate what is configured, what is verified, and what is safe to activate.</p>
        </header>

        <section aria-labelledby="release-pipeline" className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
          <h2 id="release-pipeline" className="text-xl font-semibold">Activation pipeline</h2>
          <div className="mt-7 space-y-3">
            {stages.map(([title, body], index) => (
              <div key={title} className="flex flex-col gap-3 rounded-lg border border-[#E2E8F0] p-4 sm:flex-row sm:items-center">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FEF3C7] text-sm font-bold text-[#92400E]">0{index + 1}</div>
                <div className="min-w-0 flex-1"><h3 className="font-semibold">{title}</h3><p className="mt-1 text-sm text-[#64748B]">{body}</p></div>
                <ArrowRight className="hidden h-4 w-4 text-[#94A3B8] sm:block" aria-hidden="true" />
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="controls" className="grid gap-6 lg:grid-cols-3">
          <article className="rounded-xl border border-[#E2E8F0] bg-white p-6">
            <ShieldCheck className="h-5 w-5 text-[#1D4ED8]" aria-hidden="true" />
            <h2 id="controls" className="mt-4 font-semibold">Security controls</h2>
            <p className="mt-2 text-sm leading-6 text-[#64748B]">Fail closed on missing secrets, authorize by workspace, redact logs, and keep provider credentials server-only.</p>
          </article>
          <article className="rounded-xl border border-[#E2E8F0] bg-white p-6">
            <CircleCheck className="h-5 w-5 text-[#15803D]" aria-hidden="true" />
            <h2 className="mt-4 font-semibold">Verification evidence</h2>
            <p className="mt-2 text-sm leading-6 text-[#64748B]">Record the exact deployment SHA, provider IDs, event IDs, database rows, and outcome—never infer success from a green UI.</p>
          </article>
          <article className="rounded-xl border border-[#E2E8F0] bg-white p-6">
            <ShieldCheck className="h-5 w-5 text-[#B45309]" aria-hidden="true" />
            <h2 className="mt-4 font-semibold">Recovery posture</h2>
            <p className="mt-2 text-sm leading-6 text-[#64748B]">Persist webhook events, retry bounded jobs, recover stale leases, and preserve a dead-letter path.</p>
          </article>
        </section>

        <section className="rounded-xl border border-[#FCD34D] bg-[#FFFBEB] p-6">
          <h2 className="font-semibold text-[#78350F]">Current provider note</h2>
          <p className="mt-2 text-sm leading-6 text-[#92400E]">The Preview Agent ID currently returns ElevenLabs HTTP 404. Update the Agent ID and API key as a matching pair before calling this pipeline verified.</p>
        </section>

        <Link href="/docs/architecture" className="inline-flex items-center gap-2 text-sm font-semibold text-[#1D4ED8]">Back to architecture <ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
      </main>
      <Footer />
    </div>
  );
}
