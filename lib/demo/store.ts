import "server-only";
import { Redis } from "@upstash/redis";
import { env } from "@/lib/config/env";

export interface StoredResponse {
  responseId: string;
  sessionId: string;
  text: string;
  characterCount: number;
  createdAt: number;
  consumed: boolean;
}

export interface DemoSessionData {
  sessionId: string;
  scenario: "BOOKING" | "QUALIFICATION" | "ESCALATION" | "ROUTINE";
  presetKey?: string;
  language?: string;
  state: string;
  createdAt: number;
  expiresAt: number;
  lastActivityAt: number;
  turnsUsed: number;
  maxTurns: number;
  userCharacters: number;
  agentCharacters: number;
  llmInputTokens: number;
  llmOutputTokens: number;
  ttsCharacters: number;
  sttSeconds: number;
  activeRequest: boolean;
  activeSTTConnection: boolean;
  sttTokenIssuedAt?: number;
  processedTurnIds: string[];
  history: Array<{ role: "CALLER" | "AGENT"; text: string }>;
  storedResponses: Record<string, StoredResponse>;
  accumulatedFields: Record<string, any>;
  missingRequiredFields: string[];
  latestQualification?: any;
  latestBusinessAction?: any;
  pendingConfirmation?: any;
  executedActionKeys: string[];
  providerExecutions: any[];
  ipHash: string;
  userAgentHash: string;
  completed: boolean;
  terminationReason?: string;
}

export interface IDemoSessionStore {
  createSession(
    scenario: "BOOKING" | "QUALIFICATION" | "ESCALATION" | "ROUTINE",
    ipHash: string,
    userAgentHash: string,
    presetKey?: string,
    language?: string,
  ): Promise<DemoSessionData>;
  getSession(sessionId: string): Promise<DemoSessionData | null>;
  updateSession(
    sessionId: string,
    updates: Partial<DemoSessionData>,
  ): Promise<DemoSessionData | null>;
  endSession(sessionId: string, reason: string): Promise<boolean>;
  deleteSession(sessionId: string): Promise<boolean>;
  acquireRequestLock(sessionId: string): Promise<boolean>;
  releaseRequestLock(sessionId: string): Promise<void>;
  recordTurnId(sessionId: string, turnId: string): Promise<boolean>;
  hasProcessedTurnId(sessionId: string, turnId: string): Promise<boolean>;
  storeResponseId(sessionId: string, text: string): Promise<StoredResponse>;
  getStoredResponse(responseId: string): Promise<StoredResponse | null>;
  consumeResponse(responseId: string): Promise<StoredResponse | null>;
  countActiveSessions(): Promise<number>;
  checkDailyIPLimit(
    ipHash: string,
  ): Promise<{ allowed: boolean; current: number; limit: number }>;
  checkGlobalDailyLimit(): Promise<{
    allowed: boolean;
    current: number;
    limit: number;
  }>;
  checkCooldown(
    ipHash: string,
  ): Promise<{ allowed: boolean; secondsRemaining: number }>;
}

const globalForDemoStore = globalThis as unknown as {
  voxdeskSessions?: Map<string, DemoSessionData>;
  voxdeskIpSessionCount?: Map<string, { count: number; date: string }>;
  voxdeskIpLastSession?: Map<string, number>;
  voxdeskGlobalDailySessions?: { count: number; date: string };
  voxdeskLocks?: Set<string>;
  voxdeskResponses?: Map<string, StoredResponse>;
};

// Memory Store for Development & Zero-Config Fallback
class MemoryDemoSessionStore implements IDemoSessionStore {
  private sessions =
    globalForDemoStore.voxdeskSessions ||
    (globalForDemoStore.voxdeskSessions = new Map<string, DemoSessionData>());
  private ipSessionCount =
    globalForDemoStore.voxdeskIpSessionCount ||
    (globalForDemoStore.voxdeskIpSessionCount = new Map<
      string,
      { count: number; date: string }
    >());
  private ipLastSession =
    globalForDemoStore.voxdeskIpLastSession ||
    (globalForDemoStore.voxdeskIpLastSession = new Map<string, number>());
  private globalDailySessions =
    globalForDemoStore.voxdeskGlobalDailySessions ||
    (globalForDemoStore.voxdeskGlobalDailySessions = {
      count: 0,
      date: new Date().toISOString().slice(0, 10),
    });
  private locks =
    globalForDemoStore.voxdeskLocks ||
    (globalForDemoStore.voxdeskLocks = new Set<string>());
  private responses =
    globalForDemoStore.voxdeskResponses ||
    (globalForDemoStore.voxdeskResponses = new Map<string, StoredResponse>());

