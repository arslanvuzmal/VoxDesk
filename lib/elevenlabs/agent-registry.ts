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

export function isElevenLabsConfigured(
  presetKey: VoxDeskPreset,
  language: SupportedLanguage,
): boolean {
  if (presetKey === "LEGAL" && language === "en-US") {
    const agentId =
      process.env.ELEVENLABS_AGENT_ID_LEGAL_EN ||
      process.env.ELEVENLABS_AGENT_ID ||
      DEFAULT_FALLBACK_AGENT_ID;

    return agentId !== DEFAULT_FALLBACK_AGENT_ID;
  }

  const envKey = `ELEVENLABS_AGENT_ID_${presetKey}_${language.slice(0, 2).toUpperCase()}`;
  const specificAgentId = process.env[envKey];

  return !!specificAgentId;
}

export function resolveElevenLabsAgent(
  presetKey: VoxDeskPreset,
  language: SupportedLanguage,
): AgentRegistration | null {
  if (presetKey === "LEGAL" && language === "en-US") {
    const agentId =
      process.env.ELEVENLABS_AGENT_ID_LEGAL_EN ||
      process.env.ELEVENLABS_AGENT_ID ||
      DEFAULT_FALLBACK_AGENT_ID;

    return {
      presetKey: "LEGAL",
      language: "en-US",
      agentId,
      displayName: "Maya (Northstar Legal Receptionist)",
      voiceId: process.env.ELEVENLABS_VOICE_ID_LEGAL_EN || "21m00Tcm4TlvDq8ikWAM",
    };
  }

  const envKey = `ELEVENLABS_AGENT_ID_${presetKey}_${language.slice(0, 2).toUpperCase()}`;
  const specificAgentId = process.env[envKey];

  if (!specificAgentId) {
    return null;
  }

  const names: Record<VoxDeskPreset, string> = {
    LEGAL: "Northstar Legal Receptionist",
    HEALTHCARE: "CarePoint Health Coordinator",
    REAL_ESTATE: "Apex Realty Specialist",
    HOME_SERVICES: "Apex Home Services Dispatcher",
    B2B_SERVICES: "Nexus B2B Solutions Consultant",
  };

  return {
    presetKey,
    language,
    agentId: specificAgentId,
    displayName: `${names[presetKey]} (${language})`,
  };
}