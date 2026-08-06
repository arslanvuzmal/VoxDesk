"use client";

import { useState } from "react";
import {
  Bot,
  Volume2,
  Building2,
  BookOpen,
  Sliders,
  Zap,
  Search,
  CheckCircle2,
  Plus,
  RefreshCw,
} from "lucide-react";

export default function AgentSetupPage() {
  const [activeTab, setActiveTab] = useState("PROFILE");

  return (
    <div className="space-y-6 select-none">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
        <div>
          <h1 className="text-xl font-bold text-[#0F172A] tracking-tight">
            Voice Agent Configuration Workspace
          </h1>
          <p className="text-xs text-[#64748B]">
            Configure agent identity, ElevenLabs voice model, business knowledge base, and automated rules.
          </p>
        </div>

        <button
          type="button"
          className="px-3.5 py-1.5 rounded-md bg-[#1D4ED8] hover:bg-[#1E40AF] text-xs font-semibold text-white flex items-center gap-1.5 transition-colors shadow-sm self-start sm:self-auto"
        >
          <span>Save Changes</span>
        </button>
      </div>

      {/* 7 AGENT CONFIGURATION TABS */}
      <div className="p-1 rounded-lg bg-white border border-[#E2E8F0] flex items-center gap-1 text-xs shadow-sm overflow-x-auto">
        {[
          { id: "PROFILE", label: "Profile" },
          { id: "VOICE", label: "Voice Model" },
          { id: "BUSINESS", label: "Business Info" },
          { id: "KNOWLEDGE", label: "Knowledge Base" },
          { id: "RULES", label: "Conversation Rules" },
          { id: "ACTIONS", label: "System Actions" },
          { id: "TESTING", label: "Testing & Inspector" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors shrink-0 ${
              activeTab === tab.id
                ? "bg-[#1D4ED8] text-white shadow-sm"
                : "text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT PANELS */}
      {activeTab === "PROFILE" && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 space-y-5 shadow-sm max-w-3xl">
          <h2 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider border-b border-[#E2E8F0] pb-2">
            Agent Profile Settings
          </h2>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-[#0F172A] mb-1">Agent Name</label>
              <input
                type="text"
                defaultValue="Maya"
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-md px-3 py-2 text-xs text-[#0F172A] font-medium focus:outline-none focus:border-[#1D4ED8]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#0F172A] mb-1">Role & Business Persona</label>
              <input
                type="text"
                defaultValue="Inbound Legal Intake Specialist — Northstar Legal Consultations"
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-md px-3 py-2 text-xs text-[#0F172A] font-medium focus:outline-none focus:border-[#1D4ED8]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#0F172A] mb-1">System Prompt / Instructions</label>
              <textarea
                rows={5}
                defaultValue="You are Maya, an AI voice receptionist for Northstar Legal Consultations. Answer caller inquiries professionally, collect BANT qualification fields, and offer consultation bookings."
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-md px-3 py-2 text-xs text-[#0F172A] font-medium focus:outline-none focus:border-[#1D4ED8] leading-relaxed"
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === "VOICE" && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 space-y-5 shadow-sm max-w-3xl">
          <h2 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider border-b border-[#E2E8F0] pb-2">
            ElevenLabs Voice Model Settings
          </h2>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-[#0F172A] mb-1">Provider</label>
              <input
                type="text"
                defaultValue="ElevenLabs Conversational AI"
                readOnly
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-md px-3 py-2 text-xs text-[#64748B] font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#0F172A] mb-1">ElevenLabs Agent ID</label>
              <input
                type="text"
                defaultValue="agent_3701kzc5x5ryfhtsh6rzfwpr5v58"
                readOnly
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-md px-3 py-2 text-xs text-[#0F172A] font-mono"
              />
            </div>

            <div className="p-3.5 rounded-lg bg-[#F0FDF4] border border-[#15803D]/20 text-[#15803D] text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Voice agent verified and active on ElevenLabs cluster.</span>
            </div>
          </div>
        </div>
      )}

      {(activeTab === "KNOWLEDGE" || activeTab === "BUSINESS" || activeTab === "RULES" || activeTab === "ACTIONS" || activeTab === "TESTING") && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 space-y-4 shadow-sm max-w-3xl">
          <h2 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider border-b border-[#E2E8F0] pb-2">
            {activeTab} Settings
          </h2>
          <p className="text-xs text-[#64748B] leading-relaxed">
            Configure {activeTab.toLowerCase()} properties and system grounding settings for voice agent execution.
          </p>
          <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#475569]">
            Active configuration loaded for Maya receptionist workspace.
          </div>
        </div>
      )}
    </div>
  );
}