  private getTodayStr() {
    return new Date().toISOString().slice(0, 10);
  }

  async createSession(
    scenario: "BOOKING" | "QUALIFICATION" | "ESCALATION" | "ROUTINE",
    ipHash: string,
    userAgentHash: string,
    presetKey: string = "LEGAL",
    language: string = "en-US",
  ): Promise<DemoSessionData> {
    const sessionId = `sess_${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`;
    const now = Date.now();
    const expiresAt = now + 180 * 1000;

    const session: DemoSessionData = {
      sessionId,
      scenario,
      presetKey,
      language,
      state: "READY",
      createdAt: now,
      expiresAt,
      lastActivityAt: now,
      turnsUsed: 0,
      maxTurns: 6,
      userCharacters: 0,
      agentCharacters: 0,
      llmInputTokens: 0,
      llmOutputTokens: 0,
      ttsCharacters: 0,
      sttSeconds: 0,
      activeRequest: false,
      activeSTTConnection: false,
      processedTurnIds: [],
      history: [],
      storedResponses: {},
      accumulatedFields: {},
      missingRequiredFields: [],
      executedActionKeys: [],
      providerExecutions: [],
      ipHash,
      userAgentHash,
      completed: false,
    };

    this.sessions.set(sessionId, session);

    const today = this.getTodayStr();
    const currentIp = this.ipSessionCount.get(ipHash);
    if (!currentIp || currentIp.date !== today) {
      this.ipSessionCount.set(ipHash, { count: 1, date: today });
    } else {
      this.ipSessionCount.set(ipHash, {
        count: currentIp.count + 1,
        date: today,
      });
    }

    this.ipLastSession.set(ipHash, now);

    if (this.globalDailySessions.date !== today) {
      this.globalDailySessions = { count: 1, date: today };
    } else {
      this.globalDailySessions.count++;
    }

    return session;
  }

  async getSession(sessionId: string): Promise<DemoSessionData | null> {
    const session = this.sessions.get(sessionId);
    if (!session) return null;
    if (Date.now() > session.expiresAt || session.completed) {
      return null;
    }
    return session;
  }

  async updateSession(
    sessionId: string,
    updates: Partial<DemoSessionData>,
  ): Promise<DemoSessionData | null> {
    const session = await this.getSession(sessionId);
    if (!session) return null;

    const updated = {
      ...session,
      ...updates,
      lastActivityAt: Date.now(),
    };
    this.sessions.set(sessionId, updated);
    return updated;
  }

  async endSession(sessionId: string, reason: string): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    if (!session) return false;
    session.completed = true;
    session.terminationReason = reason;
    this.sessions.set(sessionId, session);
    return true;
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    if (session) {
      Object.keys(session.storedResponses).forEach((respId) =>
        this.responses.delete(respId),
      );
    }
    return this.sessions.delete(sessionId);
  }

  async acquireRequestLock(sessionId: string): Promise<boolean> {
    if (this.locks.has(sessionId)) return false;
    this.locks.add(sessionId);
    return true;
  }

  async releaseRequestLock(sessionId: string): Promise<void> {
    this.locks.delete(sessionId);
  }

  async recordTurnId(sessionId: string, turnId: string): Promise<boolean> {
    const session = await this.getSession(sessionId);
    if (!session) return false;
    if (!session.processedTurnIds.includes(turnId)) {
      session.processedTurnIds.push(turnId);
      this.sessions.set(sessionId, session);
    }
    return true;
  }

  async hasProcessedTurnId(
    sessionId: string,
    turnId: string,
  ): Promise<boolean> {
    const session = await this.getSession(sessionId);
    return !!session?.processedTurnIds.includes(turnId);
  }

  async storeResponseId(
    sessionId: string,
    text: string,
  ): Promise<StoredResponse> {
    const responseId = `resp_${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`;
    const stored: StoredResponse = {
      responseId,
      sessionId,
      text,
      characterCount: text.length,
      createdAt: Date.now(),
      consumed: false,
    };
    this.responses.set(responseId, stored);

    const session = this.sessions.get(sessionId);
    if (session) {
      session.storedResponses[responseId] = stored;
      this.sessions.set(sessionId, session);
    }

    return stored;
  }

  async getStoredResponse(responseId: string): Promise<StoredResponse | null> {
    return this.responses.get(responseId) || null;
  }

  async consumeResponse(responseId: string): Promise<StoredResponse | null> {
    const resp = this.responses.get(responseId);
    if (!resp || resp.consumed) return null;
    resp.consumed = true;
    this.responses.set(responseId, resp);
    return resp;
  }

  async countActiveSessions(): Promise<number> {
    const now = Date.now();
    let count = 0;
    for (const session of this.sessions.values()) {
      if (!session.completed && now <= session.expiresAt) {
        count++;
      }
    }
    return count;
  }

  async checkDailyIPLimit(
    ipHash: string,
  ): Promise<{ allowed: boolean; current: number; limit: number }> {
    return { allowed: true, current: 0, limit: 999999 };
  }

  async checkGlobalDailyLimit(): Promise<{
    allowed: boolean;
    current: number;
    limit: number;
  }> {
    return { allowed: true, current: 0, limit: 999999 };
  }

  async checkCooldown(
    ipHash: string,
  ): Promise<{ allowed: boolean; secondsRemaining: number }> {
    return { allowed: true, secondsRemaining: 0 };
  }
}

