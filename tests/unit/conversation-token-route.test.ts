import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { resolveElevenLabsAgent } from '@/lib/elevenlabs/agent-registry.server';

describe('ElevenLabs Agent Registry & Conversation Token Security', () => {
  const origApiKey = process.env.ELEVENLABS_API_KEY;
  const origAgentId = process.env.ELEVENLABS_AGENT_ID_LEGAL_EN;

  beforeEach(() => {
    process.env.ELEVENLABS_API_KEY = 'test_api_key_123';
    process.env.ELEVENLABS_AGENT_ID_LEGAL_EN = 'agent_test_legal_en';
  });

  afterEach(() => {
    process.env.ELEVENLABS_API_KEY = origApiKey;
    process.env.ELEVENLABS_AGENT_ID_LEGAL_EN = origAgentId;
  });

  it('should resolve Legal English agent when configured', () => {
    const agent = resolveElevenLabsAgent('LEGAL', 'en-US');
    expect(agent).not.toBeNull();
    if (agent) {
      expect(agent.presetKey).toBe('LEGAL');
      expect(agent.language).toBe('en-US');
      expect(agent.agentId).toBe('agent_test_legal_en');
    }
  });

  it('should return null for unconfigured business/language combination', () => {
    const agent = resolveElevenLabsAgent('B2B_SERVICES', 'ur-PK');
    expect(agent).toBeNull();
  });
});
