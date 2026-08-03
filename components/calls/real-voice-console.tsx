"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Mic,
  MicOff,
  Volume2,
  PhoneOff,
  Calendar,
  Users,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  ShieldCheck,
  Trash2,
} from "lucide-react";

interface RealVoiceConsoleProps {
  scenario: "BOOKING" | "QUALIFICATION" | "ESCALATION" | "ROUTINE";
  onResetScenario: () => void;
}

export function RealVoiceConsole({
  scenario,
  onResetScenario,
}: RealVoiceConsoleProps) {
  const [listening, setListening] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [transcript, setTranscript] = useState<
    Array<{ role: string; text: string; timestamp: string }>
  >([]);
  const [currentSpeechInput, setCurrentSpeechInput] = useState("");
  const [currentState, setCurrentState] = useState("GREETING");
  const [currentIntent, setCurrentIntent] = useState("Initial Intake");
  const [turnsRemaining, setTurnsRemaining] = useState(6);
  const [timeRemaining, setTimeRemaining] = useState(180);

  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [sttProviderMode, setSttProviderMode] = useState<string>(
    "ElevenLabs Scribe Realtime",
  );

  const recognitionRef = useRef<any>(null);

  // Initialize Web Speech Recognition fallback or Scribe STT token
  useEffect(() => {
    // Attempt single-use ElevenLabs STT token fetch
    fetch("/api/demo/stt-token", { method: "POST" })
      .then((res) => res.json())
      .then((data) => {
        if (data.fallbackWebSpeech) {
          setSttProviderMode("Browser Web Speech (Fallback)");
        }
      })
      .catch(() => setSttProviderMode("Browser Web Speech (Fallback)"));

    if (
      typeof window !== "undefined" &&
      ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
    ) {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;

      rec.onresult = (event: any) => {
        let currentText = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript;
        }
        setCurrentSpeechInput(currentText);
      };

      rec.onend = () => {
        setListening(false);
        if (currentSpeechInput.trim()) {
          handleUserSpeechSubmit(currentSpeechInput.trim());
        }
      };

      recognitionRef.current = rec;
    }

    // Timer countdown interval
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          endDemoCall();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Initial greeting message
    const initialGreeting =
      scenario === "BOOKING"
        ? "Hello! Thank you for calling Northstar Legal Consultations. My name is Maya. How may I assist with your appointment today?"
        : scenario === "QUALIFICATION"
          ? "Hello! Welcome to Northstar Legal. My name is Maya. What type of commercial legal services are you inquiring about?"
          : scenario === "ESCALATION"
            ? "Northstar Legal Consultations, Maya speaking. How can I help you today?"
            : "Hello! Thank you for calling Northstar Legal. How can I assist you with our business hours or services?";

    setTranscript([
      {
        role: "AGENT",
        text: initialGreeting,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      },
    ]);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenario]);

  const toggleMicrophone = () => {
    if (listening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setListening(false);
    } else {
      setCurrentSpeechInput("");
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setListening(true);
        } catch {
          setListening(true);
        }
      } else {
        setListening(true);
      }
    }
  };

  const handleUserSpeechSubmit = async (userText: string) => {
    if (!userText || thinking || callEnded) return;

    const turnUuid = `turn_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const timeStr = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    setTranscript((prev) => [
      ...prev,
      { role: "CALLER", text: userText, timestamp: timeStr },
    ]);
    setCurrentSpeechInput("");
    setThinking(true);

    try {
      const res = await fetch("/api/demo/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: userText, clientTurnId: turnUuid }),
      });

      const data = await res.json();
      setThinking(false);

      if (data.spokenReply) {
        setTranscript((prev) => [
          ...prev,
          {
            role: "AGENT",
            text: data.spokenReply,
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            }),
          },
        ]);
        setCurrentState(data.conversationState || "RESPONDING");
        setCurrentIntent(data.detectedIntent || "General Inquiry");
        setTurnsRemaining((prev) => Math.max(0, prev - 1));

        if (data.action?.displayMessage) {
          setActionNotice(data.action.displayMessage);
        }

        // Trigger TTS playback using responseId voucher
        if (data.responseId) {
          playAgentSpeechWithResponseId(data.responseId, data.spokenReply);
        }

        if (data.shouldEnd) {
          setTimeout(() => endDemoCall(), 3000);
        }
      }
    } catch {
      setThinking(false);
    }
  };

  const playAgentSpeechWithResponseId = async (
    responseId: string,
    replyFallbackText: string,
  ) => {
    setSpeaking(true);
    try {
      const ttsRes = await fetch("/api/demo/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responseId }),
      });

      if (ttsRes.ok && ttsRes.headers.get("content-type")?.includes("audio")) {
        const blob = await ttsRes.blob();
        const audioUrl = URL.createObjectURL(blob);
        const audio = new Audio(audioUrl);
        audio.onended = () => setSpeaking(false);
        await audio.play().catch(() => setSpeaking(false));
      } else {
        // Browser SpeechSynthesis fallback
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
          const synth = window.speechSynthesis;
          const utterance = new SpeechSynthesisUtterance(
            replyFallbackText.slice(0, 350),
          );
          utterance.onend = () => setSpeaking(false);
          synth.speak(utterance);
        } else {
          setSpeaking(false);
        }
      }
    } catch {
      setSpeaking(false);
    }
  };

  const endDemoCall = async () => {
    setCallEnded(true);
    if (listening && recognitionRef.current) recognitionRef.current.stop();

    try {
      const res = await fetch("/api/demo/session/end", { method: "POST" });
      const data = await res.json();
      if (data.summary) {
        setSummaryData(data.summary);
      }
    } catch {}
  };

  const handleDeleteDemoData = async () => {
    if (
      !confirm(
        "Are you sure you want to delete all temporary records from this demo session?",
      )
    )
      return;
    setIsDeleting(true);
    try {
      await fetch("/api/demo/session/delete", { method: "POST" });
      alert("Demo data deleted successfully.");
      onResetScenario();
    } catch {
      alert("Failed to delete demo data.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (callEnded) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="p-6 rounded-lg bg-[#13171C] border border-[#272D35] space-y-6">
          <div className="flex items-center justify-between border-b border-[#272D35] pb-4">
            <div>
              <span className="text-xs font-mono text-[#34D399] uppercase font-bold">
                Call Completed & Verified
              </span>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Call Outcome & Summary
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
                <RefreshCw className="w-3.5 h-3.5" /> Try Another Scenario
              </button>
            </div>
          </div>

          {/* Business Outcome Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded bg-[#171C22] border border-[#272D35] space-y-1">
              <span className="text-[#8B949E] block">Problem Presented</span>
              <p className="font-semibold text-white">
                {summaryData?.problemPresented ||
                  "After-hours inbound consultation enquiry"}
              </p>
            </div>
            <div className="p-3.5 rounded bg-[#171C22] border border-[#272D35] space-y-1">
              <span className="text-[#8B949E] block">VoxDesk Action</span>
              <p className="font-semibold text-[#2DD4BF]">
                {summaryData?.businessOutcome ||
                  "Details gathered & calendar slot reserved"}
              </p>
            </div>
            <div className="p-3.5 rounded bg-[#171C22] border border-[#272D35] space-y-1">
              <span className="text-[#8B949E] block">Provider Modes Used</span>
              <p className="font-semibold text-[#34D399]">
                {summaryData?.providerModes?.stt || sttProviderMode}
              </p>
            </div>
          </div>

          {/* Key Discussion Points */}
          <div className="p-4 rounded bg-[#0F1216] border border-[#272D35] space-y-2 text-xs">
            <h3 className="font-bold text-white uppercase tracking-wider text-[11px] text-[#8B949E]">
              Structured Summary & Demo CRM Activity
            </h3>
            <ul className="space-y-1.5 text-[#D4D4D8]">
              {summaryData?.keyPoints?.map((pt: string, idx: number) => (
                <li key={idx} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2DD4BF] shrink-0" />
                  <span>{pt}</span>
                </li>
              )) || <li>Inbound enquiry processed successfully.</li>}
            </ul>
          </div>

          {/* Final Call To Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#272D35]">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto bg-[#2DD4BF] hover:bg-[#26b8a5] text-[#0B0D10] font-bold text-xs px-5 py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>View Fictional Demo Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              onClick={onResetScenario}
              className="w-full sm:w-auto text-xs text-[#8B949E] hover:text-white font-medium underline"
            >
              Try another scenario
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Top Bar Status */}
      <div className="p-4 rounded-lg bg-[#13171C] border border-[#272D35] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full ${speaking ? "bg-[#34D399] animate-ping" : listening ? "bg-[#2DD4BF] animate-pulse" : "bg-[#8B949E]"}`}
          ></div>
          <div>
            <span className="text-sm font-bold text-white">
              Live Voice Receptionist Sandbox
            </span>
            <span className="text-xs text-[#8B949E] block">
              Scenario: {scenario} • Northstar Legal Consultations
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="px-2.5 py-1 rounded bg-[#171C22] text-[#2DD4BF] border border-[#272D35]">
            STATE: {currentState}
          </span>
          <span className="px-2.5 py-1 rounded bg-[#171C22] text-[#F4F4F5] border border-[#272D35]">
            Turns: {turnsRemaining}/6
          </span>
          <span className="px-2.5 py-1 rounded bg-[#171C22] text-[#F4F4F5] border border-[#272D35]">
            {Math.floor(timeRemaining / 60)}:
            {(timeRemaining % 60).toString().padStart(2, "0")}
          </span>
          <button
            onClick={endDemoCall}
            className="bg-[#FB7185] hover:bg-[#e05669] text-white px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <PhoneOff className="w-3.5 h-3.5" /> End Call
          </button>
        </div>
      </div>

      {/* 3 Column Desktop Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* LEFT COLUMN: BUSINESS CONTEXT */}
        <div className="p-4 rounded-lg bg-[#13171C] border border-[#272D35] space-y-4 text-xs">
          <h2 className="font-bold text-white uppercase tracking-wider text-[11px] text-[#8B949E]">
            Business Context
          </h2>

          <div className="space-y-2">
            <div>
              <span className="text-[#8B949E] block">Target Scenario</span>
              <span className="font-semibold text-white">{scenario}</span>
            </div>
            <div>
              <span className="text-[#8B949E] block">Detected Intent</span>
              <span className="font-medium text-[#2DD4BF]">
                {currentIntent}
              </span>
            </div>
            <div>
              <span className="text-[#8B949E] block">STT Mode</span>
              <span className="text-[10px] text-[#8B949E] block pt-0.5">
                {sttProviderMode}
              </span>
            </div>
          </div>

          <hr className="border-[#272D35]" />

          {/* Portfolio Scope Side Message Panel */}
          <div className="p-3 rounded bg-[#171C22] border border-[#272D35] space-y-2">
            <span className="font-bold text-white text-[11px] block">
              Short Portfolio Demonstration
            </span>
            <p className="text-[10px] text-[#8B949E] leading-relaxed">
              This experience is intentionally limited to a short conversation.
              A production voice agent can support longer calls, custom scripts,
              live phone numbers, calendar and CRM integrations, multilingual
              voices, call routing and human transfer.
            </p>
          </div>
        </div>

        {/* CENTER COLUMN: LIVE TRANSCRIPT & CONTROLS */}
        <div className="lg:col-span-2 p-4 rounded-lg bg-[#13171C] border border-[#272D35] flex flex-col h-[520px]">
          <div className="flex items-center justify-between border-b border-[#272D35] pb-2 mb-3">
            <h2 className="font-bold text-white text-xs">
              Real-Time Conversation Stream
            </h2>
            <span className="text-[11px] font-mono text-[#2DD4BF]">
              {speaking
                ? "Maya Speaking..."
                : listening
                  ? "Listening..."
                  : thinking
                    ? "Thinking..."
                    : "Ready"}
            </span>
          </div>

          {/* Transcript Scroll Area */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 text-xs">
            {transcript.map((msg, idx) => (
              <div
                key={idx}
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
                  <span>{msg.timestamp}</span>
                </div>
                <p>{msg.text}</p>
              </div>
            ))}

            {currentSpeechInput && (
              <div className="p-2.5 rounded bg-[#0F1216] border border-[#272D35] text-xs text-[#2DD4BF] italic ml-6">
                Transcribing: &quot;{currentSpeechInput}&quot;
              </div>
            )}
          </div>

          {/* Microphone & Text Controls */}
          <div className="pt-3 border-t border-[#272D35] space-y-2">
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMicrophone}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors ${
                  listening
                    ? "bg-[#FB7185] hover:bg-[#e05669] text-white"
                    : "bg-[#2DD4BF] hover:bg-[#26b8a5] text-[#0B0D10]"
                }`}
              >
                {listening ? (
                  <>
                    <MicOff className="w-4 h-4" /> Stop Microphone
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" /> Speak into Microphone
                  </>
                )}
              </button>

              <button
                onClick={() =>
                  handleUserSpeechSubmit(
                    "I would like to confirm my consultation for next Tuesday.",
                  )
                }
                className="bg-[#171C22] hover:bg-[#1f242c] text-[#D4D4D8] border border-[#272D35] px-3 py-2.5 rounded-lg text-xs font-medium"
              >
                Quick Sample Input
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: BUSINESS ACTION */}
        <div className="p-4 rounded-lg bg-[#13171C] border border-[#272D35] space-y-4 text-xs">
          <h2 className="font-bold text-white uppercase tracking-wider text-[11px] text-[#8B949E]">
            Business Action
          </h2>

          {actionNotice && (
            <div className="p-3 rounded bg-[#2DD4BF]/10 border border-[#2DD4BF]/20 text-[11px] text-[#2DD4BF] space-y-1">
              <span className="font-bold block">Action Verified:</span>
              <p>{actionNotice}</p>
            </div>
          )}

          <div className="p-3 rounded bg-[#171C22] border border-[#272D35] space-y-2">
            <span className="font-semibold text-white block">
              Fictional Demo Calendar
            </span>
            <p className="text-[#8B949E] text-[11px]">
              Tuesday 10:00 AM slot reserved in demo database.
            </p>
          </div>

          <div className="p-3 rounded bg-[#171C22] border border-[#272D35] space-y-2">
            <span className="font-semibold text-white block">
              BANT Lead Score
            </span>
            <span className="font-bold text-[#34D399] font-mono text-[11px] block">
              HOT (85/100)
            </span>
          </div>

          <div className="p-3 rounded bg-[#171C22] border border-[#272D35] space-y-2">
            <span className="font-semibold text-white block">
              Demo CRM Activity
            </span>
            <p className="text-[#8B949E] text-[11px]">
              Contact & Call activity logged in demo workspace.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
