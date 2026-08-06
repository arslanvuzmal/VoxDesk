"use client";

import { useState } from "react";
import { CheckCircle2, ShieldAlert, ArrowRight, Building2, Stethoscope, Home, Wrench, Briefcase, Users } from "lucide-react";

interface IndustryProfile {
  id: string;
  name: string;
  icon: any;
  inboundWorkflows: string[];
  outboundWorkflows: string[];
  informationCollected: string[];
  humanHandoffConditions: string[];
  connectedSystems: string[];
  statusLabel: "Available in demo" | "Configurable deployment template" | "Requires integration" | "Planned";
  statusColor: string;
}

const industryProfiles: IndustryProfile[] = [
  {
    id: "legal",
    name: "Legal Services",
    icon: Building2,
    inboundWorkflows: [
      "New client consultation enquiry",
      "Practice-area identification & BANT intake",
      "Administrative consultation scheduling",
      "Urgent court deadline escalation",
    ],
    outboundWorkflows: [
      "Consultation reminder notifications",
      "Missing document request follow-up",
      "Approved retainer follow-up",
    ],
    informationCollected: ["Contact name & number", "Legal matter type", "Jurisdiction", "Case urgency level", "Preferred appointment slot"],
    humanHandoffConditions: [
      "Substantive legal advice requested",
      "Immediate court filing deadline",
      "Adverse party conflict check uncertainty",
      "Unsupported practice area",
    ],
    connectedSystems: ["Clio / LawPay CRM", "Google Calendar / Outlook", "WebRTC Voice Gateway"],
    statusLabel: "Available in demo",
    statusColor: "bg-[#15803D]/10 text-[#15803D] border-[#15803D]/20",
  },
  {
    id: "healthcare",
    name: "Healthcare & Clinics",
    icon: Stethoscope,
    inboundWorkflows: [
      "Patient appointment booking",
      "Clinic hours & location enquiry",
      "Insurance verification intake",
      "Urgent triage routing",
    ],
    outboundWorkflows: [
      "Preventative appointment reminders",
      "Post-visit satisfaction follow-up",
    ],
    informationCollected: ["Patient full name", "Date of birth", "Insurance carrier", "Symptoms summary", "Provider preference"],
    humanHandoffConditions: [
      "Acute medical emergency reported",
      "Prescription refill request",
      "Complex clinical question",
    ],
    connectedSystems: ["AthenaHealth / Epic EHR", "Google Calendar", "HIPAA Proxy Layer"],
    statusLabel: "Configurable deployment template",
    statusColor: "bg-[#1D4ED8]/10 text-[#1D4ED8] border-[#1D4ED8]/20",
  },
  {
    id: "realestate",
    name: "Real Estate & Housing",
    icon: Home,
    inboundWorkflows: [
      "Property listing enquiry",
      "Agent showing scheduling",
      "Tenant maintenance request",
      "Rental application screening",
    ],
    outboundWorkflows: [
      "Showing confirmation alerts",
      "Price reduction notification to active buyers",
    ],
    informationCollected: ["Buyer/Tenant budget", "Preferred location/zip", "Move-in timeline", "Financing pre-approval status"],
    humanHandoffConditions: [
      "High-value commercial transaction",
      "Lease dispute / legal issue",
      "Unlisted property offer",
    ],
    connectedSystems: ["HubSpot CRM", "Zillow API", "Calendly"],
    statusLabel: "Configurable deployment template",
    statusColor: "bg-[#1D4ED8]/10 text-[#1D4ED8] border-[#1D4ED8]/20",
  },
  {
    id: "homeservices",
    name: "Home & Field Services",
    icon: Wrench,
    inboundWorkflows: [
      "Emergency HVAC / Plumbing dispatch",
      "Service estimate scheduling",
      "Job status inquiry",
    ],
    outboundWorkflows: [
      "Technician arrival time notification",
      "Seasonal maintenance reminder",
    ],
    informationCollected: ["Property address", "Service needed", "Urgency level", "Access instructions"],
    humanHandoffConditions: [
      "Active water leak / fire hazard",
      "Commercial contract negotiation",
    ],
    connectedSystems: ["Housecall Pro / ServiceTitan", "Twilio Voice"],
    statusLabel: "Requires integration",
    statusColor: "bg-[#B45309]/10 text-[#B45309] border-[#B45309]/20",
  },
  {
    id: "sales",
    name: "B2B Sales Operations",
    icon: Briefcase,
    inboundWorkflows: [
      "Inbound demo request qualification",
      "SaaS plan comparison enquiry",
      "Enterprise pricing routing",
    ],
    outboundWorkflows: [
      "Inbound lead callback within 5 minutes",
      "No-show demo follow-up",
    ],
    informationCollected: ["Company size", "Current tech stack", "Annual budget", "Decision timeline"],
    humanHandoffConditions: [
      "Enterprise ARR opportunity",
      "Custom procurement terms",
    ],
    connectedSystems: ["Salesforce / HubSpot", "Outreach", "Stripe"],
    statusLabel: "Available in demo",
    statusColor: "bg-[#15803D]/10 text-[#15803D] border-[#15803D]/20",
  },
  {
    id: "agency",
    name: "Agencies & Consultancies",
    icon: Users,
    inboundWorkflows: [
      "Client project inquiry",
      "Discovery call scheduling",
      "Billing & invoice query routing",
    ],
    outboundWorkflows: [
      "Proposal delivery follow-up",
      "Client review reminder",
    ],
    informationCollected: ["Project scope", "Estimated budget", "Target launch date"],
    humanHandoffConditions: [
      "Scope dispute",
      "Retainer cancellation risk",
    ],
    connectedSystems: ["Notion", "Asana", "Google Workspace"],
    statusLabel: "Planned",
    statusColor: "bg-[#64748B]/10 text-[#64748B] border-[#64748B]/20",
  },
];

