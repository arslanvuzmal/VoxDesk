import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import {
  NORTHSTAR_AGENT_NAME,
  NORTHSTAR_AGENT_FIRST_MESSAGE,
  NORTHSTAR_AGENT_CANONICAL_PROMPT,
} from '../lib/voice-agent/northstar-agent-config.server';

async function provisionAgent() {
  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
  if (!apiKey) {
    console.error('[ERROR] ELEVENLABS_API_KEY environment variable is required.');
    process.exit(1);
  }

  const client = new ElevenLabsClient({ apiKey });
  const configuredAgentId =
    process.env.ELEVENLABS_AGENT_ID_LEGAL_EN?.trim() || process.env.ELEVENLABS_AGENT_ID?.trim();
  const voiceId =
    process.env.ELEVENLABS_VOICE_ID_LEGAL_EN?.trim() ||
    process.env.ELEVENLABS_VOICE_ID?.trim() ||
    'EXAVITQu4vr4xnSDxMaL';

  console.log(
    '[PROVISIONING] Checking existing agent or provisioning ElevenLabs Northstar Legal Agent...'
  );

  let agentId = configuredAgentId;
  let existingAgent = null;

  if (agentId) {
    try {
      existingAgent = await client.conversationalAi.agents.get(agentId);
    } catch {
      existingAgent = null;
    }
  }

  const conversationConfig = {
    agent: {
      prompt: {
        prompt: NORTHSTAR_AGENT_CANONICAL_PROMPT,
      },
      firstMessage: NORTHSTAR_AGENT_FIRST_MESSAGE,
      language: 'en',
    },
    tts: {
      voiceId: voiceId,
    },
  };

  try {
    if (existingAgent && agentId) {
      console.log(`[UPDATING] Updating existing ElevenLabs agent (${agentId})...`);
      await client.conversationalAi.agents.update(agentId, {
        name: NORTHSTAR_AGENT_NAME,
        conversationConfig: conversationConfig as any,
      });
      console.log(`[SUCCESS] Agent ${agentId} updated successfully.`);
    } else {
      console.log(`[CREATING] Creating new ElevenLabs agent...`);
      const newAgent = await client.conversationalAi.agents.create({
        name: NORTHSTAR_AGENT_NAME,
        conversationConfig: conversationConfig as any,
      });
      agentId = newAgent.agentId;
      console.log(`[SUCCESS] New agent created successfully.`);
    }

    console.log('--------------------------------------------------');
    console.log(`Verified Agent ID: ${agentId}`);
    console.log(`ELEVENLABS_AGENT_ID_LEGAL_EN="${agentId}"`);
    console.log('--------------------------------------------------');
  } catch (error: any) {
    console.error('[PROVISIONING ERROR]:', error?.message || error);
    process.exit(1);
  }
}

provisionAgent();
