"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useConversation } from "@elevenlabs/react";
import {
  Mic,
  MicOff,
  PhoneOff,
  Volume2,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Shield,
  Clock,
  Sparkles,
} from "lucide-react";

export type CallState =
  | "IDLE"
  | "CHECKING_CONFIGURATION"
  | "REQUESTING_MICROPHONE"
  | "BOOTSTRAPPING_SESSION"
  | "CONNECTING"
  | "CONNECTED"
  | "LISTENING"
  | "CALLER_SPEAKING"
  | "AGENT_SPEAKING"
  | "INTERRUPTED"
  | "ENDING"
  | "FINALIZING"
  | "COMPLETED"
  | "FAILED";

export interface VoiceTranscriptLine {
  id: string;
  role: "CALLER" | "AGENT";
  text: string;
  final: boolean;
  createdAt: string;
  providerEventId?: string;
}

export interface FinalizationResult {
  sessionId: string;
  providerConversationId: string;
  durationSeconds: number;
  callerTurns: number;
  agentTurns: number;
  persistenceStatus: "PERSISTED" | "NOT_CONFIGURED" | "FAILED";
  callId?: string;
  warnings: string[];
}

export function ElevenLabsVoiceController() {
  const [callState, setCallState] = useState<CallState>("IDLE");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [transcripts, setTranscripts] = useState<VoiceTranscriptLine[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [providerConversationId, setProviderConversationId] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(180);
  const [finalResult, setFinalResult] = useState<FinalizationResult | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const activeStreamRef = useRef<MediaStream | null>(null);

  // ElevenLabs SDK integration
  const conversation = useConversation({
    onConnect: () => {
      setCallState("CONNECTED");
      startTimeRef.current = Date.now();
      setTimeRemaining(180);

      // Start 180-second active duration timer ONLY in onConnect
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            handleEndCall("TIME_LIMIT");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    },
    onDisconnect: () => {
      if (callState !== "FINALIZING" && callState !== "COMPLETED" && callState !== "FAILED") {
        handleFinalizeCall("PROVIDER_DISCONNECTED");
      }
    },
    onMessage: (message: any) => {
      if (!message) return;
      const text = message.message || message.text || "";
      const source = message.source || message.role || (message.user ? "user" : "ai");
      const isUser = source === "user" || source === "CALLER";

      if (!text.trim()) return;

      const newLine: VoiceTranscriptLine = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        role: isUser ? "CALLER" : "AGENT",
        text: text.trim(),
        final: true,
        createdAt: new Date().toISOString(),
        providerEventId: message.id || message.eventId,
      };

      setTranscripts((prev) => [...prev, newLine]);
    },
    onModeChange: (mode: { mode: "speaking" | "listening" }) => {
      if (mode.mode === "speaking") {
        setCallState("AGENT_SPEAKING");
      } else if (mode.mode === "listening") {
        setCallState("LISTENING");
      }
    },
    onError: (error: string | Error) => {
      console.error("[ELEVENLABS SDK ERROR]:", error);
      const msg = typeof error === "string" ? error : error.message;
      setErrorMessage(msg || "Voice conversation error occurred.");
      setCallState("FAILED");
      cleanupAudio();
    },
  });

  const cleanupAudio = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (activeStreamRef.current) {
      activeStreamRef.current.getTracks().forEach((track) => track.stop());
      activeStreamRef.current = null;
    }
  };

  const handleStartCall = async () => {
    setErrorMessage(null);
    setTranscripts([]);
    setFinalResult(null);
    setCallState("CHECKING_CONFIGURATION");

    try {
      // Step 1: Health check
      const healthRes = await fetch("/api/health/voice", { cache: "no-store" });
      if (!healthRes.ok) {
        throw new Error("Voice health check returned server error.");
      }
      const health = await healthRes.json();
      if (!health.readyForVoice) {
        throw new Error(
          "Voice service is not ready. ElevenLabs API key or agent verification failed."
        );
      }

      // Step 2: Request Microphone Permission
      setCallState("REQUESTING_MICROPHONE");
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        activeStreamRef.current = stream;
      } catch (micErr: any) {
        if (micErr.name === "NotAllowedError" || micErr.name === "PermissionDeniedError") {
          throw new Error("Microphone permission was denied.");
        } else if (micErr.name === "NotFoundError" || micErr.name === "DevicesNotFoundError") {
          throw new Error("No microphone was detected.");
        } else if (micErr.name === "NotReadableError" || micErr.name === "TrackStartError") {
          throw new Error("The microphone is being used by another application.");
        } else if (micErr.name === "SecurityError") {
          throw new Error("The browser blocked audio access.");
        } else {
          throw new Error(`Microphone access failed: ${micErr.message || micErr}`);
        }
      }

      // Unlock AudioContext inside gesture handler
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        if (ctx.state === "suspended") {
          await ctx.resume();
        }
      }

      // Step 3: Bootstrap session
      setCallState("BOOTSTRAPPING_SESSION");
      const bootstrapRes = await fetch("/api/demo/voice-bootstrap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          presetKey: "LEGAL",
          language: "en-US",
          scenario: "QUALIFICATION",
        }),
      });

      if (!bootstrapRes.ok) {
        const errData = await bootstrapRes.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to bootstrap voice session.");
      }

      const bootstrapData = await bootstrapRes.json();
      setSessionId(bootstrapData.sessionId);

      // Step 4: Connect ElevenLabs Session
      setCallState("CONNECTING");
      if (bootstrapData.conversationToken?.startsWith("wss://") || bootstrapData.conversationToken?.startsWith("ws://")) {
        await conversation.startSession({
          signedUrl: bootstrapData.conversationToken,
        });
      } else {
        await conversation.startSession({
          conversationToken: bootstrapData.conversationToken,
        } as any);
      }

      // Conversation ID tracking
      if ((conversation as any).getId) {
        setProviderConversationId((conversation as any).getId());
      }
    } catch (err: any) {
      console.error("[START CALL FAILED]:", err);
      setErrorMessage(err.message || "Failed to establish voice call.");
      setCallState("FAILED");
      cleanupAudio();
    }
  };

  const handleEndCall = async (reason: "USER_ENDED" | "TIME_LIMIT" = "USER_ENDED") => {
    setCallState("ENDING");
    try {
      await conversation.endSession();
    } catch (e) {
      console.warn("Error ending session:", e);
    }
    await handleFinalizeCall(reason);
  };

  const handleFinalizeCall = useCallback(
    async (
      terminationReason: "USER_ENDED" | "TIME_LIMIT" | "PROVIDER_DISCONNECTED" | "ERROR"
    ) => {
      setCallState("FINALIZING");
      cleanupAudio();

      const endedAt = new Date().toISOString();
      const startedAt = startTimeRef.current
        ? new Date(startTimeRef.current).toISOString()
        : endedAt;

      try {
        const finalizeRes = await fetch("/api/demo/voice-finalize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            providerConversationId: providerConversationId || "conv_masked_realtime",
            transcript: transcripts,
            startedAt,
            endedAt,
            terminationReason,
          }),
        });

        if (!finalizeRes.ok) {
          throw new Error("Finalization endpoint returned error status.");
        }

        const finalizeData = await finalizeRes.json();
        if (finalizeData.success && finalizeData.result) {
          setFinalResult(finalizeData.result);
          setCallState("COMPLETED");
        } else {
          throw new Error(finalizeData.message || "Finalization failed.");
        }
      } catch (err: any) {
        console.error("[FINALIZATION FAILED]:", err);
        setErrorMessage(err.message || "Truthful call finalization failed.");
        setCallState("FAILED");
      }
    },
    [sessionId, providerConversationId, transcripts]
  );

  useEffect(() => {
    return () => {
      cleanupAudio();
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const isCallActive = [
    "CONNECTED",
    "LISTENING",
    "CALLER_SPEAKING",
    "AGENT_SPEAKING",
    "INTERRUPTED",
  ].includes(callState);

  const isConnecting = [
    "CHECKING_CONFIGURATION",
    "REQUESTING_MICROPHONE",
    "BOOTSTRAPPING_SESSION",
    "CONNECTING",
  ].includes(callState);

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-slate-100 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              Northstar Legal Consultations
            </h2>
            <p className="text-xs text-slate-400">
              Agent: <span className="font-semibold text-slate-200">Maya</span> (Virtual Receptionist) • Language: English (en-US)
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-xs text-slate-300 flex items-center space-x-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>WebRTC Encrypted</span>
          </div>

          {isCallActive && (
            <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-xs font-mono text-amber-400 flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTime(timeRemaining)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Call Body */}
      <div className="my-8 flex flex-col items-center justify-center min-h-[220px]">
        {callState === "IDLE" && (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-indigo-600/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 animate-pulse">
              <Volume2 className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Ready for Legal Intake Call</h3>
              <p className="text-sm text-slate-400 max-w-md mx-auto mt-1">
                Click below to start a live WebRTC audio call with Maya. Speak naturally to test intake, qualification, and interruption handling.
              </p>
            </div>
            <button
              onClick={handleStartCall}
              id="start-live-voice-call-btn"
              className="px-8 py-3.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/20 transition-all duration-200 flex items-center space-x-2.5 mx-auto"
            >
              <Mic className="w-5 h-5" />
              <span>Start Live Voice Call</span>
            </button>
          </div>
        )}

        {isConnecting && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-200">
                {callState === "CHECKING_CONFIGURATION" && "Checking ElevenLabs provider configuration..."}
                {callState === "REQUESTING_MICROPHONE" && "Requesting microphone permission..."}
                {callState === "BOOTSTRAPPING_SESSION" && "Issuing real ElevenLabs conversation token..."}
                {callState === "CONNECTING" && "Establishing WebRTC voice connection..."}
              </p>
              <p className="text-xs text-slate-400">Please remain on this page</p>
            </div>
          </div>
        )}

        {isCallActive && (
          <div className="w-full space-y-6">
            <div className="flex items-center justify-between p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      callState === "AGENT_SPEAKING"
                        ? "bg-emerald-400 animate-ping"
                        : callState === "CALLER_SPEAKING"
                        ? "bg-indigo-400 animate-pulse"
                        : "bg-emerald-500"
                    }`}
                  />
                </div>
                <span className="text-sm font-medium text-slate-200">
                  {callState === "AGENT_SPEAKING" && "Maya is speaking..."}
                  {callState === "CALLER_SPEAKING" && "Listening to caller..."}
                  {callState === "LISTENING" && "Maya is listening..."}
                  {callState === "CONNECTED" && "Call Connected — Waiting for Maya's greeting..."}
                </span>
              </div>

              <button
                onClick={() => handleEndCall("USER_ENDED")}
                id="end-live-voice-call-btn"
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium rounded-lg shadow-md transition-colors flex items-center space-x-2"
              >
                <PhoneOff className="w-4 h-4" />
                <span>End Call</span>
              </button>
            </div>

            {/* Live Transcript View */}
            <div className="h-64 overflow-y-auto p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
              {transcripts.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-500 italic">
                  Conversation transcripts will appear here in real-time...
                </div>
              ) : (
                transcripts.map((t) => (
                  <div
                    key={t.id}
                    className={`flex flex-col ${
                      t.role === "CALLER" ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-xl text-sm ${
                        t.role === "CALLER"
                          ? "bg-indigo-600 text-white rounded-br-none"
                          : "bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none"
                      }`}
                    >
                      <p className="text-xs font-semibold mb-1 opacity-75">
                        {t.role === "CALLER" ? "Caller" : "Maya (Northstar Legal)"}
                      </p>
                      <p>{t.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {(callState === "ENDING" || callState === "FINALIZING") && (
          <div className="text-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-400" />
            <p className="text-sm text-slate-300">Finalizing call receipt and transcripts...</p>
          </div>
        )}

        {callState === "COMPLETED" && finalResult && (
          <div className="w-full space-y-6 text-left">
            <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-xl flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-emerald-300">
                  Call Finalized Truthfully
                </h4>
                <p className="text-xs text-emerald-400/80 mt-0.5">
                  The voice session completed successfully via ElevenLabs WebRTC.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                <span className="text-slate-400 block">Duration</span>
                <span className="text-sm font-semibold text-slate-200">
                  {finalResult.durationSeconds} seconds
                </span>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                <span className="text-slate-400 block">Caller Turns</span>
                <span className="text-sm font-semibold text-slate-200">
                  {finalResult.callerTurns} turns
                </span>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                <span className="text-slate-400 block">Agent Turns</span>
                <span className="text-sm font-semibold text-slate-200">
                  {finalResult.agentTurns} turns
                </span>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                <span className="text-slate-400 block">Persistence Status</span>
                <span
                  className={`text-sm font-semibold ${
                    finalResult.persistenceStatus === "PERSISTED"
                      ? "text-emerald-400"
                      : "text-amber-400"
                  }`}
                >
                  {finalResult.persistenceStatus}
                </span>
              </div>
            </div>

            {finalResult.warnings.length > 0 && (
              <div className="p-3 bg-amber-950/30 border border-amber-500/20 rounded-lg text-xs text-amber-300">
                <p className="font-semibold mb-1">Warnings:</p>
                <ul className="list-disc list-inside space-y-0.5 text-amber-300/80">
                  {finalResult.warnings.map((w, idx) => (
                    <li key={idx}>{w}</li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={() => setCallState("IDLE")}
              className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg border border-slate-700 transition-colors mx-auto block"
            >
              Start New Call
            </button>
          </div>
        )}

        {callState === "FAILED" && (
          <div className="w-full p-4 bg-rose-950/40 border border-rose-500/30 rounded-xl space-y-4 text-left">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-rose-300">Voice Call Error</h4>
                <p className="text-xs text-rose-400/90 mt-1">
                  {errorMessage || "An unexpected error occurred during the voice session."}
                </p>
              </div>
            </div>
            <button
              onClick={() => setCallState("IDLE")}
              className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>

      {/* Footer Telemetry Banner (Truthful Data Only) */}
      <div className="pt-4 border-t border-slate-800 text-xs text-slate-500 grid grid-cols-2 md:grid-cols-4 gap-2">
        <div>
          <span className="text-slate-400">Provider:</span> ElevenLabs Conversational AI
        </div>
        <div>
          <span className="text-slate-400">Transport:</span> WebRTC
        </div>
        <div>
          <span className="text-slate-400">Conversation ID:</span>{" "}
          {providerConversationId
            ? `${providerConversationId.slice(0, 8)}...`
            : "Not connected"}
        </div>
        <div>
          <span className="text-slate-400">Latency / Metrics:</span> Not measured
        </div>
      </div>
    </div>
  );
}
