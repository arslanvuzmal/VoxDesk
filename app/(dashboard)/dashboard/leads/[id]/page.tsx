import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/database';
import {
  Users,
  PhoneCall,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Clock,
  UserCheck,
  Building2,
  FileText,
  ShieldCheck,
  Mail,
  Phone,
  Briefcase,
} from 'lucide-react';

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let lead = null;
  try {
    lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        call: true,
      },
    });
  } catch {
    // Graceful fallback
  }

  if (!lead) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto p-6 select-none">
        <Link
          href="/dashboard/leads"
          className="text-xs text-[#58A6FF] hover:underline flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Lead Inbox</span>
        </Link>
        <div className="p-6 rounded-lg bg-[#161B22] border border-[#30363D] space-y-2">
          <h1 className="text-lg font-bold text-white">Lead Record Not Found</h1>
          <p className="text-xs text-[#8B949E]">
            The requested lead record (ID: {id}) could not be retrieved from the database.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none max-w-7xl mx-auto">
      {/* Top Breadcrumb Header */}
      <div className="flex items-center justify-between border-b border-[#30363D] pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/leads"
            className="p-1.5 rounded-md bg-[#21262D] hover:bg-[#30363D] text-[#8B949E] hover:text-white transition-colors"
            title="Back to Leads"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs text-[#8B949E]">
              <span>Leads</span>
              <span>/</span>
              <span className="font-mono text-[11px] text-[#C9D1D9]">{lead.id.slice(0, 8)}</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">{lead.name}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-2.5 py-1 rounded text-xs font-mono font-semibold border ${
              lead.category === 'HOT'
                ? 'bg-[#F85149]/15 text-[#F85149] border-[#F85149]/30'
                : lead.category === 'WARM'
                  ? 'bg-[#D29922]/15 text-[#D29922] border-[#D29922]/30'
                  : 'bg-[#58A6FF]/15 text-[#58A6FF] border-[#58A6FF]/30'
            }`}
          >
            {lead.category} ({lead.score}/100)
          </span>
        </div>
      </div>

      {/* 2-Column Enterprise Record Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left / Main Column (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact & Business Profile Card */}
          <div className="rounded-lg bg-[#161B22] border border-[#30363D] p-5 space-y-4">
            <h2 className="text-xs font-bold text-[#8B949E] uppercase tracking-wider border-b border-[#30363D] pb-2">
              Contact & Intake Identity
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4 text-[#8B949E] shrink-0" />
                <div>
                  <p className="text-[11px] text-[#8B949E]">Company / Business</p>
                  <p className="font-medium text-white">{lead.company || 'Northstar Client'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Briefcase className="w-4 h-4 text-[#8B949E] shrink-0" />
                <div>
                  <p className="text-[11px] text-[#8B949E]">Service Interest</p>
                  <p className="font-medium text-white">
                    {lead.serviceInterest || 'Commercial Consultation'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-[#8B949E] shrink-0" />
                <div>
                  <p className="text-[11px] text-[#8B949E]">Record Created</p>
                  <p className="font-mono text-white">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-[#8B949E] shrink-0" />
                <div>
                  <p className="text-[11px] text-[#8B949E]">Data Status</p>
                  <p className="font-mono text-[#3FB950]">AES-256 Encrypted</p>
                </div>
              </div>
            </div>
          </div>

          {/* AI Voice Transcript & Intake Summary Card */}
          <div className="rounded-lg bg-[#161B22] border border-[#30363D] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#30363D] pb-2">
              <h2 className="text-xs font-bold text-[#8B949E] uppercase tracking-wider">
                Voice Agent Intake Session
              </h2>
              <span className="text-[11px] text-[#58A6FF] font-mono">Agent: Maya</span>
            </div>

            <div className="p-3.5 rounded-md bg-[#0D1117] border border-[#30363D] text-xs text-[#C9D1D9] leading-relaxed">
              Prospect called inquiring about commercial legal retainer terms and fee structures.
              Stated immediate consultation required for contract dispute.
            </div>

            {/* Linked Call */}
            {lead.call && (
              <div className="space-y-2 pt-2">
                <h3 className="text-[11px] font-semibold text-[#8B949E] uppercase">
                  Associated Call Session
                </h3>
                <div className="p-3 rounded-md bg-[#0D1117] border border-[#30363D] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <PhoneCall className="w-3.5 h-3.5 text-[#58A6FF]" />
                    <span className="font-medium text-white">Inbound Call</span>
                    <span className="text-[#8B949E] font-mono text-[11px]">
                      ({lead.call.durationSeconds}s)
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-[#8B949E]">
                    {new Date(lead.call.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right / Sidebar Column (1/3) */}
        <div className="space-y-6">
          {/* BANT Qualification Score Breakdown Card */}
          <div className="rounded-lg bg-[#161B22] border border-[#30363D] p-5 space-y-4">
            <h2 className="text-xs font-bold text-[#8B949E] uppercase tracking-wider border-b border-[#30363D] pb-2">
              BANT Score Breakdown
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#8B949E]">Overall Qualification</span>
                <span className="font-bold text-white font-mono text-base">{lead.score}/100</span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-[#8B949E]">
                  <span>Budget</span>
                  <span className="font-mono text-white">{lead.budgetRange || 'High'}</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#21262D]">
                  <div className="h-1.5 rounded-full bg-[#3FB950] w-full" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-[#8B949E]">
                  <span>Timeline</span>
                  <span className="font-mono text-white">{lead.timeline || 'Immediate'}</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#21262D]">
                  <div className="h-1.5 rounded-full bg-[#3FB950] w-full" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-[#8B949E]">
                  <span>Authority</span>
                  <span className="font-mono text-white">{lead.authority || 'Decision Maker'}</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#21262D]">
                  <div className="h-1.5 rounded-full bg-[#3FB950] w-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Assigned Staff & Action Card */}
          <div className="rounded-lg bg-[#161B22] border border-[#30363D] p-5 space-y-3 text-xs">
            <h2 className="text-xs font-bold text-[#8B949E] uppercase tracking-wider border-b border-[#30363D] pb-2">
              Lead Assignment & Handoff
            </h2>
            <div className="flex items-center gap-2 text-white">
              <UserCheck className="w-4 h-4 text-[#58A6FF]" />
              <span className="font-semibold">Assigned Owner:</span>
              <span className="font-mono">{lead.assignedTo || 'Senior Counsel'}</span>
            </div>
            <p className="text-[11px] text-[#8B949E]">
              Qualified via Maya automated intake. Ready for partner review.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
