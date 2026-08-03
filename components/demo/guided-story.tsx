"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Phone, Calendar, Users, FileText, ArrowLeft } from "lucide-react";

const storySteps = [
  {
    step: 1,
    title: "1. Inbound Call Received",
    role: "System Action",
    description: "Caller Sarah Miller calls Northstar Legal after office hours. The designated receptionist agent (Maya) answers within 1 ring.",
    detail: "Call State: GREETING • Provider: Demo Voice Provider",
  },
  {
    step: 2,
    title: "2. Approved Greeting & Intent Detection",
    role: "Agent Action",
    description: "Maya delivers the approved business greeting and asks how she can help. The caller requests a consultation for a commercial dispute.",
    detail: "Detected Intent: Schedule Legal Consultation",
  },
  {
    step: 3,
    title: "3. Contact Data Collection",
    role: "Agent Action",
    description: "Maya collects and validates the caller's contact details (Sarah Miller, sa***@example.com) for calendar registration.",
    detail: "Fields Captured: Name, Phone, Email",
  },
  {
    step: 4,
    title: "4. Real-Time Calendar Slot Verification",
    role: "Calendar Integration",
    description: "Maya queries Northstar Legal's Google Calendar for non-conflicting consultation openings next Tuesday morning.",
    detail: "Available Slot Found: Tuesday, 10:00 AM EST",
  },
  {
    step: 5,
    title: "5. Caller Slot Confirmation & Booking",
    role: "State Machine Guardrail",
    description: "Maya explicitly reads back the date and time to Sarah and requests confirmation before booking the slot.",
    detail: "Appointment Created: ID #apt_89234 confirmed",
  },
  {
    step: 6,
    title: "6. BANT Opportunity Qualification",
    role: "Lead Scoring",
    description: "VoxDesk evaluates service scope, estimated budget ($15,000), timeline (Immediate), and decision authority (Partner).",
    detail: "Qualification Result: HOT (85/100)",
  },
  {
    step: 7,
    title: "7. Structured Call Summary & Action Items",
    role: "Call Intelligence",
    description: "At call closing, VoxDesk extracts a Zod-validated structured summary, key discussion points, and recommended follow-up actions.",
    detail: "Summary Generated: Validated with CallSummarySchema",
  },
  {
    step: 8,
    title: "8. CRM Activity & Contact Sync",
    role: "CRM Adapter",
    description: "Creates contact record for Sarah Miller and logs consultation booking activity in HubSpot CRM.",
    detail: "CRM Activity Logged: Activity #act_99120",
  },
];

export function GuidedClientStory() {
  const [currentStep, setCurrentStep] = useState(0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#272D35] pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Interactive Call Workflow Walkthrough</h1>
          <p className="text-xs text-[#8B949E]">Demonstrating complete call intake, calendar booking, lead qualification, and CRM sync.</p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-[#8B949E]">
          <span>Step {currentStep + 1} of {storySteps.length}</span>
        </div>
      </div>

      {/* Progress Track */}
      <div className="grid grid-cols-8 gap-1.5">
        {storySteps.map((s, idx) => (
          <button
            key={s.step}
            onClick={() => setCurrentStep(idx)}
            className={`h-2 rounded-full transition-colors ${
              idx === currentStep
                ? "bg-[#2DD4BF]"
                : idx < currentStep
                ? "bg-[#34D399]"
                : "bg-[#171C22] border border-[#272D35]"
            }`}
          />
        ))}
      </div>

      {/* Step Card */}
      <div className="p-6 rounded-lg bg-[#13171C] border border-[#272D35] space-y-6">
        <div className="flex items-center justify-between">
          <span className="px-2.5 py-1 rounded bg-[#171C22] text-[#2DD4BF] font-mono text-xs border border-[#272D35]">
            {storySteps[currentStep].role}
          </span>
          <span className="text-xs text-[#8B949E] font-mono">Fictional Demo Workspace</span>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-bold text-white">{storySteps[currentStep].title}</h2>
          <p className="text-sm text-[#D4D4D8] leading-relaxed">{storySteps[currentStep].description}</p>
        </div>

        <div className="p-3 rounded bg-[#0F1216] border border-[#272D35] font-mono text-xs text-[#34D399]">
          {storySteps[currentStep].detail}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-[#272D35]">
          <button
            disabled={currentStep === 0}
            onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
            className="px-4 py-2 rounded-lg bg-[#171C22] text-[#D4D4D8] border border-[#272D35] text-xs font-semibold disabled:opacity-40 flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Previous Step
          </button>

          {currentStep < storySteps.length - 1 ? (
            <button
              onClick={() => setCurrentStep((prev) => Math.min(storySteps.length - 1, prev + 1))}
              className="px-4 py-2 rounded-lg bg-[#2DD4BF] hover:bg-[#26b8a5] text-[#0B0D10] text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              Next Step <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-lg bg-[#34D399] text-[#0B0D10] text-xs font-bold flex items-center gap-1.5"
            >
              Open Operations Dashboard <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
