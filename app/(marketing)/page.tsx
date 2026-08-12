import Link from 'next/link';
import { ArrowRight, PhoneIncoming, PhoneOutgoing, MessageSquareText, Volume2 } from 'lucide-react';
import { Navbar } from '@/components/ui/navbar';
import { Footer } from '@/components/ui/footer';

const inbound = [
  'Enquiries',
  'Scheduling',
  'Qualification',
  'Support',
  'After-hours intake',
  'Human routing',
];
const outbound = [
  'Requested callbacks',
  'Appointment reminders',
  'Customer follow-up',
  'Missing information',
  'Service updates',
  'Surveys',
];
const problems = [
  [
    '01',
    'Missed calls',
    'Demand arrives while the team is busy, off shift, or already helping someone.',
  ],
  [
    '02',
    'Manual reconstruction',
    'The transcript, calendar, inbox, and CRM rarely tell one complete story.',
  ],
  [
    '03',
    'Lost next actions',
    'Callbacks, tasks, confirmations, and handoffs disappear between systems.',
  ],
];

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#78AFFF]">{children}</p>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#08090B] text-[#F4F5F7] selection:bg-[#78AFFF]/20 selection:text-[#F4F5F7]">
      <Navbar />
      <main>
        <section id="product" className="border-b border-white/[0.08] px-5 py-20 sm:px-8 lg:py-28">
          <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
            <div className="max-w-3xl">
              <SectionLabel>Voice operations platform</SectionLabel>
              <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.02] tracking-[-0.045em] sm:text-6xl lg:text-[4.5rem]">
                Every business conversation,
                <br />
                handled and turned into action.
              </h1>
              <p className="mt-7 max-w-2xl text-base leading-7 text-[#A1A8B3] sm:text-lg">
                VoxDesk connects inbound calls, approved outbound workflows, website voice and chat
                with your CRM, calendar and team.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/demo"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#78AFFF] px-5 text-sm font-medium text-[#08090B] transition-colors hover:bg-[#91BEFF]"
                >
                  Try a Live Conversation <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/dashboard/conversations"
                  className="inline-flex min-h-11 items-center justify-center rounded-md border border-white/[0.13] bg-[#121519] px-5 text-sm font-medium text-[#F4F5F7] transition-colors hover:bg-[#15191D]"
                >
                  Explore the CRM
                </Link>
              </div>
              <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.12em] text-[#737C88]">
                Interactive demo · fictional business data
              </p>
            </div>

            <div className="overflow-hidden rounded-[10px] border border-white/[0.13] bg-[#0D0F12]">
              <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3 font-mono text-[10px] uppercase tracking-[0.12em] text-[#737C88]">
                <span>Demo transformation</span>
                <span className="text-[#75D6C9]">Conversation active</span>
              </div>
              <div className="grid md:grid-cols-[1.05fr_.8fr_.9fr]">
                <div className="border-b border-white/[0.08] p-5 md:border-b-0 md:border-r">
                  <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#737C88]">
                    Inbound call · 00:42
                  </p>
                  <p className="mt-4 text-sm font-medium">Sarah Mitchell</p>
                  <p className="mt-5 text-sm leading-6 text-[#A1A8B3]">
                    “I need to move my appointment to Thursday afternoon.”
                  </p>
                </div>
                <div className="border-b border-white/[0.08] p-5 md:border-b-0 md:border-r">
                  <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#78AFFF]">
                    Understanding
                  </p>
                  <dl className="mt-4 space-y-4 text-xs">
                    <div>
                      <dt className="text-[#737C88]">Intent</dt>
                      <dd className="mt-1">Reschedule appointment</dd>
                    </div>
                    <div>
                      <dt className="text-[#737C88]">Language</dt>
                      <dd className="mt-1">English</dd>
                    </div>
                    <div>
                      <dt className="text-[#737C88]">Customer</dt>
                      <dd className="mt-1 text-[#75D6C9]">Matched</dd>
                    </div>
                  </dl>
                </div>
                <div className="p-5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#75D6C9]">
                    CRM action
                  </p>
                  <dl className="mt-4 space-y-4 text-xs">
                    <div>
                      <dt className="text-[#737C88]">Appointment</dt>
                      <dd className="mt-1">Thursday, 3:30 PM</dd>
                    </div>
                    <div>
                      <dt className="text-[#737C88]">Next action</dt>
                      <dd className="mt-1">Confirmation</dd>
                    </div>
                    <div>
                      <dt className="text-[#737C88]">CRM</dt>
                      <dd className="mt-1 text-[#75D6C9]">Updated</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-white/[0.08] px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <SectionLabel>Where operations break</SectionLabel>
            <div className="mt-5 grid gap-10 lg:grid-cols-[1.1fr_.9fr]">
              <h2 className="max-w-3xl text-3xl font-semibold leading-tight tracking-[-0.035em] sm:text-5xl">
                Business conversations break down when the action afterwards is manual.
              </h2>
              <div className="border-t border-white/[0.13]">
                {problems.map(([number, title, copy]) => (
                  <article
                    key={number}
                    className="grid grid-cols-[2.5rem_1fr] gap-3 border-b border-white/[0.08] py-5"
                  >
                    <span className="font-mono text-[10px] text-[#78AFFF]">{number}</span>
                    <div>
                      <h3 className="text-sm font-medium">{title}</h3>
                      <p className="mt-2 text-sm leading-6 text-[#737C88]">{copy}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="solutions" className="border-b border-white/[0.08] px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <SectionLabel>Direction matters</SectionLabel>
            <h2 className="mt-5 max-w-3xl text-3xl font-semibold tracking-[-0.035em] sm:text-5xl">
              One platform for conversations coming in and going out.
            </h2>
            <div className="mt-12 grid overflow-hidden rounded-[10px] border border-white/[0.1] lg:grid-cols-[1fr_12rem_1fr]">
              <div id="inbound" className="p-6 sm:p-8">
                <PhoneIncoming className="h-5 w-5 text-[#75D6C9]" />
                <h3 className="mt-5 text-xl font-medium">Inbound</h3>
                <ul className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 text-sm text-[#A1A8B3]">
                  {inbound.map(item => (
                    <li key={item} className="border-t border-white/[0.08] pt-3">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex items-center justify-center border-y border-white/[0.08] bg-[#0D0F12] px-4 py-8 font-mono text-[11px] uppercase tracking-[0.16em] text-[#78AFFF] lg:border-x lg:border-y-0">
                ← VoxDesk →
              </div>
              <div id="outbound" className="p-6 sm:p-8">
                <PhoneOutgoing className="h-5 w-5 text-[#78AFFF]" />
                <h3 className="mt-5 text-xl font-medium">Approved outbound</h3>
                <ul className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 text-sm text-[#A1A8B3]">
                  {outbound.map(item => (
                    <li key={item} className="border-t border-white/[0.08] pt-3">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="mt-4 max-w-3xl text-xs leading-5 text-[#737C88]">
              Outbound workflows require configured consent, suppression, calling-window, caller-ID
              and approval controls. Availability depends on provider readiness.
            </p>
          </div>
        </section>

        <section id="integrations" className="border-b border-white/[0.08] px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <SectionLabel>One operational record</SectionLabel>
            <div className="mt-10 overflow-hidden rounded-[10px] border border-white/[0.1] bg-[#0D0F12] p-6 sm:p-10">
              <div className="grid gap-7 text-sm md:grid-cols-[1fr_auto_1fr] md:items-center">
                <div className="space-y-3 text-[#A1A8B3]">
                  <p>
                    <Volume2 className="mr-2 inline h-4 w-4 text-[#78AFFF]" />
                    Website voice
                  </p>
                  <p>
                    <PhoneIncoming className="mr-2 inline h-4 w-4 text-[#78AFFF]" />
                    Inbound phone
                  </p>
                  <p>
                    <PhoneOutgoing className="mr-2 inline h-4 w-4 text-[#78AFFF]" />
                    Outbound phone
                  </p>
                  <p>
                    <MessageSquareText className="mr-2 inline h-4 w-4 text-[#78AFFF]" />
                    Web chat
                  </p>
                </div>
                <div className="font-mono text-xs uppercase tracking-[0.15em] text-[#78AFFF]">
                  → VoxDesk →
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <span>Contact</span>
                  <span>Appointment</span>
                  <span>Opportunity</span>
                  <span>Task</span>
                  <span>Follow-up</span>
                  <span>Human team</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="enterprise" className="px-5 py-20 sm:px-8 lg:py-28">
          <div className="mx-auto max-w-5xl rounded-[10px] border border-white/[0.13] bg-[#121519] px-6 py-14 text-center sm:px-12">
            <SectionLabel>Human conversation, structured operations</SectionLabel>
            <h2 className="mx-auto mt-5 max-w-3xl text-3xl font-semibold tracking-[-0.035em] sm:text-5xl">
              See how one conversation becomes organized work.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-6 text-[#A1A8B3]">
              Use the fictional live demo, then inspect the same operational model in the workspace.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/demo"
                className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#78AFFF] px-5 text-sm font-medium text-[#08090B]"
              >
                Try a Live Conversation
              </Link>
              <Link
                href="/dashboard/conversations"
                className="inline-flex min-h-11 items-center justify-center rounded-md border border-white/[0.13] px-5 text-sm font-medium"
              >
                Explore the CRM
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
