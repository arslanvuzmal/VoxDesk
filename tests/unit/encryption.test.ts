import { describe, it, expect } from "vitest";
import {
  encryptText,
  decryptText,
  maskPhoneNumber,
  maskEmail,
} from "../../lib/encryption";

describe("Encryption & Masking Security Module", () => {
  it("should encrypt and decrypt plaintext accurately", () => {
    const originalSecret = "sk_live_vapi_secret_key_123456";
    const encrypted = encryptText(originalSecret);
    expect(encrypted).not.toBe(originalSecret);
    expect(encrypted).toContain(":"); // IV:AuthTag:Text format

    const decrypted = decryptText(encrypted);
    expect(decrypted).toBe(originalSecret);
  });

  it("should mask phone numbers for privacy compliance", () => {
    const masked = maskPhoneNumber("+15550192834");
    expect(masked).toBe("+1 (***) ***-2834");
  });

  it("should mask emails safely", () => {
    const masked = maskEmail("sarah.miller@example.com");
    expect(masked).toBe("sa***@example.com");
  });
});
