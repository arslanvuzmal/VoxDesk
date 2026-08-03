"use client";

import { useState } from "react";
import { Phone, PhoneOff, Calendar, AlertTriangle, UserCheck, Mic, ArrowRight } from "lucide-react";

interface LiveConsoleProps {
  initialScenarioId?: string;
}

export function LiveCallConsole({ initialScenarioId }: LiveConsoleProps) {
  const [callState, setCallState] = useState<string>("IDLE");
  const [messages, setMessages] = useState<Array<{ role: string; content: string; timestamp: string }>>([
    {
      role: "AGENT",
      content: "Hello! Thank you for calling Northstar Legal Consultations. My name is Maya. How may I assist you today?",
      timestamp: "10:00:02",
    },
    {
      role: "CALLER",
      content: "Hi Maya, I'm calling to book a legal consultation regarding a commercial contract dispute next Tuesday.",
      timestamp: "10:00:08",
    },
    {
      role: "AGENT",
      content: "I can certainly help you schedule that consultation. May I confirm your full name and preferred email address for the calendar invite?",
      timestamp: "10:00:15",
    },
  ]);
  const [callerName, setCallerName] = useState("Sarah Miller");
  const [callerPhone] = useState("+1 (***) ***-2834");
  const [currentIntent] = useState("Book Legal Consultation");

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Console Top Bar */}
      <div className="p-4 rounded-lg bg-[#13171C] border border-[#272D35] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-[#2DD4BF] animate-pulse"></div>
          <div>
            <span className="text-sm font-bold text-white">Live Call Console</span>
            <span className="text-xs text-[#8B949E] block">Agent: Maya • Northstar Legal Consultations</span>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="px-2.5 py-1 rounded bg-[#171C22] text-[#2DD4BF] border border-[#272D35]">
            STATE: CHECKING_AVAILABILITY
          </span>
          <span className="px-2.5 py-1 rounded bg-[#171C22] text-[#F4F4F5] border border-[#272D35]">
            01:42
          </span>
          <button className="bg-[#FB7185] hover:bg-[#e05669] text-white px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors">
            <PhoneOff className="w-3.5 h-3.5" /> End Call
          </button>
        </div>
      </div>

      {/* 3 Column Console Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left Column: Call Context */}
        <div className="p-4 rounded-lg bg-[#13171C] border border-[#272D35] space-y-4 text-xs">
          <h2 className="font-bold text-white uppercase tracking-wider text-[11px] text-[#8B949E]">Call Context</h2>

          <div className="space-y-2">
            <div>
              <span className="text-[#8B949E] block">Caller Name</span>
              <span className="font-semibold text-white text-sm">{callerName}</span>
            </div>
            <div>
              <span className="text-[#8B949E] block">Phone Number</span>
              <span className="font-mono text-[#D4D4D8]">{callerPhone}</span>
            </div>
            <div>
              <span className="text-[#8B949E] block">Detected Intent</span>
              <span className="font-medium text-[#2DD4BF]">{currentIntent}</span>
            </div>
          </div>

          <hr className="border-[#272D35]" />

          <div className="space-y-2">
            <span className="text-[#8B949E] block">Collected Fields</span>
            <div className="p-2 rounded bg-[#171C22] border border-[#272D35] space-y-1">
              <p className="text-[11px]"><strong className="text-[#8B949E]">Service:</strong> Contract Litigation</p>
              <p className="text-[11px]"><strong className="text-[#8B949E]">Email:</strong> sa***@example.com</p>
              <p className="text-[11px]"><strong className="text-[#8B949E]">Requested Date:</strong> Next Tuesday (10:00 AM)</p>
            </div>
          </div>
        </div>

        {/* Center: Live Transcript Stream */}
        <div className="lg:col-span-2 p-4 rounded-lg bg-[#13171C] border border-[#272D35] flex flex-col h-[500px]">
          <div className="flex items-center justify-between border-b border-[#272D35] pb-2 mb-4">
            <h2 className="font-bold text-white text-xs">Speaker-Separated Transcript</h2>
            <span className="text-[11px] font-mono text-[#34D399] flex items-center gap-1">
              <Mic className="w-3 h-3 animate-pulse" /> Active Audio Stream
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2 text-sm">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-3 rounded-lg border text-xs leading-relaxed ${
                  msg.role === "AGENT"
                    ? "bg-[#171C22] border-[#272D35] text-[#F4F4F5] mr-6"
                    : "bg-[#0F1216] border-[#272D35] text-[#D4D4D8] ml-6 border-l-2 border-l-[#2DD4BF]"
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-[#8B949E] font-mono mb-1">
                  <span className={msg.role === "AGENT" ? "text-[#2DD4BF] font-bold" : "text-white font-bold"}>
                    {msg.role === "AGENT" ? "Maya (Agent)" : "Sarah Miller (Caller)"}
                  </span>
                  <span>{msg.timestamp}</span>
                </div>
                <p>{msg.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Actions & Workflow State */}
        <div className="p-4 rounded-lg bg-[#13171C] border border-[#272D35] space-y-4 text-xs">
          <h2 className="font-bold text-white uppercase tracking-wider text-[11px] text-[#8B949E]">Workflow Actions</h2>

          <div className="p-3 rounded bg-[#171C22] border border-[#272D35] space-y-2">
            <span className="font-semibold text-white block">Calendar Availability</span>
            <p className="text-[#8B949E] text-[11px]">Tuesday, Aug 4 — Slot 10:00 AM available.</p>
            <button className="w-full bg-[#2DD4BF] hover:bg-[#26b8a5] text-[#0B0D10] font-bold py-1.5 rounded text-[11px] transition-colors">
              Confirm Appointment
            </button>
          </div>

          <div className="p-3 rounded bg-[#171C22] border border-[#272D35] space-y-2">
            <span className="font-semibold text-white block">BANT Lead Qualification</span>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#8B949E]">Category:</span>
              <span className="font-bold text-[#34D399] font-mono">HOT (85/100)</span>
            </div>
          </div>

          <div className="p-3 rounded bg-[#171C22] border border-[#272D35] space-y-2">
            <span className="font-semibold text-white block">Human Escalation</span>
            <button className="w-full bg-[#13171C] hover:bg-[#0F1216] text-[#FBBF24] border border-[#FBBF24]/30 font-semibold py-1.5 rounded text-[11px] transition-colors">
              Request Transfer Brief
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
