"use client";

import { useState } from "react";
import {
  Phone,
  PhoneOff,
  Mic,
  Play,
  Calendar,
  UserCheck,
  PhoneForwarded,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Activity,
} from "lucide-react";
import { DEMO_SCENARIOS, DemoScenario } from "@/lib/demo/scenarios";

export function LiveCallConsole() {
  const [selectedScenario, setSelectedScenario] = useState<DemoScenario>(DEMO_SCENARIOS[0]);
  const [callActive, setCallActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stateBadge, setStateBadge] = useState("IDLE");
  const [interrupted, setInterrupted] = useState(false);

  const startSimulatedCall = () => {
    setCallActive(true);
    setCurrentStepIndex(0);
    setStateBadge(selectedScenario.dialogueScript[0]?.state || "GREETING");
    setInterrupted(false);
  };

  const nextTurn = () => {
    if (currentStepIndex < selectedScenario.dialogueScript.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      setStateBadge(selectedScenario.dialogueScript[nextIdx]?.state || "IN_PROGRESS");
    } else {
      setStateBadge("COMPLETED");
    }
  };

  const endSimulatedCall = () => {
    setCallActive(false);
    setStateBadge("COMPLETED");
  };

  const triggerBargeIn = () => {
    setInterrupted(true);
    setStateBadge("BARGE_IN_LISTENING");
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-teal-800/40">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white tracking-tight">Live Call Console</h1>
            <span className="px-3 py-1 rounded-full bg-teal-950 text-teal-400 border border-teal-800/60 font-mono text-xs font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping"></span>
              DEMO PROVIDER ACTIVE
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            Simulate real-time inbound calls, barge-in interruption, tool execution, and state transitions without paid credentials.
          </p>
        </div>

        {/* Call Controls */}
        <div className="flex items-center gap-3">
          {!callActive ? (
            <button
              onClick={startSimulatedCall}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition-all"
            >
              <Phone className="w-4 h-4 fill-white" />
              <span>Start Simulated Call</span>
            </button>
          ) : (
            <button
              onClick={endSimulatedCall}
              className="bg-red-600 hover:bg-red-700 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-lg shadow-red-600/25 flex items-center gap-2 transition-all"
            >
              <PhoneOff className="w-4 h-4 fill-white" />
              <span>End Call</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Console Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Waveform & Dialogue Transcript */}
        <div className="lg:col-span-2 space-y-6">
          {/* Waveform Visualizer */}
          <div className="glass-panel p-6 rounded-2xl border border-gray-800/80">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-xs font-mono font-semibold text-gray-400">
                <Activity className="w-4 h-4 text-teal-400" />
                <span>AUDIO WAVEFORM VISUALIZER</span>
              </div>
              <span className="px-2.5 py-1 rounded-md bg-gray-900 border border-gray-800 text-xs font-mono text-gray-300">
                STATE: <strong className="text-teal-400">{stateBadge}</strong>
              </span>
            </div>

            {/* Simulated Animated Bars */}
            <div className="h-28 bg-gray-950/80 rounded-xl border border-gray-900 flex items-center justify-center gap-1.5 px-4 overflow-hidden">
              {callActive ? (
                <>
                  <div className="w-2 bg-teal-500 rounded-full animate-wave-1"></div>
                  <div className="w-2 bg-electric-500 rounded-full animate-wave-2"></div>
                  <div className="w-2 bg-teal-400 rounded-full animate-wave-3"></div>
                  <div className="w-2 bg-emerald-400 rounded-full animate-wave-4"></div>
                  <div className="w-2 bg-teal-500 rounded-full animate-wave-5"></div>
                  <div className="w-2 bg-electric-500 rounded-full animate-wave-2"></div>
                  <div className="w-2 bg-teal-400 rounded-full animate-wave-1"></div>
                  <div className="w-2 bg-emerald-500 rounded-full animate-wave-4"></div>
                </>
              ) : (
                <div className="text-center text-xs font-mono text-gray-400">
                  <Mic className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                  <span>Call idle. Click "Start Simulated Call" to launch conversation.</span>
                </div>
              )}
            </div>

            {/* Interruption Controls */}
            {callActive && (
              <div className="mt-4 flex items-center justify-between pt-4 border-t border-gray-800/60">
                <button
                  onClick={nextTurn}
                  className="bg-teal-950/80 hover:bg-teal-900/80 text-teal-300 border border-teal-800/60 text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-teal-400" />
                  <span>Advance Conversation Turn ({currentStepIndex + 1}/{selectedScenario.dialogueScript.length})</span>
                </button>

                <button
                  onClick={triggerBargeIn}
                  className="bg-amber-950/80 hover:bg-amber-900/80 text-amber-300 border border-amber-800/60 text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Simulate Caller Barge-in</span>
                </button>
              </div>
            )}
          </div>

          {/* Live Speaker-Separated Transcript */}
          <div className="glass-panel p-6 rounded-2xl border border-gray-800/80">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-400" />
              <span>Speaker-Separated Live Transcript</span>
            </h3>

            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {selectedScenario.dialogueScript.slice(0, currentStepIndex + 1).map((turn, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-xl text-sm border ${
                    turn.speaker === "agent"
                      ? "bg-teal-950/30 border-teal-900/50 text-teal-100 ml-4"
                      : "bg-gray-900/80 border-gray-800 text-gray-200 mr-4"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono mb-1.5 opacity-80">
                    <span className="font-bold uppercase tracking-wider">{turn.speaker}</span>
                    <span className="px-2 py-0.5 rounded bg-gray-950 border border-gray-800 font-semibold">{turn.state}</span>
                  </div>
                  <p>{turn.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Scenario Selector & Extraction Card */}
        <div className="space-y-6">
          {/* Scenario Selector */}
          <div className="glass-panel p-6 rounded-2xl border border-gray-800/80">
            <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-3">Select Demo Scenario</h3>
            <div className="space-y-2">
              {DEMO_SCENARIOS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setSelectedScenario(s);
                    setCallActive(false);
                  }}
                  className={`w-full text-left p-3 rounded-xl text-xs font-medium border transition-all ${
                    selectedScenario.id === s.id
                      ? "bg-gradient-to-r from-teal-950 to-gray-900 border-teal-500/60 text-white font-semibold"
                      : "bg-gray-900/50 border-gray-800/80 text-gray-400 hover:text-white"
                  }`}
                >
                  <p className="font-bold text-sm text-teal-400">{s.title}</p>
                  <p className="text-gray-400 text-xs mt-1 line-clamp-2">{s.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Realtime Extraction Card */}
          <div className="glass-panel p-6 rounded-2xl border border-gray-800/80 space-y-4">
            <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Realtime Intent & Lead Signals</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-gray-950 border border-gray-800 flex justify-between items-center">
                <span className="text-gray-400">Caller Identity</span>
                <span className="font-bold text-white">{selectedScenario.callerName}</span>
              </div>
              <div className="p-3 rounded-xl bg-gray-950 border border-gray-800 flex justify-between items-center">
                <span className="text-gray-400">Caller Phone</span>
                <span className="font-mono text-teal-300">{selectedScenario.callerNumber}</span>
              </div>
              <div className="p-3 rounded-xl bg-gray-950 border border-gray-800 flex justify-between items-center">
                <span className="text-gray-400">Qualification Score</span>
                <span className="font-bold text-emerald-400">85 / 100 (HOT)</span>
              </div>
              <div className="p-3 rounded-xl bg-gray-950 border border-gray-800 flex justify-between items-center">
                <span className="text-gray-400">Target Service</span>
                <span className="font-medium text-white">Commercial Legal Review</span>
              </div>
              <div className="p-3 rounded-xl bg-gray-950 border border-gray-800 flex justify-between items-center">
                <span className="text-gray-400">Calendar Action</span>
                <span className="font-medium text-teal-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                  Tuesday 2:00 PM EST
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
