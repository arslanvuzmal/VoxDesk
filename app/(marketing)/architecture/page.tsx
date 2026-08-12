import { Activity, Database, LockKeyhole, Phone, ShieldCheck, Sparkles, Users } from 'lucide-react';
import { Navbar } from '@/components/ui/navbar';

const layers = [
  ['Customer channels', 'Web voice · Web chat · PSTN/SIP · approved campaigns', Phone, 'text-[#6EE7F9]'],
  ['Conversation intelligence', 'ElevenLabs realtime voice, turns, transcript and agent context', Sparkles, 'text-[#A78BFA]'],
  ['VoxDesk orchestration', 'Tenant context, policy checks, authorized tools and workflow state', ShieldCheck, 'text-[#7C8CFF]'],
  ['Business operations', 'Contacts · appointments · opportunities · tasks · handoffs', Users, 'text-[#6EF3B0]'],
  ['Persistence and quality', 'PostgreSQL CRM state, audit records, analytics and supervised review', Database, 'text-[#FBBF24]'],
] as const;

export default function ArchitecturePage() {
  return (
    <div className="min-h-screen bg-[#080C12] text-[#F1F5F9]">
      <Navbar />
      <main className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24">
        <header className="max-w-3xl">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#6EE7F9]">
            Platform architecture
          </span>
          <h1 className="mt-5 text-4xl font-semibold tracking-[-0.045em] sm:text-6xl">
            One conversation layer. Every operational consequence.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-[#94A3B8]">
            VoxDesk separates realtime conversation intelligence from business state. The model can
            request an action; the server validates, authorizes, executes, and records it.
          </p>
        </header>
        <section className="mt-14 grid gap-3 lg:grid-cols-[1fr_280px]">
          <div className="space-y-3">
            {layers.map(([label, detail, Icon, tone], index) => (
              <article key={label} className="flex items-start gap-4 border border-white/[0.09] bg-[#101826] p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-white/[0.1] bg-[#172233]">
                  <Icon className={'h-5 w-5 ' + tone} />
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#64748B]">
                    0{index + 1}
                  </p>
                  <h2 className="mt-1 text-lg font-medium">{label}</h2>
                  <p className="mt-2 text-sm leading-6 text-[#94A3B8]">{detail}</p>
                </div>
              </article>
            ))}
          </div>
          <aside className="space-y-3">
            <div className="border border-[#FBBF24]/25 bg-[#FBBF24]/[0.06] p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#FBBF24]">Portfolio mode</p>
              <h2 className="mt-3 text-lg font-medium">Simulation ready</h2>
              <p className="mt-2 text-sm leading-6 text-[#94A3B8]">
                The public deployment exercises the same state and CRM boundaries without placing paid PSTN calls.
              </p>
            </div>
            <div className="border border-white/[0.09] bg-[#101826] p-5">
              <div className="flex items-center gap-2 text-sm font-medium"><LockKeyhole className="h-4 w-4 text-[#6EF3B0]" />Security boundary</div>
              <ul className="mt-4 space-y-3 text-xs leading-5 text-[#94A3B8]">
                <li>Server-owned tool authorization</li><li>Workspace-scoped persistence</li><li>Signed provider events</li><li>Idempotent consequential actions</li>
              </ul>
            </div>
            <div className="border border-white/[0.09] bg-[#101826] p-5">
              <div className="flex items-center gap-2 text-sm font-medium"><Activity className="h-4 w-4 text-[#7C8CFF]" />Provider roles</div>
              <dl className="mt-4 space-y-3 text-xs">
                <div><dt className="text-[#64748B]">ElevenLabs</dt><dd className="mt-1 text-[#DCE6F2]">Conversational intelligence</dd></div>
                <div><dt className="text-[#64748B]">Telnyx</dt><dd className="mt-1 text-[#DCE6F2]">PSTN and SIP infrastructure</dd></div>
                <div><dt className="text-[#64748B]">VoxDesk</dt><dd className="mt-1 text-[#DCE6F2]">Operations, CRM, policy and analytics</dd></div>
              </dl>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}