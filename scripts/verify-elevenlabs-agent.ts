import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

async function verifyAgent() {
  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
  if (!apiKey) {
    console.error("[ERROR] ELEVENLABS_API_KEY environment variable is missing.");
    process.exit(1);
  }

  const agentId = process.env.ELEVENLABS_AGENT_ID_LEGAL_EN?.trim() || process.env.ELEVENLABS_AGENT_ID?.trim();
  if (!agentId) {
    console.error("[ERROR] No agent ID configured in ELEVENLABS_AGENT_ID_LEGAL_EN.");
    process.exit(1);
  }

  const client = new ElevenLabsClient({ apiKey });

  try {
    const agent = await client.conversationalAi.agents.get(agentId);
    if (!agent) {
      console.error(`[ERROR] Agent '${agentId}' not found on ElevenLabs API.`);
      process.exit(1);
    }

    console.log("[SUCCESS] ElevenLabs agent verified successfully.");
    console.log(`Agent ID: ${agent.agentId}`);
    console.log(`Agent Name: ${agent.name}`);
    process.exit(0);
  } catch (error: any) {
    console.error("[ERROR] Could not verify ElevenLabs agent:", error?.message || error);
    process.exit(1);
  }
}

verifyAgent();
