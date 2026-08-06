import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { buildNorthstarAgentConfiguration } from "../lib/voice-agent/build-agent-configuration.server";

async function provisionOrVerifyAgent() {
  const args = process.argv.slice(2);
  const isVerifyOnly =
    args.includes("verify") || process.argv[1].includes("verify");

  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
  if (!apiKey) {
    console.error(
      "[ERROR] ELEVENLABS_API_KEY environment variable is required.",
    );
    process.exit(1);
  }

  const client = new ElevenLabsClient({ apiKey });
  const config = buildNorthstarAgentConfiguration("en-US");

  const configuredAgentId =
    process.env.ELEVENLABS_AGENT_ID_LEGAL_EN?.trim() ||
    process.env.ELEVENLABS_AGENT_ID?.trim();

  if (isVerifyOnly) {
    console.log("[VERIFYING] Checking ElevenLabs agent configuration...");
    if (!configuredAgentId) {
      console.error(
        "[VERIFICATION FAILED] No agent ID configured in ELEVENLABS_AGENT_ID_LEGAL_EN or ELEVENLABS_AGENT_ID.",
      );
      process.exit(1);
    }

    try {
      const agent = await client.conversationalAi.agents.get(configuredAgentId);
      if (!agent) {
        console.error(
          `[VERIFICATION FAILED] Agent ID '${configuredAgentId}' not found on ElevenLabs server.`,
        );
        process.exit(1);
      }

      console.log(
        "[VERIFICATION SUCCESS] Agent exists and is active on ElevenLabs.",
      );
      console.log(`Agent ID: ${agent.agentId}`);
      console.log(`Agent Name: ${agent.name}`);
      process.exit(0);
    } catch (err: any) {
      console.error(
        "[VERIFICATION FAILED] Could not retrieve agent from ElevenLabs API:",
        err?.message || err,
      );
      process.exit(1);
    }
  }

  // Idempotent Provisioning
  console.log(
    `[PROVISIONING] Checking existing agent or creating new ElevenLabs agent...`,
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

  try {
    if (existingAgent && agentId) {
      console.log(
        `[UPDATING] Updating existing ElevenLabs agent (${agentId})...`,
      );
      await client.conversationalAi.agents.update(agentId, {
        name: config.name,
        conversationConfig: config.conversationConfig as any,
      });
      console.log(`[SUCCESS] Agent ${agentId} updated successfully.`);
    } else {
      console.log(`[CREATING] Creating new ElevenLabs agent...`);
      const newAgent = await client.conversationalAi.agents.create({
        name: config.name,
        conversationConfig: config.conversationConfig as any,
      });
      agentId = newAgent.agentId;
      console.log(`[SUCCESS] New agent created successfully.`);
    }

    console.log("--------------------------------------------------");
    console.log(`Agent ID: ${agentId}`);
    console.log("Set this environment variable in your Vercel project:");
    console.log(`ELEVENLABS_AGENT_ID_LEGAL_EN="${agentId}"`);
    console.log("--------------------------------------------------");
  } catch (error: any) {
    console.error("[PROVISIONING ERROR]:", error?.message || error);
    process.exit(1);
  }
}

provisionOrVerifyAgent();
