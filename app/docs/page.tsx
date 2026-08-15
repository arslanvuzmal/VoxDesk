import { Navbar } from '@/components/ui/navbar';
import { Footer } from '@/components/ui/footer';
import Link from 'next/link';
import { ArrowRight, Code2, Database, GitBranch, ShieldCheck } from 'lucide-react';

// prettier-ignore
const guides = [
  { href: '/docs/architecture', title: 'Architecture', body: 'Layers, provider boundaries, canonical Conversation flow, and failure containment.', icon: GitBranch },
  { href: '/docs/crm', title: 'CRM operating model', body: 'How conversations become contacts, leads, opportunities, appointments, and tasks.', icon: Database },
  { href: '/docs/operations', title: 'Operations & readiness', body: 'Configuration, verification, simulation, activation, observability, and recovery.', icon: ShieldCheck },
];

// prettier-ignore
export default function DocsPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A]">
      <Navbar />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-10 px-6 py-12">
        <header className="max-w-4xl space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1D4ED8]">VoxDesk handbook</p>
          <h1 className="text-4xl font-bold tracking-tight">Understand the system before you activate it</h1>
          <p className="text-base leading-7 text-[#64748B]">A practical, visual guide to the architecture, CRM domain, provider responsibilities, and enterprise operating model.</p>
        </header>

        <section aria-labelledby="guides" className="grid gap-4 md:grid-cols-3">
          <h2 id="guides" className="sr-only">Documentation guides</h2>
          {guides.map(({ href, title, body, icon: Icon }) => (
            <Link key={href} href={href} className="group rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#93C5FD]">
              <Icon aria-hidden="true" className="h-5 w-5 text-[#1D4ED8]" />
              <h3 className="mt-5 font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#64748B]">{body}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#1D4ED8]">Read guide <ArrowRight aria-hidden="true" className="h-4 w-4 transition group-hover:translate-x-0.5" /></span>
            </Link>
          ))}
        </section>

        <section aria-labelledby="contracts" className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
            <Code2 aria-hidden="true" className="h-5 w-5 text-[#1D4ED8]" />
            <h2 id="contracts" className="mt-4 text-xl font-semibold">API contracts</h2>
            <p className="mt-2 text-sm leading-6 text-[#64748B]">Server-authorized routes keep provider credentials private and return explicit error envelopes.</p>
            <pre className="mt-5 overflow-x-auto rounded-lg bg-[#F8FAFC] p-4 text-xs leading-6 text-[#1D4ED8]"><code>{`POST /api/demo/session/start
POST /api/demo/voice-bootstrap
POST /api/demo/voice-finalize
POST /api/calendar/book`}</code></pre>
          </article>
          <article className="rounded-xl border border-[#E2E8F0] bg-[#0F172A] p-6 text-white shadow-sm">
            <h2 className="text-xl font-semibold">Truthful readiness</h2>
            <p className="mt-2 text-sm leading-6 text-[#CBD5E1]">A configured environment variable is not proof of provider readiness. Verify connectivity, access, signed-session authorization, and persisted outcomes.</p>
            <Link href="/docs/operations" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#93C5FD]">Read the release pipeline <ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
          </article>
        </section>
      </main>
      <Footer />
    </div>
  );
}
