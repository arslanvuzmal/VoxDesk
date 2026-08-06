import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { legalTrainingPack } from "../lib/organization/presets/legal";

async function provisionElevenLabsAgents() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    console.error(
      "[ERROR] ELEVENLABS_API_KEY environment variable is required to provision agents.",
    );
    process.exit(1);
  }

  const client = new ElevenLabsClient({ apiKey });

  console.log(
    `[PROVISIONING] Provisioning Northstar Legal Voice Receptionist (${legalTrainingPack.business.name})...`,
  );

  const systemInstructions = `You are Maya, the voice receptionist for Northstar Legal Consultations.

You provide administrative intake and appointment assistance.
You are not a lawyer and must not provide substantive legal advice.

Speak naturally and professionally.
Keep most answers between 10 and 35 words.
Ask only one primary question at a time.
Do not read lists unless the caller asks for them.
Do not repeat the caller’s complete statement.
Remember information already provided.
Handle corrections naturally.
Confirm names, phone numbers and appointment times.
Use only approved Northstar information.
Never invent fees, opening hours, addresses, availability or legal outcomes.
When approved information is unavailable, state that clearly and offer human follow-up.
Never claim that an attorney-client relationship has been created.
Never guarantee a legal result.`;

  const voiceId =
    process.env.ELEVENLABS_VOICE_ID_LEGAL_EN || "21m00Tcm4TlvDq8ikWAM";

  try {
    const agentResponse = await client.conversationalAi.agents.create({
      name: "VoxDesk — Northstar Legal Receptionist",
      conversationConfig: {
        agent: {
          prompt: {
            prompt: systemInstructions,
          },
          firstMessage:
            "Thank you for calling Northstar Legal Consultations. My name is Maya. How may I assist with your legal matter today?",
          language: "en",
        },
        tts: {
          voiceId,
        },
      },
    });

    console.log("[PROVISIONING SUCCESS] Agent provisioned successfully!");
    console.log(`Agent ID: ${agentResponse.agentId}`);
    console.log("Add this agent ID to your .env file as:");
    console.log(`ELEVENLABS_AGENT_ID_LEGAL_EN="${agentResponse.agentId}"`);
  } catch (error: any) {
    console.error("[PROVISIONING ERROR]:", error?.message || error);
    process.exit(1);
  }
}

provisionElevenLabsAgents();
