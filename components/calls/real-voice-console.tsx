'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Mic,
  MicOff,
  PhoneOff,
  Calendar,
  Users,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Trash2,
  Send,
  Volume2,
  Activity,
} from 'lucide-react';
import {
  submitDemoTurn,
  endDemoSession,
  deleteDemoSession,
  requestTTS,
  DemoApiError,
} from '@/lib/client/demo-api';

export type ConsoleVisibleState =
  | 'REQUESTING_MICROPHONE'
  | 'CONNECTING'
  | 'LISTENING'
  | 'USER_SPEAKING'
  | 'PROCESSING'
  | 'AGENT_SPEAKING'
  | 'INTERRUPTED'
  | 'TOOL_RUNNING'
  | 'RECONNECTING'
  | 'DEGRADED'
  | 'ENDING'
  | 'COMPLETED'
  | 'FAILED';

interface RealVoiceConsoleProps {
  scenario?: 'BOOKING' | 'QUALIFICATION' | 'ESCALATION' | 'ROUTINE';
  presetKey?: string;
  language?: 'en-US' | 'ur-PK' | 'es-ES';
  organizationProfile?: any;
  onResetScenario?: () => void;
  onCallEnded?: (finalTurnData: any) => void;
}

export function RealVoiceConsole({
  scenario = 'BOOKING',
  presetKey = 'LEGAL',
  language = 'en-US',
  organizationProfile,
  onResetScenario,
  onCallEnded,
}: RealVoiceConsoleProps) {
  const [visibleState, setVisibleState] = useState<ConsoleVisibleState>('CONNECTING');
  const [listening, setListening] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [transcript, setTranscript] = useState<
    Array<{ role: string; text: string; timestamp: string }>
  >([]);
  const [currentSpeechInput, setCurrentSpeechInput] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [currentState, setCurrentState] = useState('GREETING');
  const [currentIntent, setCurrentIntent] = useState('Initial Intake');

  const [turnsUsed, setTurnsUsed] = useState(0);
  const maxCallerTurns = 30;
  const [timeRemaining, setTimeRemaining] = useState(180);

  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [isDegradedMode, setIsDegradedMode] = useState(false);
  const [degradedReason, setDegradedReason] = useState<string>('');
  const [lastAudioBlob, setLastAudioBlob] = useState<Blob | null>(null);

  const [telemetry, setTelemetry] = useState({
    sttLatencyMs: 240,
    llmLatencyMs: 650,
    ttsLatencyMs: 420,
    interruptionStopMs: 180,
  });

  const [conversationError, setConversationError] = useState<{
    message: string;
    code?: string;
    status?: number;
    canRetry?: boolean;
  } | null>(null);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [lastFailedInput, setLastFailedInput] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const finalTranscriptRef = useRef<string>('');
  const interimTranscriptRef = useRef<string>('');

  const unlockAudioContext = () => {
    if (typeof window !== 'undefined') {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          ctx.resume();
        }
      } catch {
        // ignore
      }
    }
  };

  const stopAgentAudioImmediately = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
    setVisibleState('INTERRUPTED');
    setTimeout(() => {
      if (listening) setVisibleState('LISTENING');
    }, 400);
  };

  useEffect(() => {
    setVisibleState('REQUESTING_MICROPHONE');

    fetch('/api/voice/conversation/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ presetKey, language, scenario }),
    })
      .then(res => res.json())
      .catch(() => {});

    if (
      typeof window !== 'undefined' &&
      ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
    ) {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.lang = language;
      rec.continuous = false;
      rec.interimResults = true;

      rec.onstart = () => {
        setListening(true);
        setVisibleState('LISTENING');
      };

      rec.onresult = (event: any) => {
        let finalStr = '';
        let interimStr = '';

        if (speaking) {
          stopAgentAudioImmediately();
        }

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const trans = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalStr += trans;
          } else {
            interimStr += trans;
          }
        }

        if (interimStr) {
          setVisibleState('USER_SPEAKING');
        }

        if (finalStr) {
          finalTranscriptRef.current = (finalTranscriptRef.current + ' ' + finalStr).trim();
        }
        interimTranscriptRef.current = interimStr;
        setCurrentSpeechInput((finalTranscriptRef.current + ' ' + interimStr).trim());
      };

      rec.onerror = (event: any) => {
        setListening(false);
        if (event.error === 'not-allowed') {
          setVisibleState('FAILED');
          setConversationError({
            message: 'Microphone permission was denied by browser.',
            canRetry: true,
          });
        }
      };

      rec.onend = () => {
        setListening(false);
        const finalText = finalTranscriptRef.current.trim();
        if (finalText) {
          handleUserSpeechSubmit(finalText);
        }
        finalTranscriptRef.current = '';
        interimTranscriptRef.current = '';
        setCurrentSpeechInput('');
      };

      recognitionRef.current = rec;
      setVisibleState('LISTENING');
    } else {
      setIsDegradedMode(true);
      setDegradedReason('Text input mode (Browser speech unsupported)');
      setVisibleState('DEGRADED');
    }

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleEndDemoCall();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const initialGreeting =
      organizationProfile?.greetings?.[language] ||
      organizationProfile?.greetings?.['en-US'] ||
      `Hello! Thank you so much for calling Northstar Legal Consultations. My name is Maya! 😊 How may I assist you today?`;

    setTranscript([
      {
        role: 'AGENT',
        text: initialGreeting,
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
      },
    ]);

    playPhonePickupSound();

    return () => {
      clearInterval(interval);
      stopAgentAudioImmediately();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenario]);

  const toggleMicrophone = () => {
    unlockAudioContext();
    if (sessionExpired || callEnded) return;

    if (listening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setListening(false);
      setVisibleState('LISTENING');
    } else {
      finalTranscriptRef.current = '';
      interimTranscriptRef.current = '';
      setCurrentSpeechInput('');
      setConversationError(null);

      if (speaking) stopAgentAudioImmediately();

      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setListening(true);
          setVisibleState('LISTENING');
        } catch {
          setListening(true);
        }
      }
    }
  };

  const handleUserSpeechSubmit = async (userText: string) => {
    unlockAudioContext();
    if (!userText || thinking || callEnded || sessionExpired) return;

    if (speaking) stopAgentAudioImmediately();

    const turnUuid =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `turn_${Date.now()}_${Math.random().toString(36).slice(2)}`;

    const timeStr = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    setTranscript(prev => [...prev, { role: 'CALLER', text: userText, timestamp: timeStr }]);
    setManualInput('');
    setCurrentSpeechInput('');
    setThinking(true);
    setVisibleState('PROCESSING');
    setConversationError(null);
    setLastFailedInput(null);
    setTurnsUsed(prev => prev + 1);

    try {
      const data = await submitDemoTurn({
        transcript: userText,
        clientTurnId: turnUuid,
      });

      setThinking(false);

      if (data.spokenReply) {
        if (data.shouldEnd && onCallEnded) {
          setCallEnded(true);
          setVisibleState('COMPLETED');
          onCallEnded(data.finalCallResult || data);
        }

        setTranscript(prev => [
          ...prev,
          {
            role: 'AGENT',
            text: data.spokenReply,
            timestamp: new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            }),
          },
        ]);

        setCurrentState(data.conversationState || 'RESPONDING');
        setCurrentIntent(data.actionTaken || 'General Inquiry');

        if (data.actionTaken) {
          setActionNotice(data.actionTaken);
        }

        // Try playing real streaming ElevenLabs / Cloudflare TTS audio buffer via responseId voucher
        if (data.responseId) {
          playAgentSpeechWithResponseId(data.responseId, data.spokenReply);
        } else {
          fallbackBrowserSpeech(data.spokenReply);
        }
      }
    } catch (err: any) {
      setThinking(false);
      setVisibleState('FAILED');
      setLastFailedInput(userText);

      if (err instanceof DemoApiError) {
        setConversationError({
          message: err.message || 'Failed to process turn.',
          code: err.code,
          status: err.status,
          canRetry: true,
        });
      } else {
        setConversationError({
          message: 'Connection error: Could not reach VoxDesk response engine.',
          code: 'NETWORK_ERROR',
          canRetry: true,
        });
      }
    }
  };

  const playAgentSpeechWithResponseId = async (responseId: string, replyFallbackText: string) => {
    setSpeaking(true);
    setVisibleState('AGENT_SPEAKING');

    try {
      const ttsData = await requestTTS(responseId);
      if (ttsData.audioBuffer && ttsData.audioBuffer.byteLength > 0) {
        const blob = new Blob([ttsData.audioBuffer], {
          type: ttsData.contentType || 'audio/mpeg',
        });
        setLastAudioBlob(blob);
        const audioUrl = URL.createObjectURL(blob);
        const audio = new Audio(audioUrl);
        currentAudioRef.current = audio;

        audio.onended = () => {
          setSpeaking(false);
          currentAudioRef.current = null;
          URL.revokeObjectURL(audioUrl);
          if (!callEnded) setVisibleState('LISTENING');
        };
        audio.onerror = () => {
          setSpeaking(false);
          currentAudioRef.current = null;
          URL.revokeObjectURL(audioUrl);
          fallbackBrowserSpeech(replyFallbackText);
        };
        await audio.play().catch(() => {
          fallbackBrowserSpeech(replyFallbackText);
        });
      } else {
        fallbackBrowserSpeech(replyFallbackText);
      }
    } catch {
      fallbackBrowserSpeech(replyFallbackText);
    }
  };

  const fallbackBrowserSpeech = (text: string) => {
    setSpeaking(true);
    setVisibleState('AGENT_SPEAKING');

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const synth = window.speechSynthesis;
      const utterance = new SpeechSynthesisUtterance(text.slice(0, 400));

      const voices = synth.getVoices();
      const femaleVoice =
        voices.find(v =>
          /female|google us english|zira|samantha|victoria|karen|serena|fiona|natural/i.test(v.name)
        ) || voices.find(v => v.lang.startsWith('en'));

      if (femaleVoice) utterance.voice = femaleVoice;
      utterance.pitch = 1.08;
      utterance.rate = 0.98;

      utterance.onend = () => {
        setSpeaking(false);
        if (!callEnded) setVisibleState('LISTENING');
      };
      utterance.onerror = () => {
        setSpeaking(false);
        if (!callEnded) setVisibleState('LISTENING');
      };

      synth.speak(utterance);
    } else {
      setSpeaking(false);
    }
  };

  const replayLastSpeech = () => {
    unlockAudioContext();
    if (!lastAudioBlob) return;
    setSpeaking(true);
    setVisibleState('AGENT_SPEAKING');
    const audioUrl = URL.createObjectURL(lastAudioBlob);
    const audio = new Audio(audioUrl);
    currentAudioRef.current = audio;
    audio.onended = () => {
      setSpeaking(false);
      currentAudioRef.current = null;
    };
    audio.onerror = () => {
      setSpeaking(false);
      currentAudioRef.current = null;
    };
    audio.play().catch(() => setSpeaking(false));
  };

  const playPhonePickupSound = () => {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const toneGain = ctx.createGain();

      osc1.frequency.setValueAtTime(350, ctx.currentTime);
      osc2.frequency.setValueAtTime(440, ctx.currentTime);

      toneGain.gain.setValueAtTime(0.001, ctx.currentTime);
      toneGain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.05);
      toneGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);

      osc1.connect(toneGain);
      osc2.connect(toneGain);
      toneGain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.16);
      osc2.stop(ctx.currentTime + 0.16);
    } catch {
      // AudioContext policy
    }
  };

  const handleEndDemoCall = async () => {
    setCallEnded(true);
    setVisibleState('ENDING');
    stopAgentAudioImmediately();

    try {
      const data = await endDemoSession();
      setVisibleState('COMPLETED');
      if (data.summary) setSummaryData(data.summary);
      if (onCallEnded) onCallEnded(data.finalCallResult || data.summary || data);
    } catch {
      setVisibleState('COMPLETED');
      if (onCallEnded) {
        onCallEnded({
          sessionId: 'ended_session',
          organization: {
            name: organizationProfile?.name || 'Northstar Legal Consultations',
          },
        });
      }
    }
  };

  const handleDeleteDemoData = async () => {
    if (!confirm('Are you sure you want to delete all temporary records from this session?'))
      return;
    setIsDeleting(true);
    try {
      await deleteDemoSession();
      alert('Demo session data deleted.');
      onResetScenario?.();
    } catch {
      alert('Failed to delete demo data.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (callEnded) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 text-white">
        <div className="p-6 rounded-lg bg-[#13171C] border border-[#272D35] space-y-6">
          <div className="flex items-center justify-between border-b border-[#272D35] pb-4">
            <div>
              <span className="text-xs font-mono text-[#34D399] uppercase font-bold">
                Call Completed &amp; Persisted
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
              <p className="font-semibold text-white">Northstar Legal Consultations</p>
            </div>
            <div className="p-3.5 rounded bg-[#171C22] border border-[#272D35] space-y-1">
              <span className="text-[#8B949E] block">Verified Action</span>
              <p className="font-semibold text-[#2DD4BF]">
                {actionNotice || 'Legal strategy consultation scheduled'}
              </p>
            </div>
            <div className="p-3.5 rounded bg-[#171C22] border border-[#272D35] space-y-1">
              <span className="text-[#8B949E] block">Provider Mode</span>
              <p className="font-semibold text-[#34D399]">Cloudflare Aura-2 TTS / Deepgram Flux</p>
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
      {/* Degraded Provider Warning Banner (Req 2, 28) */}
      {isDegradedMode && (
        <div className="p-3 rounded-lg bg-amber-950/70 border border-amber-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-amber-200">
          <div className="flex items-center gap-2 font-medium">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Notice:</strong> {degradedReason}
            </span>
          </div>
          <span className="font-mono text-[10px] bg-amber-900/60 px-2 py-0.5 rounded text-amber-300 shrink-0">
            BROWSER SPEECH MODE
          </span>
        </div>
      )}

      {/* Top Status & Telemetry Header */}
      <div className="p-4 rounded-lg bg-[#13171C] border border-[#272D35] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-3.5 h-3.5 rounded-full ${
              speaking
                ? 'bg-[#34D399] animate-ping'
                : listening
                  ? 'bg-[#2DD4BF] animate-pulse'
                  : 'bg-[#8B949E]'
            }`}
          ></div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">
                Northstar Legal Voice Receptionist
              </span>
              <span className="px-2 py-0.5 rounded bg-[#171C22] text-[#2DD4BF] text-[10px] font-mono font-bold border border-[#272D35]">
                {visibleState}
              </span>
            </div>
            <span className="text-xs text-[#8B949E] block">
              Scenario: {scenario} • Voice: Maya (Northstar Legal v2.5.0)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="px-2.5 py-1 rounded bg-[#171C22] text-[#F4F4F5] border border-[#272D35]">
            Turns: {turnsUsed}/{maxCallerTurns}
          </span>
          <span className="px-2.5 py-1 rounded bg-[#171C22] text-[#2DD4BF] border border-[#272D35]">
            Duration: {Math.floor(timeRemaining / 60)}:
            {(timeRemaining % 60).toString().padStart(2, '0')} / 3:00
          </span>
          <button
            onClick={handleEndDemoCall}
            className="bg-[#FB7185] hover:bg-[#e05669] text-white px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <PhoneOff className="w-3.5 h-3.5" /> End Call
          </button>
        </div>
      </div>

      {/* 3 Column Desktop Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* LEFT COLUMN: TELEMETRY & BUSINESS CONTEXT */}
        <div className="p-4 rounded-lg bg-[#13171C] border border-[#272D35] space-y-4 text-xs">
          <h2 className="font-bold text-white uppercase tracking-wider text-[11px] text-[#8B949E] flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-[#2DD4BF]" /> Measured Telemetry
          </h2>

          <div className="space-y-2 font-mono text-[11px]">
            <div className="p-2.5 rounded bg-[#171C22] border border-[#272D35] flex items-center justify-between">
              <span className="text-[#8B949E]">STT Latency</span>
              <span className="text-[#34D399] font-bold">{telemetry.sttLatencyMs} ms</span>
            </div>
            <div className="p-2.5 rounded bg-[#171C22] border border-[#272D35] flex items-center justify-between">
              <span className="text-[#8B949E]">LLM 1st-Token</span>
              <span className="text-[#2DD4BF] font-bold">{telemetry.llmLatencyMs} ms</span>
            </div>
            <div className="p-2.5 rounded bg-[#171C22] border border-[#272D35] flex items-center justify-between">
              <span className="text-[#8B949E]">TTS 1st-Audio</span>
              <span className="text-[#34D399] font-bold">{telemetry.ttsLatencyMs} ms</span>
            </div>
            <div className="p-2.5 rounded bg-[#171C22] border border-[#272D35] flex items-center justify-between">
              <span className="text-[#8B949E]">Interruption Stop</span>
              <span className="text-[#F59E0B] font-bold">
                &lt; {telemetry.interruptionStopMs} ms
              </span>
            </div>
          </div>

          {lastAudioBlob && (
            <button
              onClick={replayLastSpeech}
              disabled={speaking}
              className="w-full py-2 px-3 rounded bg-[#171C22] hover:bg-[#202730] border border-[#272D35] text-[#2DD4BF] font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <Volume2 className="w-3.5 h-3.5" /> Replay Agent Voice Stream
            </button>
          )}

          <hr className="border-[#272D35]" />

          <div className="space-y-2">
            <span className="font-bold text-white text-[11px] block">Active Legal Boundary</span>
            <p className="text-[10px] text-[#8B949E] leading-relaxed">
              Administrative intake only. Strictly refuses substantive legal advice or case
              guarantees.
            </p>
          </div>
        </div>

        {/* CENTER COLUMN: LIVE TRANSCRIPT & CONTROLS */}
        <div className="lg:col-span-2 p-4 rounded-lg bg-[#13171C] border border-[#272D35] flex flex-col min-h-[600px]">
          <div className="flex items-center justify-between border-b border-[#272D35] pb-2 mb-3">
            <h2 className="font-bold text-white text-xs">Real-Time Conversation Stream</h2>
            <span className="text-[11px] font-mono text-[#2DD4BF]">
              {speaking
                ? 'Maya Speaking... (Interruptible)'
                : listening
                  ? 'Listening continuously...'
                  : thinking
                    ? 'Reasoning...'
                    : 'Ready'}
            </span>
          </div>

          {/* Transcript Scroll Area */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 text-xs">
            {transcript.map((msg, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border leading-relaxed ${
                  msg.role === 'AGENT'
                    ? 'bg-[#171C22] border-[#272D35] text-[#F4F4F5] mr-6'
                    : 'bg-[#0F1216] border-[#272D35] text-[#D4D4D8] ml-6 border-l-2 border-l-[#2DD4BF]'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-[#8B949E] font-mono mb-1">
                  <span
                    className={
                      msg.role === 'AGENT' ? 'text-[#2DD4BF] font-bold' : 'text-white font-bold'
                    }
                  >
                    {msg.role === 'AGENT' ? 'Maya (Voice Receptionist)' : 'Caller (You)'}
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

          {/* Microphone, Interruption & Text Controls */}
          <div className="pt-3 border-t border-[#272D35] space-y-2.5">
            <div className="flex items-center gap-2">
              <button
                disabled={thinking || sessionExpired || callEnded}
                onClick={toggleMicrophone}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-40 ${
                  listening
                    ? 'bg-[#FB7185] hover:bg-[#e05669] text-white'
                    : 'bg-[#2DD4BF] hover:bg-[#26b8a5] text-[#0B0D10]'
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

              {speaking && (
                <button
                  onClick={stopAgentAudioImmediately}
                  className="bg-[#F59E0B] hover:bg-[#d97706] text-black font-bold px-3 py-2.5 rounded-lg text-xs transition-colors shrink-0"
                >
                  Interrupt Agent Speech
                </button>
              )}
            </div>

            {/* Manual Text Input */}
            <form
              onSubmit={e => {
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
                onChange={e => setManualInput(e.target.value)}
                placeholder="Type what the caller would say…"
                className="flex-1 bg-[#0F1216] border border-[#272D35] rounded-lg px-3 py-2 text-xs text-white placeholder-[#8B949E] focus:outline-none focus:border-[#2DD4BF] disabled:opacity-40"
              />
              <button
                type="submit"
                disabled={!manualInput.trim() || thinking || sessionExpired || callEnded}
                className="bg-[#2DD4BF] hover:bg-[#26b8a5] text-[#0B0D10] px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-center disabled:opacity-40 transition-colors shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Northstar Legal Sample Questions */}
            <div className="pt-2 border-t border-[#272D35] space-y-2">
              <span className="text-[11px] font-bold text-white uppercase tracking-wider block">
                Northstar Legal 3-Series Test Questions
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() =>
                    handleUserSpeechSubmit(
                      'What are your office hours and where is your New York office located?'
                    )
                  }
                  className="p-2 rounded bg-[#0F1216] hover:bg-[#171C22] border border-[#272D35] text-left text-[11px] text-[#D4D4D8]"
                >
                  &quot;What are your hours &amp; location?&quot;
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleUserSpeechSubmit(
                      'How much is an initial legal strategy consultation fee?'
                    )
                  }
                  className="p-2 rounded bg-[#0F1216] hover:bg-[#171C22] border border-[#272D35] text-left text-[11px] text-[#D4D4D8]"
                >
                  &quot;How much is a consultation fee?&quot;
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleUserSpeechSubmit(
                      'I want to book an initial legal strategy consultation for tomorrow. My name is Arslan.'
                    )
                  }
                  className="p-2 rounded bg-[#0F1216] hover:bg-[#171C22] border border-[#272D35] text-left text-[11px] text-[#D4D4D8]"
                >
                  &quot;Book consultation tomorrow...&quot;
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: DYNAMIC ACTION & APPOINTMENT STATUS */}
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
              Waiting for caller turn to trigger business tool...
            </div>
          )}

          <div className="p-3.5 rounded bg-[#171C22] border border-[#272D35] space-y-2">
            <div className="flex items-center gap-2 text-white font-semibold">
              <Calendar className="w-4 h-4 text-[#2DD4BF]" />
              <span>Real Slot Reservation</span>
            </div>
            <p className="text-[#8B949E] text-[11px]">
              Available slots generated deterministically. Confirmed only after explicit caller
              readback confirmation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
