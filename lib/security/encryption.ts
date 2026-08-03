import crypto from "crypto";
import { env } from "@/lib/config/env";

const ALGORITHM = "aes-256-gcm";

export class EncryptionError extends Error {
  constructor(message: string) {
    super(`[PII_ENCRYPTION_FAILURE]: ${message}`);
    this.name = "EncryptionError";
  }
}

export class DecryptionError extends Error {
  constructor(message: string) {
    super(`[PII_DECRYPTION_FAILURE]: ${message}`);
    this.name = "DecryptionError";
  }
}

function getSecretKey(): Buffer {
  const secret =
    process.env.PII_ENCRYPTION_KEY ||
    env.DEMO_SESSION_SECRET ||
    "default_voxdesk_pii_secure_key_32_bytes_long!!";
  return crypto.createHash("sha256").update(secret).digest();
}

export function encryptSensitiveValue(value: string): string {
  if (!value) return value;
  try {
    const iv = crypto.randomBytes(12);
    const key = getSecretKey();
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(value, "utf8", "hex");
    encrypted += cipher.final("hex");
    const authTag = cipher.getAuthTag().toString("hex");

    return `enc:v1:${iv.toString("hex")}:${authTag}:${encrypted}`;
  } catch (err: any) {
    throw new EncryptionError(err?.message || "Failed to encrypt PII value");
  }
}

export function decryptSensitiveValue(encryptedValue: string): string {
  if (!encryptedValue) return "";
  if (!encryptedValue.startsWith("enc:")) {
    // If not encrypted, return as is (for legacy unencrypted fixtures)
    return encryptedValue;
  }

  try {
    const parts = encryptedValue.split(":");
    if (parts.length < 4) {
      throw new Error("Invalid encrypted format token");
    }

    let ivHex = "";
    let authTagHex = "";
    let encryptedText = "";

    if (parts[1] === "v1" && parts.length === 5) {
      [, , ivHex, authTagHex, encryptedText] = parts;
    } else if (parts.length === 4) {
      [, ivHex, authTagHex, encryptedText] = parts;
    } else {
      throw new Error("Malformed encrypted version payload");
    }

    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    const key = getSecretKey();

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (err: any) {
    throw new DecryptionError(err?.message || "Failed to decrypt PII value");
  }
}

export function maskPhone(phone: string): string {
  if (!phone) return "+1 (555) ***-****";
  const cleaned = phone.trim();
  if (cleaned.length < 7) return "***-****";
  return `${cleaned.slice(0, 6)}***-${cleaned.slice(-4)}`;
}

export function maskEmail(email: string): string {
  if (!email || !email.includes("@")) return "c***r@demo.voxdesk.ai";
  const [user, domain] = email.split("@");
  const maskedUser =
    user.length > 2 ? `${user[0]}***${user[user.length - 1]}` : `${user[0]}***`;
  return `${maskedUser}@${domain}`;
}
