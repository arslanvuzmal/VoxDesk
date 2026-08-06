"use client";

export type SupportedLanguage = "en-US" | "ur-PK" | "es-ES";

export type VoxDeskPreset =
  "LEGAL" | "HEALTHCARE" | "REAL_ESTATE" | "HOME_SERVICES" | "B2B_SERVICES";

export interface AgentRegistration {
  presetKey: VoxDeskPreset;
  language: SupportedLanguage;
  agentId: string;
  displayName: string;
  voiceId?: string;
}

const DEFAULT_FALLBACK_AGENT_ID = "36f372be729c9c1e4de8071b86271c6b";

export function isElevenLabsConfiguredClient(
  presetKey: VoxDeskPreset,
  language: SupportedLanguage,
): boolean {
  if (presetKey === "LEGAL" && language === "en-US") {
    return false;
  }
  return false;
}

export function getElevenLabsConfigStatus(): Record<string, boolean> {
  return {
    "LEGAL:en-US": false,
    "LEGAL:ur-PK": false,
    "LEGAL:es-ES": false,
    "HEALTHCARE:en-US": false,
    "HEALTHCARE:ur-PK": false,
    "HEALTHCARE:es-ES": false,
    "REAL_ESTATE:en-US": false,
    "HOME_SERVICES:en-US": false,
    "B2B_SERVICES:en-US": false,
  };
}