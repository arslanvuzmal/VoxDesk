"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  submitDemoTurn,
  requestSTTToken,
  requestTTS,
  endDemoSession,
  deleteDemoSession,
  disconnectSTTConnection,
  DemoApiError,
} from "@/lib/client/demo-api";
import {
  Mic,
  MicOff,
  PhoneOff,
  Calendar,
  Users,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  Trash2,
  Send,
  RotateCcw,
  BookOpen,
  Volume2,
} from "lucide-react";

interface RealVoiceConsoleProps {
  scenario?: "BOOKING" | "QUALIFICATION" | "ESCALATION" | "ROUTINE";
  onResetScenario?: () => void;
  onCallEnded?: (finalTurnData: any) => void;
}

export function RealVoiceConsole({
  scenario = "BOOKING",
  onResetScenario,
  onCallEnded,
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
  const [manualInput, setManualInput] = useState("");
  const [currentState, setCurrentState] = useState("GREETING");
  const [currentIntent, setCurrentIntent] = useState("Initial Intake");
  const [turnsRemaining, setTurnsRemaining] = useState(6);
  const [timeRemaining, setTimeRemaining] = useState(180);

  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [sttProviderMode, setSttProviderMode] = useState<string>(
    "Connecting to ElevenLabs...",
  );
  const [lastAudioBlob, setLastAudioBlob] = useState<Blob | null>(null);

  // Error state
  const [conversationError, setConversationError] = useState<{
    message: string;
    code?: string;
    status?: number;
    canRetry?: boolean;
  } | null>(null);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [lastFailedInput, setLastFailedInput] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef<string>("");
  const interimTranscriptRef = useRef<string>("");

  // Initialize Speech Recognition fallback & ElevenLabs token check
  useEffect(() => {
    // 1. STT Token Check
    requestSTTToken()
      .then(() => {
        setSttProviderMode("ElevenLabs Scribe Realtime");
      })
      .catch(() => {
        setSttProviderMode("Browser transcription fallback");
      });

    // 2. Browser Web Speech Fallback Setup
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
        let finalStr = "";
        let interimStr = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const trans = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalStr += trans;
          } else {
            interimStr += trans;
          }
        }
        if (finalStr) {
          finalTranscriptRef.current = (
            finalTranscriptRef.current +
            " " +
            finalStr
          ).trim();
        }
        interimTranscriptRef.current = interimStr;
        setCurrentSpeechInput(
          (finalTranscriptRef.current + " " + interimStr).trim(),
        );
      };

      rec.onerror = (event: any) => {
        console.warn("[SPEECH RECOGNITION ERROR]:", event.error);
        setListening(false);
        if (event.error === "not-allowed") {
          setSttProviderMode("Text input mode (Mic permission denied)");
        }
      };

      rec.onend = () => {
        setListening(false);
        const finalText = finalTranscriptRef.current.trim();
        if (finalText) {
          handleUserSpeechSubmit(finalText);
        }
        finalTranscriptRef.current = "";
        interimTranscriptRef.current = "";
        setCurrentSpeechInput("");
        disconnectSTTConnection().catch(() => {});
      };

      recognitionRef.current = rec;
    } else {
      setSttProviderMode("Text input mode (Browser unsupported)");
    }

    // 3. Call Duration Countdown Timer
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleEndDemoCall();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // 4. Scenario Greeting
    const initialGreeting =
      scenario === "BOOKING"
        ? "Hello! Thank you for calling Northstar Legal Consultations. My name is Maya. How may I assist with your consultation appointment today?"
        : scenario === "QUALIFICATION"
          ? "Hello! Welcome to Northstar Legal. My name is Maya. What type of legal services or support are you inquiring about?"
          : scenario === "ESCALATION"
            ? "Northstar Legal Consultations, Maya speaking. How can I help you with your legal matter today?"
            : "Hello! Thank you for calling Northstar Legal. How can I assist you with our business hours or consultation services?";

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

    return () => {
      clearInterval(interval);
      disconnectSTTConnection().catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenario]);

  const toggleMicrophone = () => {
    if (sessionExpired || callEnded) return;

    if (listening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setListening(false);
      disconnectSTTConnection().catch(() => {});
    } else {
      finalTranscriptRef.current = "";
      interimTranscriptRef.current = "";
      setCurrentSpeechInput("");
      setConversationError(null);

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
    if (!userText || thinking || callEnded || sessionExpired) return;

    const turnUuid =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `turn_${Date.now()}_${Math.random().toString(36).slice(2)}`;

    const timeStr = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    setTranscript((prev) => [
      ...prev,
      { role: "CALLER", text: userText, timestamp: timeStr },
    ]);
    setManualInput("");
    setCurrentSpeechInput("");
    setThinking(true);
    setConversationError(null);
    setLastFailedInput(null);

    try {
      const data = await submitDemoTurn({
        transcript: userText,
        clientTurnId: turnUuid,
      });

      setThinking(false);

      if (data.spokenReply) {
        if (data.shouldEnd && onCallEnded) {
          setCallEnded(true);
          onCallEnded(data.finalCallResult || data);
        }
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
        setCurrentIntent(data.actionTaken || "General Inquiry");
        setTurnsRemaining(
          typeof data.turnsRemaining === "number" ? data.turnsRemaining : 5,
        );

        if (data.actionTaken) {
          setActionNotice(data.actionTaken);
        }

        // Trigger TTS playback using responseId voucher
        if (data.responseId) {
          playAgentSpeechWithResponseId(data.responseId, data.spokenReply);
        }
      }
    } catch (err: any) {
      setThinking(false);
      setLastFailedInput(userText);

      if (err instanceof DemoApiError) {
        if (
          err.status === 401 ||
          err.code === "SESSION_EXPIRED" ||
          err.code === "SESSION_NOT_FOUND"
        ) {
          setSessionExpired(true);
          setConversationError({
            message:
              "This short demo session ended. Start a new session to continue.",
            code: err.code,
            status: err.status,
            canRetry: false,
          });
        } else if (err.status === 429) {
          setConversationError({
            message: err.message,
            code: err.code,
            status: err.status,
            canRetry: false,
          });
        } else {
          setConversationError({
            message:
              err.message || "The response service encountered an error.",
            code: err.code,
            status: err.status,
            canRetry: true,
          });
        }
      } else {
        setConversationError({
          message:
            "Connection error: Could not reach VoxDesk AI response engine.",
          code: "NETWORK_ERROR",
          canRetry: true,
        });
      }
    }
  };

  const handleRetryLastTurn = () => {
    if (lastFailedInput) {
      handleUserSpeechSubmit(lastFailedInput);
    }
  };

  const playAgentSpeechWithResponseId = async (
    responseId: string,
    replyFallbackText: string,
  ) => {
    setSpeaking(true);
    try {
      const ttsData = await requestTTS(responseId);
      if (ttsData.audioBuffer) {
        const blob = new Blob([ttsData.audioBuffer], {
          type: ttsData.contentType,
        });
        setLastAudioBlob(blob);
        const audioUrl = URL.createObjectURL(blob);
        const audio = new Audio(audioUrl);
        audio.onended = () => {
          setSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };
        audio.onerror = () => {
          setSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };
        await audio.play().catch(() => setSpeaking(false));
      } else {
        fallbackBrowserSpeech(replyFallbackText);
      }
    } catch {
      fallbackBrowserSpeech(replyFallbackText);
    }
  };

  const fallbackBrowserSpeech = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const synth = window.speechSynthesis;
      const utterance = new SpeechSynthesisUtterance(text.slice(0, 350));
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      synth.speak(utterance);
    } else {
      setSpeaking(false);
    }
  };

  const replayLastSpeech = () => {
    if (!lastAudioBlob) return;
    setSpeaking(true);
    const audioUrl = URL.createObjectURL(lastAudioBlob);
    const audio = new Audio(audioUrl);
    audio.onended = () => setSpeaking(false);
    audio.onerror = () => setSpeaking(false);
    audio.play().catch(() => setSpeaking(false));
  };

  const handleEndDemoCall = async () => {
    setCallEnded(true);
    if (listening && recognitionRef.current) recognitionRef.current.stop();
    disconnectSTTConnection().catch(() => {});

    try {
      const data = await endDemoSession();
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
      await deleteDemoSession();
      alert("Demo data deleted successfully.");
      onResetScenario?.();
    } catch {
      alert("Failed to delete demo data.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Scenario-specific sample input messages
  const sampleMessage =
    scenario === "BOOKING"
      ? "I need an initial consultation next Tuesday afternoon."
      : scenario === "QUALIFICATION"
        ? "We need commercial contract support this month and have a budget of around fifteen thousand dollars."
        : scenario === "ESCALATION"
          ? "This is urgent and I need to speak with a lawyer today."
          : "What are your opening hours?";

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
                  "Inbound legal service enquiry"}
              </p>
            </div>
            <div className="p-3.5 rounded bg-[#171C22] border border-[#272D35] space-y-1">
              <span className="text-[#8B949E] block">VoxDesk Action</span>
              <p className="font-semibold text-[#2DD4BF]">
                {summaryData?.businessOutcome ||
                  "Details recorded & CRM activity logged"}
              </p>
            </div>
            <div className="p-3.5 rounded bg-[#171C22] border border-[#272D35] space-y-1">
              <span className="text-[#8B949E] block">Provider Modes Used</span>
              <p className="font-semibold text-[#34D399]">{sttProviderMode}</p>
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
            onClick={handleEndDemoCall}
            className="bg-[#FB7185] hover:bg-[#e05669] text-white px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <PhoneOff className="w-3.5 h-3.5" /> End Call
          </button>
        </div>
      </div>

      {/* Error / Expired Session Notice Banner */}
      {conversationError && (
        <div className="p-4 rounded-lg bg-red-950/60 border border-red-800 space-y-3 text-xs">
          <div className="flex items-start gap-3 text-red-200 font-semibold">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p>{conversationError.message}</p>
              {conversationError.code && (
                <p className="font-mono text-[11px] text-red-400">
                  Code: {conversationError.code}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            {sessionExpired ? (
              <>
                <button
                  onClick={onResetScenario}
                  className="px-3.5 py-1.5 rounded bg-red-900 hover:bg-red-800 text-white font-bold flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Start New Session</span>
                </button>

                <Link
                  href="/demo/story"
                  className="px-3.5 py-1.5 rounded bg-[#171C22] hover:bg-[#202730] text-gray-300 font-medium border border-[#272D35] flex items-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#2DD4BF]" />
                  <span>Open Guided Walkthrough</span>
                </Link>
              </>
            ) : conversationError.canRetry ? (
              <button
                onClick={handleRetryLastTurn}
                disabled={thinking}
                className="px-3 py-1.5 rounded bg-amber-900 hover:bg-amber-800 text-amber-100 font-bold flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry Turn</span>
              </button>
            ) : (
              <Link
                href="/demo/story"
                className="px-3.5 py-1.5 rounded bg-[#171C22] hover:bg-[#202730] text-gray-300 font-medium border border-[#272D35] flex items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#2DD4BF]" />
                <span>Open Guided Walkthrough</span>
              </Link>
            )}
          </div>
        </div>
      )}

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
              <span className="text-[#8B949E] block">Detected Action</span>
              <span className="font-medium text-[#2DD4BF]">
                {currentIntent}
              </span>
            </div>
            <div>
              <span className="text-[#8B949E] block">STT Mode</span>
              <span className="text-[10px] text-[#8B949E] block pt-0.5 font-mono">
                {sttProviderMode}
              </span>
            </div>
          </div>

          {lastAudioBlob && (
            <button
              onClick={replayLastSpeech}
              disabled={speaking}
              className="w-full py-2 px-3 rounded bg-[#171C22] hover:bg-[#202730] border border-[#272D35] text-[#2DD4BF] font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <Volume2 className="w-3.5 h-3.5" /> Replay Agent Voice
            </button>
          )}

          <hr className="border-[#272D35]" />

          {/* Portfolio Scope Panel */}
          <div className="p-3 rounded bg-[#171C22] border border-[#272D35] space-y-2">
            <span className="font-bold text-white text-[11px] block">
              Portfolio Verification Rules
            </span>
            <p className="text-[10px] text-[#8B949E] leading-relaxed">
              Demonstration calls are rate-limited to 6 turns and 3 minutes per
              session. All actions use persistent demo providers.
            </p>
          </div>
        </div>

        {/* CENTER COLUMN: LIVE TRANSCRIPT & CONTROLS */}
        <div className="lg:col-span-2 p-4 rounded-lg bg-[#13171C] border border-[#272D35] flex flex-col h-[560px]">
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

          {/* Microphone, Sample Input & Manual Text Controls */}
          <div className="pt-3 border-t border-[#272D35] space-y-2.5">
            <div className="flex items-center gap-2">
              <button
                disabled={thinking || sessionExpired || callEnded}
                onClick={toggleMicrophone}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-40 ${
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
                disabled={thinking || sessionExpired || callEnded}
                onClick={() => handleUserSpeechSubmit(sampleMessage)}
                className="bg-[#171C22] hover:bg-[#1f242c] text-[#D4D4D8] border border-[#272D35] px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-40 shrink-0"
              >
                Quick Sample Input
              </button>
            </div>

            {/* Manual Text Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (manualInput.trim() && !thinking && !sessionExpired) {
                  handleUserSpeechSubmit(manualInput.trim());
                }
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={manualInput}
                maxLength={600}
                disabled={thinking || sessionExpired || callEnded}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="Type what the caller would say…"
                className="flex-1 bg-[#0F1216] border border-[#272D35] rounded-lg px-3 py-2 text-xs text-white placeholder-[#8B949E] focus:outline-none focus:border-[#2DD4BF] disabled:opacity-40"
              />
              <button
                type="submit"
                disabled={
                  !manualInput.trim() || thinking || sessionExpired || callEnded
                }
                className="bg-[#2DD4BF] hover:bg-[#26b8a5] text-[#0B0D10] px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-center disabled:opacity-40 transition-colors shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: DYNAMIC BUSINESS ACTION */}
        <div className="p-4 rounded-lg bg-[#13171C] border border-[#272D35] space-y-4 text-xs">
          <h2 className="font-bold text-white uppercase tracking-wider text-[11px] text-[#8B949E]">
            Dynamic Business Actions
          </h2>

          {actionNotice ? (
            <div className="p-3 rounded bg-[#2DD4BF]/10 border border-[#2DD4BF]/20 text-[11px] text-[#2DD4BF] space-y-1">
              <span className="font-bold block">Verified Action:</span>
              <p>{actionNotice}</p>
            </div>
          ) : (
            <div className="p-3 rounded bg-[#171C22] border border-[#272D35] text-[11px] text-[#8B949E]">
              Waiting for caller input to trigger dynamic business action...
            </div>
          )}

          {/* Scenario-Specific Dynamic Cards */}
          {scenario === "BOOKING" && (
            <div className="p-3.5 rounded bg-[#171C22] border border-[#272D35] space-y-2">
              <div className="flex items-center gap-2 text-white font-semibold">
                <Calendar className="w-4 h-4 text-[#2DD4BF]" />
                <span>Demo Calendar Status</span>
              </div>
              <p className="text-[#8B949E] text-[11px]">
                {currentState === "CONFIRMED" ||
                actionNotice?.includes("confirmed")
                  ? "Appointment slot confirmed in demo database."
                  : "Checking initial consultation availability..."}
              </p>
            </div>
          )}

          {scenario === "QUALIFICATION" && (
            <div className="p-3.5 rounded bg-[#171C22] border border-[#272D35] space-y-2">
              <div className="flex items-center gap-2 text-white font-semibold">
                <Users className="w-4 h-4 text-[#34D399]" />
                <span>BANT Lead Qualification</span>
              </div>
              <p className="text-[#8B949E] text-[11px]">
                {actionNotice?.includes("HOT")
                  ? "Scored: HOT Lead (High commercial intent)"
                  : "Evaluating budget, authority & timeline requirements..."}
              </p>
            </div>
          )}

          {scenario === "ESCALATION" && (
            <div className="p-3.5 rounded bg-[#171C22] border border-[#272D35] space-y-2">
              <div className="flex items-center gap-2 text-white font-semibold">
                <PhoneOff className="w-4 h-4 text-[#FBBF24]" />
                <span>Urgent Handoff Brief</span>
              </div>
              <p className="text-[#8B949E] text-[11px]">
                {actionNotice?.includes("Brief") ||
                actionNotice?.includes("escalat")
                  ? "Transfer brief created for duty attorney."
                  : "Monitoring conversation for urgency triggers..."}
              </p>
            </div>
          )}

          <div className="p-3.5 rounded bg-[#171C22] border border-[#272D35] space-y-2">
            <span className="font-semibold text-white block">
              Demo CRM Integration
            </span>
            <p className="text-[#8B949E] text-[11px]">
              Fictional contact and call activities recorded in demo database.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