// Upstash Redis Store for Production
export class RedisDemoSessionStore implements IDemoSessionStore {
  private redis: Redis;

  constructor(url: string, token: string) {
    this.redis = new Redis({ url, token });
  }

  private getTodayStr() {
    return new Date().toISOString().slice(0, 10);
  }

  async createSession(
    scenario: "BOOKING" | "QUALIFICATION" | "ESCALATION" | "ROUTINE",
    ipHash: string,
    userAgentHash: string,
    presetKey: string = "LEGAL",
    language: string = "en-US",
  ): Promise<DemoSessionData> {
    const sessionId = `sess_${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`;
    const now = Date.now();
    const expiresAt = now + 180 * 1000;

    const session: DemoSessionData = {
      sessionId,
      scenario,
      presetKey,
      language,
      state: "READY",
      createdAt: now,
      expiresAt,
      lastActivityAt: now,
      turnsUsed: 0,
      maxTurns: 6,
      userCharacters: 0,
      agentCharacters: 0,
      llmInputTokens: 0,
      llmOutputTokens: 0,
      ttsCharacters: 0,
      sttSeconds: 0,
      activeRequest: false,
      activeSTTConnection: false,
      processedTurnIds: [],
      history: [],
      storedResponses: {},
      accumulatedFields: {},
      missingRequiredFields: [],
      executedActionKeys: [],
      providerExecutions: [],
      ipHash,
      userAgentHash,
      completed: false,
    };

    const ttl = 180;
    await this.redis.set(
      `voxdesk:session:${sessionId}`,
      JSON.stringify(session),
      { ex: ttl },
    );

    const today = this.getTodayStr();
    await this.redis.incr(`voxdesk:ip:${ipHash}:${today}`);
    await this.redis.expire(`voxdesk:ip:${ipHash}:${today}`, 86400);

    await this.redis.set(`voxdesk:cooldown:${ipHash}`, now.toString(), {
      ex: 60,
    });
    await this.redis.incr(`voxdesk:global:${today}`);
    await this.redis.expire(`voxdesk:global:${today}`, 86400);

    return session;
  }

  async getSession(sessionId: string): Promise<DemoSessionData | null> {
    const raw = await this.redis.get<string>(`voxdesk:session:${sessionId}`);
    if (!raw) return null;
    const session =
      typeof raw === "string" ? JSON.parse(raw) : (raw as DemoSessionData);
    if (!session || session.completed || Date.now() > session.expiresAt)
      return null;
    return session;
  }

  async updateSession(
    sessionId: string,
    updates: Partial<DemoSessionData>,
  ): Promise<DemoSessionData | null> {
    const session = await this.getSession(sessionId);
    if (!session) return null;
    const updated = { ...session, ...updates, lastActivityAt: Date.now() };
    const ttlSeconds = Math.max(
      10,
      Math.floor((session.expiresAt - Date.now()) / 1000),
    );
    await this.redis.set(
      `voxdesk:session:${sessionId}`,
      JSON.stringify(updated),
      { ex: ttlSeconds },
    );
    return updated;
  }

