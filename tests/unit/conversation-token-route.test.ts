import { describe, it, expect } from "vitest";
import { resolveElevenLabsAgent } from "@/lib/elevenlabs/agent-registry.server";

describe("ElevenLabs Agent Registry & Conversation Token Security", () => {
  it("should resolve Legal English agent when configured", () => {
    const agent = resolveElevenLabsAgent("LEGAL", "en-US");
    expect(agent).not.toBeNull();
    if (agent) {
      expect(agent.presetKey).toBe("LEGAL");
      expect(agent.language).toBe("en-US");
      expect(agent.agentId).toBeDefined();
    }
  });

  it("should return null for unconfigured business/language combination", () => {
    const agent = resolveElevenLabsAgent("B2B_SERVICES", "ur-PK");
    expect(agent).toBeNull();
  });
});
