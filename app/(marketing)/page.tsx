import Link from 'next/link';
import { Navbar } from '@/components/ui/navbar';
import { Footer } from '@/components/ui/footer';
import { IndustrySelector } from '@/components/home/industry-selector';
import { ImpactEstimator } from '@/components/home/impact-estimator';
import {
  ArrowRight,
  Phone,
  Calendar,
  Users,
  PhoneForwarded,
  ShieldCheck,
  Globe,
  Briefcase,
  Layers,
  CheckCircle2,
  PhoneCall,
  Clock,
  UserCheck,
  Building2,
  FileText,
  Lock,
  Server,
  Zap,
  Bot,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A] selection:bg-[#1D4ED8] selection:text-white">
      <Navbar />

      {/* SECTION 2 — HERO (Left Copy / Right Product Composition) */}
      <section id="product" className="pt-16 pb-20 px-6 border-b border-[#E2E8F0] bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column (6 cols): Copy & CTAs */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFF6FF] border border-[#1D4ED8]/20 text-xs font-semibold text-[#1D4ED8]">
              <span>Voice operations for modern businesses</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#0F172A] leading-tight">
              Every business call, answered and turned into action.
            </h1>

            <p className="text-base sm:text-lg text-[#475569] font-normal leading-relaxed">
              VoxDesk connects voice conversations with your website, phone system, calendar and
              CRM. It can handle routine enquiries, qualify sales opportunities, schedule
              appointments and prepare human handoffs from one operational workspace.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <Link
                href="/demo"
                className="w-full sm:w-auto bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-bold text-sm px-6 py-3.5 rounded-lg flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Try the live voice demo</span>
              </Link>

              <Link
                href="/#workflow"
                className="w-full sm:w-auto bg-white hover:bg-[#F8FAFC] text-[#0F172A] font-semibold text-sm px-6 py-3.5 rounded-lg border border-[#CBD5E1] flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <span>See how it connects</span>
                <ArrowRight className="w-4 h-4 text-[#64748B]" />
              </Link>
            </div>

            <p className="text-xs text-[#64748B] font-mono">
              Interactive demonstration using fictional business data.
            </p>
          </div>

          {/* Right Column (6 cols): Realistic Product Screenshot Frame */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-xl border border-[#CBD5E1] shadow-lg overflow-hidden space-y-0">
              {/* Product Window Topbar */}
              <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#EF4444]" />
                  <span className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                  <span className="w-3 h-3 rounded-full bg-[#10B981]" />
                  <span className="text-xs font-mono text-[#64748B] ml-2">
                    VoxDesk Live Call Inbox
                  </span>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#F0FDF4] text-[#15803D] border border-[#15803D]/20">
                  Active Session
                </span>
              </div>

              {/* Product Surface Data Card */}
              <div className="p-5 space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                  <div>
                    <p className="font-bold text-[#0F172A] text-sm">Sarah Miller</p>
                    <p className="text-[11px] text-[#64748B] font-mono">
                      +1 (555) 234-5678 • Corporate Retainer Inquiry
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-[#EFF6FF] text-[#1D4ED8] font-mono font-semibold border border-[#1D4ED8]/20">
                    BANT Score: 85/100
                  </span>
                </div>

                <div className="space-y-2">
                  <p className="text-[11px] font-bold text-[#64748B] uppercase">
                    Live Voice Transcript Summary
                  </p>
                  <p className="p-3 rounded-md bg-[#F8FAFC] border border-[#E2E8F0] text-[#334155] leading-relaxed">
                    &quot;Caller requested legal representation for a commercial contract dispute.
                    Verified budget authority and booked consultation slot for Thursday 2:00
                    PM.&quot;
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-2.5 rounded bg-[#F8FAFC] border border-[#E2E8F0]">
                    <span className="text-[10px] text-[#64748B] uppercase block">
                      Appointment Status
                    </span>
                    <span className="font-bold text-[#15803D] flex items-center gap-1 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed (Aug 8)
                    </span>
                  </div>
                  <div className="p-2.5 rounded bg-[#F8FAFC] border border-[#E2E8F0]">
                    <span className="text-[10px] text-[#64748B] uppercase block">Next Action</span>
                    <span className="font-bold text-[#1D4ED8] flex items-center gap-1 mt-0.5">
                      <UserCheck className="w-3.5 h-3.5" /> Senior Partner Review
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 — TRUSTED DEPLOYMENT SURFACES */}
      <section className="py-12 px-6 bg-[#F8FAFC] border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto space-y-6">
          <p className="text-center text-xs font-bold text-[#64748B] uppercase tracking-wider">
            Works across the channels your business already uses
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] flex items-center gap-3 shadow-sm">
              <Globe className="w-5 h-5 text-[#1D4ED8] shrink-0" />
              <div>
                <p className="font-bold text-[#0F172A]">Website</p>
                <p className="text-[11px] text-[#64748B]">Embedded web voice widget</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] flex items-center gap-3 shadow-sm">
              <Phone className="w-5 h-5 text-[#1D4ED8] shrink-0" />
              <div>
                <p className="font-bold text-[#0F172A]">Phone System</p>
                <p className="text-[11px] text-[#64748B]">Twilio / SIP telephony</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] flex items-center gap-3 shadow-sm">
              <Users className="w-5 h-5 text-[#1D4ED8] shrink-0" />
              <div>
                <p className="font-bold text-[#0F172A]">CRM Systems</p>
                <p className="text-[11px] text-[#64748B]">HubSpot, Salesforce, Clio</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] flex items-center gap-3 shadow-sm">
              <Calendar className="w-5 h-5 text-[#1D4ED8] shrink-0" />
              <div>
                <p className="font-bold text-[#0F172A]">Calendars</p>
                <p className="text-[11px] text-[#64748B]">Google Calendar, Outlook</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4 — FROM CONVERSATION TO BUSINESS ACTION */}
      <section id="workflow" className="py-20 px-6 bg-white border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-[#0F172A] tracking-tight">
              One conversation. A complete operational record.
            </h2>
            <p className="text-sm text-[#64748B]">
              Every customer voice interaction is processed through 7 structured operational steps.
            </p>
          </div>

          {/* 7-Step Horizontal Workflow Visualization */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 text-xs">
            {[
              {
                step: '1',
                title: 'Customer Call',
                desc: 'Inbound phone or web voice',
              },
              {
                step: '2',
                title: 'Intent Identification',
                desc: 'AI maps caller need',
              },
              {
                step: '3',
                title: 'Approved Knowledge',
                desc: 'Grounded RAG retrieval',
              },
              {
                step: '4',
                title: 'Detail Collection',
                desc: 'BANT qualification fields',
              },
              {
                step: '5',
                title: 'Action Selection',
                desc: 'Booking or escalation',
              },
              {
                step: '6',
                title: 'CRM Sync',
                desc: 'Record written to workspace',
              },
              {
                step: '7',
                title: 'Human Handoff',
                desc: 'Team takes over if needed',
              },
            ].map(item => (
              <div
                key={item.step}
                className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-1"
              >
                <span className="w-5 h-5 rounded-full bg-[#1D4ED8] text-white text-[10px] font-bold flex items-center justify-center">
                  {item.step}
                </span>
                <p className="font-bold text-[#0F172A] mt-2">{item.title}</p>
                <p className="text-[11px] text-[#64748B]">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Clean System Diagram */}
          <div className="p-6 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-xs space-y-4">
            <p className="font-bold text-[#0F172A] text-center uppercase tracking-wider text-[11px]">
              System Architecture Diagram
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 text-center font-medium">
              <span className="px-3 py-1.5 rounded-md bg-white border border-[#CBD5E1] text-[#0F172A] shadow-sm">
                Website or Phone Surface
              </span>
              <span className="text-[#1D4ED8] font-bold">&rarr;</span>
              <span className="px-3 py-1.5 rounded-md bg-white border border-[#CBD5E1] text-[#0F172A] shadow-sm">
                Voice Conversation Layer
              </span>
              <span className="text-[#1D4ED8] font-bold">&rarr;</span>
              <span className="px-3 py-1.5 rounded-md bg-[#EFF6FF] border border-[#1D4ED8]/30 text-[#1D4ED8] font-bold shadow-sm">
                Business Rules & Knowledge
              </span>
              <span className="text-[#1D4ED8] font-bold">&rarr;</span>
              <span className="px-3 py-1.5 rounded-md bg-white border border-[#CBD5E1] text-[#0F172A] shadow-sm">
                Booking / Qualification / Handoff
              </span>
              <span className="text-[#1D4ED8] font-bold">&rarr;</span>
              <span className="px-3 py-1.5 rounded-md bg-[#F0FDF4] border border-[#15803D]/30 text-[#15803D] font-bold shadow-sm">
                CRM & Workspace Analytics
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5 — BUSINESS IMPACT EXPLORER */}
      <section id="solutions" className="py-20 px-6 bg-[#F8FAFC] border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-[#0F172A] tracking-tight">
              See how VoxDesk fits your operation.
            </h2>
            <p className="text-sm text-[#64748B]">
              Explore pre-configured operational templates, information requirements, and human
              handoff rules.
            </p>
          </div>

          <IndustrySelector />
        </div>
      </section>

      {/* SECTION 6 — OPERATIONAL IMPACT VISUALIZATION */}
      <section className="py-20 px-6 bg-white border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-[#0F172A] tracking-tight">
              Understand the operational effect before you deploy.
            </h2>
            <p className="text-sm text-[#64748B]">
              Adjust your monthly call parameters below to calculate transparent operational
              estimates.
            </p>
          </div>

          <ImpactEstimator />
        </div>
      </section>

      {/* SECTION 7 — INBOUND AND OUTBOUND */}
      <section className="py-20 px-6 bg-[#F8FAFC] border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-[#0F172A] tracking-tight">
              Built for conversations coming in—and approved workflows going out.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
            {/* Inbound Panel */}
            <div className="p-6 rounded-xl bg-white border border-[#E2E8F0] space-y-4 shadow-sm">
              <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-3">
                <PhoneCall className="w-5 h-5 text-[#15803D]" />
                <h3 className="text-sm font-bold text-[#0F172A]">Inbound Answering Workflows</h3>
              </div>
              <p className="text-[#64748B] leading-relaxed">
                Customer calls &rarr; VoxDesk answers immediately &rarr; intent identified &rarr;
                approved questions answered &rarr; intake details collected &rarr; appointment or
                handoff prepared &rarr; conversation added to CRM.
              </p>
              <ul className="space-y-2 text-[#475569]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D]" /> 24/7 Enquiry Handling
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D]" /> Automated Consultation
                  Booking
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D]" /> Lead BANT Qualification
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D]" /> Immediate Operator Handoff
                </li>
              </ul>
            </div>

            {/* Outbound Panel */}
            <div className="p-6 rounded-xl bg-white border border-[#E2E8F0] space-y-4 shadow-sm">
              <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-3">
                <PhoneForwarded className="w-5 h-5 text-[#1D4ED8]" />
                <h3 className="text-sm font-bold text-[#0F172A]">Approved Outbound Workflows</h3>
              </div>
              <p className="text-[#64748B] leading-relaxed">
                Approved trigger &rarr; contact & consent validated &rarr; call initiated &rarr;
                conversation completed &rarr; outcome recorded &rarr; follow-up or escalation
                created.
              </p>
              <ul className="space-y-2 text-[#475569]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#1D4ED8]" /> Appointment Reminder
                  Alerts
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#1D4ED8]" /> Approved Lead Callback
                  Follow-ups
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#1D4ED8]" /> Missing Document Reminders
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#1D4ED8]" /> Post-Consultation Surveys
                </li>
              </ul>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-[#FFFBEB] border border-[#FCD34D] text-xs text-[#78350F] flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-[#B45309] shrink-0" />
            <p>
              <strong>Compliance Notice:</strong> Outbound calling must follow applicable consent,
              disclosure, do-not-call and jurisdictional requirements. VoxDesk does not initiate
              automated campaigns without explicit system authorization.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 8 — ADD VOXDESK TO A WEBSITE */}
      <section className="py-20 px-6 bg-white border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-[#0F172A] tracking-tight">
              Add voice assistance to an existing website without rebuilding it.
            </h2>
            <p className="text-sm text-[#64748B]">
              Integrated into compatible websites through a widget, SDK or custom web
              implementation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div className="p-5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
              <span className="w-6 h-6 rounded bg-[#1D4ED8] text-white font-bold flex items-center justify-center text-xs">
                1
              </span>
              <h3 className="font-bold text-[#0F172A] text-sm">Website Widget</h3>
              <p className="text-[#64748B]">
                Compact, lightweight voice control component added to any site via script tag.
              </p>
              <span className="inline-block font-mono text-[10px] text-[#15803D] px-2 py-0.5 rounded bg-[#F0FDF4] border border-[#15803D]/20">
                Live in Demo
              </span>
            </div>

            <div className="p-5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
              <span className="w-6 h-6 rounded bg-[#1D4ED8] text-white font-bold flex items-center justify-center text-xs">
                2
              </span>
              <h3 className="font-bold text-[#0F172A] text-sm">Custom React SDK</h3>
              <p className="text-[#64748B]">
                Fully branded conversation experience embedded within custom React web apps.
              </p>
              <span className="inline-block font-mono text-[10px] text-[#1D4ED8] px-2 py-0.5 rounded bg-[#EFF6FF] border border-[#1D4ED8]/20">
                Configurable
              </span>
            </div>

            <div className="p-5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
              <span className="w-6 h-6 rounded bg-[#1D4ED8] text-white font-bold flex items-center justify-center text-xs">
                3
              </span>
              <h3 className="font-bold text-[#0F172A] text-sm">Secure Signed Sessions</h3>
              <p className="text-[#64748B]">
                Server-authorized WebRTC token sessions for controlled enterprise deployment.
              </p>
              <span className="inline-block font-mono text-[10px] text-[#15803D] px-2 py-0.5 rounded bg-[#F0FDF4] border border-[#15803D]/20">
                Live in Demo
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 9 — PHONE SYSTEM CONNECTION */}
      <section className="py-20 px-6 bg-[#F8FAFC] border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-[#0F172A] tracking-tight">
              Connect VoxDesk to the phone workflows your business already uses.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] space-y-2 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#0F172A]">Twilio Phone Number</span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#EFF6FF] text-[#1D4ED8] border border-[#1D4ED8]/20">
                  Configurable
                </span>
              </div>
              <p className="text-[#64748B]">Direct inbound telephone line connected via webhook.</p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] space-y-2 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#0F172A]">Existing Telephony</span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#FFFBEB] text-[#B45309] border border-[#B45309]/20">
                  Requires Setup
                </span>
              </div>
              <p className="text-[#64748B]">
                Forward existing office lines to VoxDesk voice agent.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] space-y-2 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#0F172A]">SIP Trunk Integration</span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#F1F5F9] text-[#64748B] border border-[#CBD5E1]">
                  Planned
                </span>
              </div>
              <p className="text-[#64748B]">Enterprise PBX & Voice Gateway connection.</p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] space-y-2 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#0F172A]">Browser Voice Demo</span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#F0FDF4] text-[#15803D] border border-[#15803D]/20">
                  Live
                </span>
              </div>
              <p className="text-[#64748B]">
                Test immediate voice calls directly inside web browser.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 11 — ENTERPRISE SCALING */}
      <section id="enterprise" className="py-20 px-6 bg-white border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-[#0F172A] tracking-tight">
              Start with one workflow. Expand across teams and locations.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            {/* START */}
            <div className="p-6 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] space-y-3">
              <span className="px-2 py-0.5 rounded bg-[#1D4ED8]/10 text-[#1D4ED8] font-bold uppercase text-[10px]">
                STAGE 1: START
              </span>
              <h3 className="font-bold text-[#0F172A] text-sm">Single Business Answering</h3>
              <ul className="space-y-1.5 text-[#475569]">
                <li>• One business profile & agent</li>
                <li>• Website or phone voice surface</li>
                <li>• Simple booking or BANT intake</li>
                <li>• Shared conversation inbox</li>
              </ul>
              <span className="inline-block font-mono text-[10px] text-[#15803D] px-2 py-0.5 rounded bg-[#F0FDF4] border border-[#15803D]/20">
                Implemented
              </span>
            </div>

            {/* GROW */}
            <div className="p-6 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] space-y-3">
              <span className="px-2 py-0.5 rounded bg-[#1D4ED8]/10 text-[#1D4ED8] font-bold uppercase text-[10px]">
                STAGE 2: GROW
              </span>
              <h3 className="font-bold text-[#0F172A] text-sm">Multi-Department Operations</h3>
              <ul className="space-y-1.5 text-[#475569]">
                <li>• Multiple departments & agents</li>
                <li>• CRM & Calendar sync</li>
                <li>• Team member assignment</li>
                <li>• Structured review queues</li>
              </ul>
              <span className="inline-block font-mono text-[10px] text-[#1D4ED8] px-2 py-0.5 rounded bg-[#EFF6FF] border border-[#1D4ED8]/20">
                Configured
              </span>
            </div>

            {/* ENTERPRISE */}
            <div className="p-6 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] space-y-3">
              <span className="px-2 py-0.5 rounded bg-[#1D4ED8]/10 text-[#1D4ED8] font-bold uppercase text-[10px]">
                STAGE 3: ENTERPRISE
              </span>
              <h3 className="font-bold text-[#0F172A] text-sm">Organization Governance</h3>
              <ul className="space-y-1.5 text-[#475569]">
                <li>• Multi-workspace isolation</li>
                <li>• Role-based access & audit logs</li>
                <li>• Provider monitoring & failover</li>
                <li>• Regional compliance controls</li>
              </ul>
              <span className="inline-block font-mono text-[10px] text-[#64748B] px-2 py-0.5 rounded bg-[#F1F5F9] border border-[#CBD5E1]">
                Architecture Target
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 13 — FINAL CTA */}
      <section className="py-20 px-6 bg-[#EFF6FF] border-b border-[#1D4ED8]/20 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">
            See how a real business conversation becomes structured work.
          </h2>
          <p className="text-sm text-[#475569]">
            Test the live ElevenLabs WebRTC voice integration or inspect the operations workspace.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/demo"
              className="w-full sm:w-auto bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-bold text-sm px-8 py-3.5 rounded-lg flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Try live voice demo</span>
            </Link>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto bg-white hover:bg-[#F8FAFC] text-[#0F172A] font-semibold text-sm px-8 py-3.5 rounded-lg border border-[#CBD5E1] flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <span>View operations workspace</span>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