  async endSession(sessionId: string, reason: string): Promise<boolean> {
    const session = await this.getSession(sessionId);
    if (!session) return false;
    session.completed = true;
    session.terminationReason = reason;
    await this.redis.set(
      `voxdesk:session:${sessionId}`,
      JSON.stringify(session),
      { ex: 60 },
    );
    return true;
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    await this.redis.del(`voxdesk:session:${sessionId}`);
    return true;
  }

  async acquireRequestLock(sessionId: string): Promise<boolean> {
    const res = await this.redis.set(`voxdesk:lock:${sessionId}`, "1", {
      nx: true,
      ex: 15,
    });
    return res === "OK";
  }

  async releaseRequestLock(sessionId: string): Promise<void> {
    await this.redis.del(`voxdesk:lock:${sessionId}`);
  }

  async recordTurnId(sessionId: string, turnId: string): Promise<boolean> {
    const session = await this.getSession(sessionId);
    if (!session) return false;
    if (!session.processedTurnIds.includes(turnId)) {
      session.processedTurnIds.push(turnId);
      await this.updateSession(sessionId, {
        processedTurnIds: session.processedTurnIds,
      });
    }
    return true;
  }

  async hasProcessedTurnId(
    sessionId: string,
    turnId: string,
  ): Promise<boolean> {
    const session = await this.getSession(sessionId);
    return !!session?.processedTurnIds.includes(turnId);
  }

  async storeResponseId(
    sessionId: string,
    text: string,
  ): Promise<StoredResponse> {
    const responseId = `resp_${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`;
    const stored: StoredResponse = {
      responseId,
      sessionId,
      text,
      characterCount: text.length,
      createdAt: Date.now(),
      consumed: false,
    };
    await this.redis.set(`voxdesk:resp:${responseId}`, JSON.stringify(stored), {
      ex: 300,
    });

    const session = await this.getSession(sessionId);
    if (session) {
      session.storedResponses[responseId] = stored;
      await this.updateSession(sessionId, {
        storedResponses: session.storedResponses,
      });
    }
    return stored;
  }

  async getStoredResponse(responseId: string): Promise<StoredResponse | null> {
    const raw = await this.redis.get<string>(`voxdesk:resp:${responseId}`);
    if (!raw) return null;
    return typeof raw === "string" ? JSON.parse(raw) : (raw as StoredResponse);
  }

  async consumeResponse(responseId: string): Promise<StoredResponse | null> {
    const stored = await this.getStoredResponse(responseId);
    if (!stored || stored.consumed) return null;
    stored.consumed = true;
    await this.redis.set(`voxdesk:resp:${responseId}`, JSON.stringify(stored), {
      ex: 60,
    });
    return stored;
  }

  async countActiveSessions(): Promise<number> {
    const keys = await this.redis.keys("voxdesk:session:*");
    return keys.length;
  }

  async checkDailyIPLimit(
    ipHash: string,
  ): Promise<{ allowed: boolean; current: number; limit: number }> {
    return { allowed: true, current: 0, limit: 999999 };
  }

  async checkGlobalDailyLimit(): Promise<{
    allowed: boolean;
    current: number;
    limit: number;
  }> {
    return { allowed: true, current: 0, limit: 999999 };
  }

  async checkCooldown(
    ipHash: string,
  ): Promise<{ allowed: boolean; secondsRemaining: number }> {
    return { allowed: true, secondsRemaining: 0 };
  }
}

export function getDemoSessionStoreStatus(): {
  provider: "redis" | "memory";
  ready: boolean;
} {
  const hasRedis = !!(
    env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN
  );

  if (hasRedis) return { provider: "redis", ready: true };
  return { provider: "memory", ready: true };
}

function createSessionStore(): IDemoSessionStore {
  const hasRedis = !!(
    env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN
  );

  if (hasRedis) {
    return new RedisDemoSessionStore(
      env.UPSTASH_REDIS_REST_URL!,
      env.UPSTASH_REDIS_REST_TOKEN!,
    );
  }

  return new MemoryDemoSessionStore();
}

export const demoSessionStore = createSessionStore();
