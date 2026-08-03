import "server-only";
import { demoSessionStore } from "@/lib/demo/store";

export async function checkAndRecordUsage(
  sessionId: string,
  userTextLength: number,
): Promise<{ allowed: boolean; reason?: string }> {
  const session = await demoSessionStore.getSession(sessionId);
  if (!session) {
    return { allowed: false, reason: "Session expired or invalid" };
  }

  if (session.turnsUsed >= session.maxTurns) {
    return { allowed: false, reason: "Maximum session turns (6) completed." };
  }

  if (userTextLength > 600) {
    return {
      allowed: false,
      reason: "Input text exceeds maximum length of 600 characters per turn.",
    };
  }

  return { allowed: true };
}

export async function recordTurnUsage(
  sessionId: string,
  userTextLength: number,
  agentTextLength: number,
  llmInputTokens: number = 50,
  llmOutputTokens: number = 100,
) {
  const session = await demoSessionStore.getSession(sessionId);
  if (!session) return;

  await demoSessionStore.updateSession(sessionId, {
    turnsUsed: session.turnsUsed + 1,
    userCharacters: session.userCharacters + userTextLength,
    agentCharacters: session.agentCharacters + agentTextLength,
    llmInputTokens: session.llmInputTokens + llmInputTokens,
    llmOutputTokens: session.llmOutputTokens + llmOutputTokens,
  });
}