export function IndustrySelector() {
  const [selectedId, setSelectedId] = useState("legal");

  const current = industryProfiles.find((p) => p.id === selectedId) || industryProfiles[0];
  const Icon = current.icon;

  return (
    <div className="space-y-8 select-none">
      {/* Industry Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#E2E8F0]">
        {industryProfiles.map((p) => {
          const TabIcon = p.icon;
          const isSelected = p.id === selectedId;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedId(p.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all shrink-0 border ${
                isSelected
                  ? "bg-[#1D4ED8] text-white border-[#1D4ED8] shadow-sm"
                  : "bg-white text-[#475569] border-[#E2E8F0] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
              }`}
            >
              <TabIcon className={`w-4 h-4 ${isSelected ? "text-white" : "text-[#64748B]"}`} />
              <span>{p.name}</span>
            </button>
          );
        })}
      </div>

      {/* Selected Industry Card Display */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-[#EFF6FF] text-[#1D4ED8] border border-[#1D4ED8]/20">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0F172A]">{current.name}</h3>
              <p className="text-xs text-[#64748B]">Operational profile & automated voice routing rules</p>
            </div>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-mono font-semibold border ${current.statusColor} self-start sm:self-auto`}
          >
            {current.statusLabel}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
          {/* Inbound Workflows */}
          <div className="space-y-3 p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
            <h4 className="font-bold text-[#0F172A] uppercase tracking-wider text-[11px]">
              Inbound Workflows
            </h4>
            <ul className="space-y-2 text-[#475569]">
              {current.inboundWorkflows.map((w, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D] shrink-0 mt-0.5" />
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Outbound Workflows */}
          <div className="space-y-3 p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
            <h4 className="font-bold text-[#0F172A] uppercase tracking-wider text-[11px]">
              Outbound Workflows
            </h4>
            <ul className="space-y-2 text-[#475569]">
              {current.outboundWorkflows.map((w, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#1D4ED8] shrink-0 mt-0.5" />
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Information Collected */}
          <div className="space-y-3 p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
            <h4 className="font-bold text-[#0F172A] uppercase tracking-wider text-[11px]">
              Information Collected
            </h4>
            <ul className="space-y-2 text-[#475569]">
              {current.informationCollected.map((info, idx) => (
                <li key={idx} className="flex items-center gap-2 font-mono text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1D4ED8]" />
                  <span>{info}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Human Escalation Conditions */}
          <div className="space-y-3 p-4 rounded-lg bg-[#FFFBEB] border border-[#FCD34D] lg:col-span-2">
            <h4 className="font-bold text-[#B45309] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-[#B45309]" />
              <span>Human Escalation Conditions</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[#78350F]">
              {current.humanHandoffConditions.map((cond, idx) => (
                <div key={idx} className="flex items-start gap-1.5">
                  <span className="font-bold text-[#B45309]">•</span>
                  <span>{cond}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Connected Systems */}
          <div className="space-y-3 p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
            <h4 className="font-bold text-[#0F172A] uppercase tracking-wider text-[11px]">
              Connected Systems
            </h4>
            <div className="space-y-1.5">
              {current.connectedSystems.map((sys, idx) => (
                <span
                  key={idx}
                  className="block px-2.5 py-1 rounded bg-white border border-[#CBD5E1] text-[11px] font-mono text-[#0F172A]"
                >
                  {sys}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
