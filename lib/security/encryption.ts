import crypto from "crypto";
import { env } from "@/lib/config/env";

const ALGORITHM = "aes-256-gcm";

function getSecretKey(): Buffer {
  const secret =
    env.DEMO_SESSION_SECRET || "default_voxdesk_secure_key_32_bytes_long!!";
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

    return `enc:${iv.toString("hex")}:${authTag}:${encrypted}`;
  } catch {
    return value;
  }
}

export function decryptSensitiveValue(encryptedValue: string): string {
  if (!encryptedValue || !encryptedValue.startsWith("enc:"))
    return encryptedValue;
  try {
    const parts = encryptedValue.split(":");
    if (parts.length !== 4) return encryptedValue;

    const [, ivHex, authTagHex, encryptedText] = parts;
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    const key = getSecretKey();

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch {
    return encryptedValue;
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
