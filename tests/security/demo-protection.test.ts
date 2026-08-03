import { describe, it, expect } from "vitest";
import {
  signOpaqueSessionId,
  verifyOpaqueSessionToken,
} from "../../lib/demo/session";
import { generateIPHash } from "../../lib/demo/rate-limit";
import { demoSessionStore } from "../../lib/demo/store";

describe("Demo Security & Voucher System", () => {
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
});
