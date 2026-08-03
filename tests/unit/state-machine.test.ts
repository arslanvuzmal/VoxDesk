import { describe, it, expect } from "vitest";
import { ConversationStateMachine } from "../../lib/conversation/state-machine";

describe("Conversation State Machine", () => {
  it("should enforce valid state transitions", () => {
    const sm = new ConversationStateMachine("INITIALISING");
    expect(sm.getState()).toBe("INITIALISING");

    sm.transition("GREETING");
    expect(sm.getState()).toBe("GREETING");

    sm.transition("IDENTIFYING_INTENT");
    expect(sm.getState()).toBe("IDENTIFYING_INTENT");
  });

  it("should throw error on illegal state transition", () => {
    const sm = new ConversationStateMachine("INITIALISING");
    expect(() => sm.transition("SUMMARISING")).toThrow();
  });
});
