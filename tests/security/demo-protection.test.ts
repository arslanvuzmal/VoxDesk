import { describe, it, expect } from "vitest";
import {
  signOpaqueSessionId,
  verifyOpaqueSessionToken,
} from "../../lib/demo/session";
import { generateIPHash } from "../../lib/demo/rate-limit";
import {
  demoSessionStore,
  getDemoSessionStoreStatus,
} from "../../lib/demo/store";
import { getDeterministicFallback } from "../../lib/providers/openrouter.server";

describe("Demo Security, Multi-Instance Persistence & Voucher System", () => {
  it("should create and verify valid signed opaque session tokens", () => {
    const sessionId = "sess_test123456";
    const token = signOpaqueSessionId(sessionId);
    expect(token).toContain(`${sessionId}.`);

    const verifiedId = verifyOpaqueSessionToken(token);
    expect(verifiedId).toBe(sessionId);
  });

  it("should reject tampered session signatures", () => {
    const sessionId = "sess_test123456";
    const token = signOpaqueSessionId(sessionId);
    const tamperedToken = token.slice(0, -4) + "0000";

    const verifiedId = verifyOpaqueSessionToken(tamperedToken);
    expect(verifiedId).toBeNull();
  });

  it("should generate deterministic IP hashes using salt", () => {
    const ip1 = "192.168.1.100";
    const hash1 = generateIPHash(ip1);
    const hash2 = generateIPHash(ip1);

    expect(hash1).toBe(hash2);
    expect(hash1).not.toBe(ip1);
    expect(hash1.length).toBe(64); // sha256 hex
  });

  it("should enforce single-use response ID vouchers for TTS", async () => {
    const stored = await demoSessionStore.storeResponseId(
      "sess_test_voucher",
      "Test agent reply text",
    );
    expect(stored.responseId).toBeDefined();
    expect(stored.consumed).toBe(false);

    // First consumption succeeds
    const consumed1 = await demoSessionStore.consumeResponse(stored.responseId);
    expect(consumed1).not.toBeNull();
    expect(consumed1?.consumed).toBe(true);

    // Second consumption (replay attack) fails
    const consumed2 = await demoSessionStore.consumeResponse(stored.responseId);
    expect(consumed2).toBeNull();
  });

  it("should correctly check session store status readiness", () => {
    const status = getDemoSessionStoreStatus();
    expect(status.provider).toBeDefined();
    expect(typeof status.ready).toBe("boolean");
  });

  it("should process scenario-specific sample inputs with deterministic fallback", () => {
    const bookingSlotsRes = getDeterministicFallback(
      "BOOKING",
      "I need to schedule a consultation appointment.",
    );
    expect(bookingSlotsRes.spokenReply).toBeDefined();
    expect(bookingSlotsRes.conversationState).toBe("OFFERING_SLOTS");

    const bookingConfirmRes = getDeterministicFallback(
      "BOOKING",
      "I need an initial consultation next Tuesday afternoon.",
    );
    expect(bookingConfirmRes.spokenReply).toBeDefined();
    expect(bookingConfirmRes.conversationState).toBe("CLOSING");

    const qualRes = getDeterministicFallback(
      "QUALIFICATION",
      "We have a budget of fifteen thousand dollars.",
    );
    expect(qualRes.spokenReply).toBeDefined();
    expect(qualRes.suggestedAction).toBe("QUALIFY_LEAD");

    const escRes = getDeterministicFallback(
      "ESCALATION",
      "This is urgent and I need to speak with a lawyer today.",
    );
    expect(escRes.spokenReply).toBeDefined();
    expect(escRes.suggestedAction).toBe("ESCALATE_HUMAN");
  });

  it("should reject expired demo sessions cleanly", async () => {
    const session = await demoSessionStore.createSession(
      "BOOKING",
      "hash_test",
      "ua_test",
    );
    // Force expire
    await demoSessionStore.updateSession(session.sessionId, {
      expiresAt: Date.now() - 1000,
    });

    const retrieved = await demoSessionStore.getSession(session.sessionId);
    expect(retrieved).toBeNull();
  });
});
