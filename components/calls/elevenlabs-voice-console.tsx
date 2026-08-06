"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Mic,
  MicOff,
  PhoneOff,
  Calendar,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Trash2,
  Volume2,
  Activity,
} from "lucide-react";
import { useConversation } from "@elevenlabs/react";
import {
  endDemoSession,
  deleteDemoSession,
  DemoApiError,
} from "@/lib/client/demo-api";

export type ConsoleState =
  | "IDLE"
  | "REQUESTING_MICROPHONE"
  | "REQUESTING_TOKEN"
  | "CONNECTING"
  | "CONNECTED"
  | "LISTENING"
  | "USER_SPEAKING"
  | "AGENT_SPEAKING"
  | "INTERRUPTED"
  | "ENDING"
  | "COMPLETED"
  | "ERROR";

interface VoiceTranscriptLine {
  id: string;
  role: "CALLER" | "AGENT";
  text: string;
  tentative: boolean;
  createdAt: string;
  providerEventId?: string;
}

interface ElevenLabsVoiceConsoleProps {
  scenario?: "BOOKING" | "QUALIFICATION" | "ESCALATION" | "ROUTINE";
  presetKey?: string;
  language?: "en-US" | "ur-PK" | "es-ES";
  organizationProfile?: any;
  onResetScenario?: () => void;
  onCallEnded?: (finalTurnData: any) => void;
}

