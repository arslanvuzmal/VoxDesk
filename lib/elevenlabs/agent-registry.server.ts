import 'server-only';

export type SupportedLanguage = 'en-US' | 'ur-PK' | 'es-ES';

export type VoxDeskPreset =
  'LEGAL' | 'HEALTHCARE' | 'REAL_ESTATE' | 'HOME_SERVICES' | 'B2B_SERVICES';


export interface AgentRegistration {
  presetKey: VoxDeskPreset;
  language: SupportedLanguage;
  agentId: string;
  displayName: string;
  voiceId?: string;
}

export function isElevenLabsConfigured(
  presetKey: VoxDeskPreset,
  language: SupportedLanguage
): boolean {
  const apiKey = (process.env.ELEVENLABS_API_KEY || process.env.ELEVENLABS)?.trim();
  if (!apiKey) return false;

  if (presetKey === 'LEGAL' && language === 'en-US') {
    const agentId =
      process.env.ELEVENLABS_AGENT_ID?.trim() || process.env.ELEVENLABS_AGENT_ID_LEGAL_EN?.trim();
    return Boolean(agentId);
  }

  const envKey = `ELEVENLABS_AGENT_ID_${presetKey}_${language.slice(0, 2).toUpperCase()}`;
  const specificAgentId = process.env[envKey]?.trim();
  return Boolean(specificAgentId);
}

export function resolveElevenLabsAgent(
  presetKey: VoxDeskPreset,
  language: SupportedLanguage
): AgentRegistration | null {
  const apiKey = (process.env.ELEVENLABS_API_KEY || process.env.ELEVENLABS)?.trim();
  if (!apiKey) return null;

  if (presetKey === 'LEGAL' && language === 'en-US') {
    const agentId =
      process.env.ELEVENLABS_AGENT_ID?.trim() || process.env.ELEVENLABS_AGENT_ID_LEGAL_EN?.trim();

    if (!agentId) return null;

    return {
      presetKey: 'LEGAL',
      language: 'en-US',
      agentId,
      displayName: 'Maya (Northstar Legal Receptionist)',
      voiceId: process.env.ELEVENLABS_VOICE_ID_LEGAL_EN?.trim() || 'EXAVITQu4vr4xnSDxMaL',
    };
  }

  const envKey = `ELEVENLABS_AGENT_ID_${presetKey}_${language.slice(0, 2).toUpperCase()}`;
  const specificAgentId = process.env[envKey]?.trim();

  if (!specificAgentId) {
    return null;
  }

  const names: Record<VoxDeskPreset, string> = {
    LEGAL: 'Northstar Legal Receptionist',
    HEALTHCARE: 'CarePoint Health Coordinator',
    REAL_ESTATE: 'Apex Realty Specialist',
    HOME_SERVICES: 'Apex Home Services Dispatcher',
    B2B_SERVICES: 'Nexus B2B Solutions Consultant',
  };

  return {
    presetKey,
    language,
    agentId: specificAgentId,
    displayName: `${names[presetKey]} (${language})`,
  };
}
