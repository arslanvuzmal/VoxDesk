import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const DEFAULT_KEY =
  process.env.ENCRYPTION_KEY ||
  "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

function getKey(): Buffer {
  return Buffer.from(DEFAULT_KEY.slice(0, 64), "hex");
}

export function encryptText(plaintext: string): string {
  if (!plaintext) return "";
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");
  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

export function decryptText(encryptedPayload: string): string {
  if (!encryptedPayload) return "";
  const parts = encryptedPayload.split(":");
  if (parts.length !== 3) return encryptedPayload; // Fallback if plain
  const [ivHex, authTagHex, encryptedText] = parts;
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

export function maskPhoneNumber(phone: string): string {
  if (!phone) return "";
  const clean = phone.replace(/\D/g, "");
  if (clean.length < 4) return "***-***-****";
  const lastFour = clean.slice(-4);
  return `+1 (***) ***-${lastFour}`;
}

export function maskEmail(email: string): string {
  if (!email || !email.includes("@")) return "***@***.com";
  const [name, domain] = email.split("@");
  const maskedName = name.length > 2 ? `${name.slice(0, 2)}***` : `${name}***`;
  return `${maskedName}@${domain}`;
}
