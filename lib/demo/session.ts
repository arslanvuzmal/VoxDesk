import crypto from "crypto";

export interface DemoSessionData {
  id: string;
  createdAt: number;
  expiresAt: number;
  scenario: "BOOKING" | "QUALIFICATION" | "ESCALATION" | "ROUTINE";
  state: string;
  turnsUsed: number;
  maxTurns: number;
  userCharCount: number;
  agentCharCount: number;
  completed: boolean;
  ipHash: string;
}

const DEMO_SECRET = process.env.DEMO_SESSION_SECRET || "voxdesk-demo-secret-key-2026";

export function hashClientIP(ip: string): string {
  const salt = process.env.IP_HASH_SECRET || "voxdesk-ip-salt-2026";
  return crypto.createHmac("sha256", salt).update(ip || "127.0.0.1").digest("hex").slice(0, 16);
}

export function createDemoSession(scenario: "BOOKING" | "QUALIFICATION" | "ESCALATION" | "ROUTINE", clientIP: string): DemoSessionData {
  const now = Date.now();
  const durationMs = parseInt(process.env.DEMO_MAX_DURATION_SECONDS || "180", 10) * 1000;
  const maxTurns = parseInt(process.env.DEMO_MAX_TURNS || "6", 10);

  return {
    id: `demo_sess_${crypto.randomBytes(8).toString("hex")}`,
    createdAt: now,
    expiresAt: now + durationMs,
    scenario,
    state: "GREETING",
    turnsUsed: 0,
    maxTurns,
    userCharCount: 0,
    agentCharCount: 0,
    completed: false,
    ipHash: hashClientIP(clientIP),
  };
}

export function signSessionPayload(data: DemoSessionData): string {
  const jsonStr = JSON.stringify(data);
  const signature = crypto.createHmac("sha256", DEMO_SECRET).update(jsonStr).digest("hex");
  return `${Buffer.from(jsonStr).toString("base64")}.${signature}`;
}

export function verifySessionToken(token: string): DemoSessionData | null {
  if (!token || !token.includes(".")) return null;
  const [b64Data, signature] = token.split(".");

  try {
    const jsonStr = Buffer.from(b64Data, "base64").toString("utf-8");
    const expectedSig = crypto.createHmac("sha256", DEMO_SECRET).update(jsonStr).digest("hex");

    if (signature !== expectedSig) return null;
    const data: DemoSessionData = JSON.parse(jsonStr);

    if (Date.now() > data.expiresAt) return null;
    return data;
  } catch {
    return null;
  }
}