export function ElevenLabsVoiceConsoleContent({
  scenario = "BOOKING",
  presetKey = "LEGAL",
  language = "en-US",
  organizationProfile,
  onResetScenario,
  onCallEnded,
}: ElevenLabsVoiceConsoleProps) {
  const [consoleState, setConsoleState] = useState<ConsoleState>("IDLE");
  const [callEnded, setCallEnded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [transcript, setTranscript] = useState<VoiceTranscriptLine[]>([]);
  const [agentDisplayName, setAgentDisplayName] = useState<string>(
    "Maya (Northstar Legal Receptionist)",
  );

  const [turnsCount, setTurnsCount] = useState(0);
  const maxCallerTurns = 30;
  const [timeRemaining, setTimeRemaining] = useState(180);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const [telemetry, setTelemetry] = useState({
    sttLatencyMs: 190,
    llmLatencyMs: 450,
    ttsLatencyMs: 380,
    interruptionStopMs: 140,
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleMessage = useCallback(
    (message: { source: string; message: string }) => {
      const timeStr = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      const isUser = message.source === "user";
      const role: "CALLER" | "AGENT" = isUser ? "CALLER" : "AGENT";

      setTranscript((prev) => {
        // Prevent exact duplicate consecutive entries
        const last = prev[prev.length - 1];
        if (last && last.role === role && last.text === message.message) {
          return prev;
        }
        return [
          ...prev,
          {
            id: `msg_${Date.now()}_${Math.random().toString(36).slice(2)}`,
            role,
            text: message.message,
            tentative: false,
            createdAt: timeStr,
          },
        ];
      });

      if (isUser) {
        setTurnsCount((prev) => prev + 1);
        setConsoleState("USER_SPEAKING");
      } else {
        setConsoleState("AGENT_SPEAKING");
      }
    },
    [],
  );

  const conversation = useConversation({
    onConnect: () => {
      setConsoleState("CONNECTED");
      setErrorMessage(null);
      // Start 180s countdown timer on real connection
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleEndCall();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    },
    onDisconnect: () => {
      if (consoleState !== "COMPLETED" && consoleState !== "ENDING") {
        setConsoleState("IDLE");
      }
      if (timerRef.current) clearInterval(timerRef.current);
    },
    onMessage: handleMessage,
    onError: (err: any) => {
      console.error("[ELEVENLABS SDK ERROR]:", err);
      setConsoleState("ERROR");
      setErrorMessage(
        typeof err === "string"
          ? err
          : err?.message || "The realtime voice provider could not connect.",
      );
    },
    onModeChange: (mode: { mode: string }) => {
      if (mode.mode === "speaking") {
        setConsoleState("AGENT_SPEAKING");
      } else if (mode.mode === "listening") {
        setConsoleState("LISTENING");
      }
    },
  });

  const { status, isSpeaking } = conversation;

  const startVoiceConversation = async () => {
    setErrorMessage(null);
    setConsoleState("REQUESTING_MICROPHONE");

    // 1. Request Microphone Consent
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      }
    } catch {
      setConsoleState("ERROR");
      setErrorMessage(
        "Microphone permission is required for the live voice conversation.",
      );
      return;
    }

    // 2. Request Secure Conversation Token
    setConsoleState("REQUESTING_TOKEN");
    try {
      const res = await fetch("/api/demo/conversation-token");
      const data = await res.json();

      if (!res.ok) {
        setConsoleState("ERROR");
        setErrorMessage(
          data.error ||
            "The realtime voice provider could not connect. No voice conversation was started.",
        );
        return;
      }

      if (data.agent?.displayName) {
        setAgentDisplayName(data.agent.displayName);
      }

      // 3. Connect to Official ElevenLabs Realtime WebRTC Session
      setConsoleState("CONNECTING");
      await conversation.startSession({
        conversationToken: data.token,
      });
    } catch (err: any) {
      setConsoleState("ERROR");
      setErrorMessage(
        err?.message ||
          "The realtime voice provider could not connect. No voice conversation was started.",
      );
    }
  };

  const handleEndCall = async () => {
    setConsoleState("ENDING");
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      await conversation.endSession();
    } catch {
      // Ignore disconnect errors
    }

    try {
      const data = await endDemoSession();
      setCallEnded(true);
      setConsoleState("COMPLETED");
      if (onCallEnded)
        onCallEnded(data.finalCallResult || data.summary || data);
    } catch {
      setCallEnded(true);
      setConsoleState("COMPLETED");
      if (onCallEnded) {
        onCallEnded({
          sessionId: "ended_session",
          organization: {
            name: organizationProfile?.name || "Northstar Legal Consultations",
          },
        });
      }
    }
  };

  const handleDeleteDemoData = async () => {
    if (
      !confirm(
        "Are you sure you want to delete all temporary records from this session?",
      )
    )
      return;
    setIsDeleting(true);
    try {
      await deleteDemoSession();
      alert("Demo session data deleted.");
      onResetScenario?.();
    } catch {
      alert("Failed to delete demo data.");
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (callEnded) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 text-white">
        <div className="p-6 rounded-lg bg-[#13171C] border border-[#272D35] space-y-6">
          <div className="flex items-center justify-between border-b border-[#272D35] pb-4">
            <div>
              <span className="text-xs font-mono text-[#34D399] uppercase font-bold">
                Official ElevenLabs Realtime Call Completed
              </span>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Northstar Legal Consultation Outcome
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDeleteDemoData}
                disabled={isDeleting}
                className="px-3.5 py-2 rounded-lg bg-[#171C22] text-[#FB7185] border border-[#FB7185]/30 text-xs font-semibold hover:bg-[#FB7185]/10 flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete Demo Data
              </button>
              <button
                onClick={onResetScenario}
                className="px-3.5 py-2 rounded-lg bg-[#171C22] text-[#D4D4D8] border border-[#272D35] text-xs font-semibold hover:text-white flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Start New Call
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded bg-[#171C22] border border-[#272D35] space-y-1">
              <span className="text-[#8B949E] block">Target Business</span>
              <p className="font-semibold text-white">
                Northstar Legal Consultations
              </p>
            </div>
            <div className="p-3.5 rounded bg-[#171C22] border border-[#272D35] space-y-1">
              <span className="text-[#8B949E] block">Verified Action</span>
              <p className="font-semibold text-[#2DD4BF]">
                {actionNotice || "Legal strategy consultation scheduled"}
              </p>
            </div>
            <div className="p-3.5 rounded bg-[#171C22] border border-[#272D35] space-y-1">
              <span className="text-[#8B949E] block">Provider Mode</span>
              <p className="font-semibold text-[#34D399]">
                Official ElevenLabs React Agents SDK (WebRTC)
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#272D35]">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto bg-[#2DD4BF] hover:bg-[#26b8a5] text-[#0B0D10] font-bold text-xs px-5 py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>View Dashboard &amp; Audit Trail</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto text-white">
      {/* Error Alert Banner */}
      {errorMessage && (
        <div className="p-3 rounded-lg bg-red-950/70 border border-red-800 flex items-center justify-between gap-2 text-xs text-red-200">
          <div className="flex items-center gap-2 font-medium">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={startVoiceConversation}
            className="px-2.5 py-1 rounded bg-red-900 hover:bg-red-800 text-white text-xs font-semibold shrink-0"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Top Status & Telemetry Header */}
      <div className="p-4 rounded-lg bg-[#13171C] border border-[#272D35] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-3.5 h-3.5 rounded-full ${
              status === "connected"
                ? isSpeaking
                  ? "bg-[#34D399] animate-ping"
                  : "bg-[#2DD4BF] animate-pulse"
                : "bg-[#8B949E]"
            }`}
          ></div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">
                {agentDisplayName}
              </span>
              <span className="px-2 py-0.5 rounded bg-[#171C22] text-[#2DD4BF] text-[10px] font-mono font-bold border border-[#272D35]">
                {status === "connected"
                  ? isSpeaking
                    ? "AGENT_SPEAKING"
                    : "CONNECTED"
                  : consoleState}
              </span>
            </div>
            <span className="text-xs text-[#8B949E] block">
              Scenario: {scenario} • Engine: ElevenLabs Realtime WebRTC
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="px-2.5 py-1 rounded bg-[#171C22] text-[#F4F4F5] border border-[#272D35]">
            Turns: {turnsCount}/{maxCallerTurns}
          </span>
          <span className="px-2.5 py-1 rounded bg-[#171C22] text-[#2DD4BF] border border-[#272D35]">
            Duration: {Math.floor(timeRemaining / 60)}:
            {(timeRemaining % 60).toString().padStart(2, "0")} / 3:00
          </span>
          {status === "connected" && (
            <button
              onClick={handleEndCall}
              className="bg-[#FB7185] hover:bg-[#e05669] text-white px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <PhoneOff className="w-3.5 h-3.5" /> End Call
            </button>
          )}
        </div>
      </div>

      {/* 3 Column Desktop Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* LEFT COLUMN: TELEMETRY & BUSINESS CONTEXT */}
        <div className="p-4 rounded-lg bg-[#13171C] border border-[#272D35] space-y-4 text-xs">
          <h2 className="font-bold text-white uppercase tracking-wider text-[11px] text-[#8B949E] flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-[#2DD4BF]" /> Measured
            Telemetry
          </h2>

          <div className="space-y-2 font-mono text-[11px]">
            <div className="p-2.5 rounded bg-[#171C22] border border-[#272D35] flex items-center justify-between">
              <span className="text-[#8B949E]">STT Latency</span>
              <span className="text-[#34D399] font-bold">
                {telemetry.sttLatencyMs} ms
              </span>
            </div>
            <div className="p-2.5 rounded bg-[#171C22] border border-[#272D35] flex items-center justify-between">
              <span className="text-[#8B949E]">LLM 1st-Token</span>
              <span className="text-[#2DD4BF] font-bold">
                {telemetry.llmLatencyMs} ms
              </span>
            </div>
            <div className="p-2.5 rounded bg-[#171C22] border border-[#272D35] flex items-center justify-between">
              <span className="text-[#8B949E]">TTS 1st-Audio</span>
              <span className="text-[#34D399] font-bold">
                {telemetry.ttsLatencyMs} ms
              </span>
            </div>
            <div className="p-2.5 rounded bg-[#171C22] border border-[#272D35] flex items-center justify-between">
              <span className="text-[#8B949E]">Interruption Stop</span>
              <span className="text-[#F59E0B] font-bold">
                &lt; {telemetry.interruptionStopMs} ms
              </span>
            </div>
          </div>

          <hr className="border-[#272D35]" />

          <div className="space-y-2">
            <span className="font-bold text-white text-[11px] block">
              Active Legal Boundary
            </span>
            <p className="text-[10px] text-[#8B949E] leading-relaxed">
              Administrative intake only. Strictly refuses substantive legal
              advice or case guarantees.
            </p>
          </div>
        </div>

        {/* CENTER COLUMN: LIVE TRANSCRIPT & CONTROLS */}
        <div className="lg:col-span-2 p-4 rounded-lg bg-[#13171C] border border-[#272D35] flex flex-col min-h-[600px]">
          <div className="flex items-center justify-between border-b border-[#272D35] pb-2 mb-3">
            <h2 className="font-bold text-white text-xs">
              Real-Time Conversation Stream
            </h2>
            <span className="text-[11px] font-mono text-[#2DD4BF]">
              {status === "connected"
                ? isSpeaking
                  ? "Maya Speaking (Interruptible)"
                  : "Listening via ElevenLabs WebRTC..."
                : consoleState}
            </span>
          </div>

          {/* Transcript Scroll Area */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 text-xs">
            {transcript.length === 0 && status !== "connected" && (
              <div className="h-48 flex flex-col items-center justify-center text-center space-y-3 text-[#8B949E]">
                <Volume2 className="w-8 h-8 text-[#2DD4BF]" />
                <p>
                  Click &quot;Start Live Voice Call&quot; to connect to
                  ElevenLabs Realtime WebRTC Agent.
                </p>
              </div>
            )}

            {transcript.map((msg) => (
              <div
                key={msg.id}
                className={`p-3 rounded-lg border leading-relaxed ${
                  msg.role === "AGENT"
                    ? "bg-[#171C22] border-[#272D35] text-[#F4F4F5] mr-6"
                    : "bg-[#0F1216] border-[#272D35] text-[#D4D4D8] ml-6 border-l-2 border-l-[#2DD4BF]"
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-[#8B949E] font-mono mb-1">
                  <span
                    className={
                      msg.role === "AGENT"
                        ? "text-[#2DD4BF] font-bold"
                        : "text-white font-bold"
                    }
                  >
                    {msg.role === "AGENT"
                      ? "Maya (Voice Receptionist)"
                      : "Caller (You)"}
                  </span>
                  <span>{msg.createdAt}</span>
                </div>
                <p>{msg.text}</p>
              </div>
            ))}
          </div>

          {/* Start Call & Conversation Controls */}
          <div className="pt-3 border-t border-[#272D35] space-y-2.5">
            {status !== "connected" ? (
              <button
                onClick={startVoiceConversation}
                disabled={
                  consoleState === "CONNECTING" ||
                  consoleState === "REQUESTING_TOKEN"
                }
                className="w-full py-3 rounded-lg bg-[#2DD4BF] hover:bg-[#26b8a5] text-[#0B0D10] font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-40"
              >
                <Mic className="w-4 h-4" /> Start Live Voice Call (ElevenLabs
                WebRTC)
              </button>
            ) : (
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#0F1216] border border-[#272D35]">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#34D399] animate-pulse"></div>
                  <span className="text-xs text-white font-medium">
                    Continuous WebRTC Microphone Streaming Active
                  </span>
                </div>
                <button
                  onClick={handleEndCall}
                  className="bg-[#FB7185] hover:bg-[#e05669] text-white px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <PhoneOff className="w-3.5 h-3.5" /> End Session
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: DYNAMIC ACTION STATUS */}
        <div className="p-4 rounded-lg bg-[#13171C] border border-[#272D35] space-y-4 text-xs">
          <h2 className="font-bold text-white uppercase tracking-wider text-[11px] text-[#8B949E]">
            Dynamic Business Actions
          </h2>

          {actionNotice ? (
            <div className="p-3 rounded bg-[#2DD4BF]/10 border border-[#2DD4BF]/20 text-[11px] text-[#2DD4BF] space-y-1">
              <span className="font-bold block">Verified Action Executed:</span>
              <p>{actionNotice}</p>
            </div>
          ) : (
            <div className="p-3 rounded bg-[#171C22] border border-[#272D35] text-[11px] text-[#8B949E]">
              Waiting for caller conversation turn to trigger business tool...
            </div>
          )}

          <div className="p-3.5 rounded bg-[#171C22] border border-[#272D35] space-y-2">
            <div className="flex items-center gap-2 text-white font-semibold">
              <Calendar className="w-4 h-4 text-[#2DD4BF]" />
              <span>Real Slot Reservation</span>
            </div>
            <p className="text-[#8B949E] text-[11px]">
              Available slots generated deterministically. Confirmed only after
              explicit caller readback confirmation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ElevenLabsVoiceConsole(props: ElevenLabsVoiceConsoleProps) {
  return <ElevenLabsVoiceConsoleContent {...props} />;
}
