import "server-only";
import crypto from "crypto";
import { env } from "@/lib/config/env";
import { demoSessionStore, DemoSessionData } from "@/lib/demo/store";
import { generateIPHash, generateUserAgentHash } from "@/lib/demo/rate-limit";

function getSecretKey(): string {
  return env.DEMO_SESSION_SECRET;
}

export function signOpaqueSessionId(sessionId: string): string {
  const hmac = crypto.createHmac("sha256", getSecretKey());
  hmac.update(sessionId);
  const signature = hmac.digest("hex");
  return `${sessionId}.${signature}`;
}

export function verifyOpaqueSessionToken(token: string): string | null {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [sessionId, providedSignature] = parts;
  const hmac = crypto.createHmac("sha256", getSecretKey());
  hmac.update(sessionId);
  const expectedSignature = hmac.digest("hex");

  const providedBuf = Buffer.from(providedSignature, "hex");
  const expectedBuf = Buffer.from(expectedSignature, "hex");

  if (providedBuf.length !== expectedBuf.length) return null;
  if (!crypto.timingSafeEqual(providedBuf, expectedBuf)) return null;

  return sessionId;
}

export async function createDemoSession(
  scenario: "BOOKING" | "QUALIFICATION" | "ESCALATION" | "ROUTINE",
  reqIp: string,
  reqUserAgent: string,
): Promise<{ token: string; session: DemoSessionData }> {
  const ipHash = generateIPHash(reqIp);
  const uaHash = generateUserAgentHash(reqUserAgent);

  const session = await demoSessionStore.createSession(
    scenario,
    ipHash,
    uaHash,
  );
  const token = signOpaqueSessionId(session.sessionId);

  return { token, session };
}

export async function getDemoSessionFromCookieToken(
  token: string,
): Promise<DemoSessionData | null> {
  const sessionId = verifyOpaqueSessionToken(token);
  if (!sessionId) return null;
  return await demoSessionStore.getSession(sessionId);
}
