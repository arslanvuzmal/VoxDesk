import { describe, it, expect } from "vitest";
import { getDemoSessionStoreStatus } from "@/lib/demo/store";
import { getDeterministicFallback } from "@/lib/providers/openrouter.server";
import { getOrganizationProfile } from "@/lib/organization/registry";

describe("Public Demo Protection & Isolation Audit", () => {
  const profile = getOrganizationProfile("LEGAL");

  it("should correctly check session store status readiness", () => {
    const status = getDemoSessionStoreStatus();
    expect(status.provider).toBeDefined();
    expect(typeof status.ready).toBe("boolean");
  });

  it("should process scenario-specific sample inputs with deterministic fallback", () => {
    const bookingSlotsRes = getDeterministicFallback(
      "I need to schedule a consultation appointment.",
      "BOOKING",
      profile,
      "en-US",
    );
    expect(bookingSlotsRes.spokenReply).toBeDefined();

    const bookingConfirmRes = getDeterministicFallback(
      "I need an initial consultation next Tuesday afternoon.",
      "BOOKING",
      profile,
      "en-US",
    );
    expect(bookingConfirmRes.spokenReply).toBeDefined();

    const qualRes = getDeterministicFallback(
      "We have a budget of fifteen thousand dollars.",
      "QUALIFICATION",
      profile,
      "en-US",
    );
    expect(qualRes.spokenReply).toBeDefined();

    const escRes = getDeterministicFallback(
      "This is urgent and I need to speak with a lawyer today.",
      "ESCALATION",
      profile,
      "en-US",
    );
    expect(escRes.spokenReply).toBeDefined();
  });
});
