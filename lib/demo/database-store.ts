import 'server-only';

import crypto from 'crypto';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/database';
import type { DemoSessionData, IDemoSessionStore, StoredResponse } from '@/lib/demo/store';

type Scenario = DemoSessionData['scenario'];

const SESSION_TTL_MS = 30 * 60 * 1000;
const RESPONSE_TTL_MS = 5 * 60 * 1000;

function toInputJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function fromStoredJson(value: Prisma.JsonValue): DemoSessionData {
  return value as unknown as DemoSessionData;
}

function utcDayStart(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function makeSession(
  scenario: Scenario,
  ipHash: string,
  userAgentHash: string,
  presetKey: string,
  language: string
): DemoSessionData {
  const now = Date.now();

  return {
    sessionId: `sess_${crypto.randomBytes(18).toString('base64url')}`,
    scenario,
    presetKey,
    language,
    state: 'READY',
    createdAt: now,
    expiresAt: now + SESSION_TTL_MS,
    lastActivityAt: now,
    turnsUsed: 0,
    maxTurns: 50,
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
}

/**
 * Durable production fallback for portfolio deployments that already have
 * Postgres but do not provision Redis. The public demo retains signed cookies,
 * per-IP limits, bounded concurrency, expiring locks, and idempotent responses.
 */
export class DatabaseDemoSessionStore implements IDemoSessionStore {
  async createSession(
    scenario: Scenario,
    ipHash: string,
    userAgentHash: string,
    presetKey: string = 'LEGAL',
    language: string = 'en-US'
  ): Promise<DemoSessionData> {
    const session = makeSession(scenario, ipHash, userAgentHash, presetKey, language);

    await prisma.demoSessionRecord.create({
      data: {
        id: session.sessionId,
        scenario,
        presetKey,
        language,
        state: session.state,
        data: toInputJson(session),
        ipHash,
        userAgentHash,
        expiresAt: new Date(session.expiresAt),
      },
    });

    return session;
  }

  async getSession(sessionId: string): Promise<DemoSessionData | null> {
    const record = await prisma.demoSessionRecord.findUnique({ where: { id: sessionId } });
    if (!record || record.completed || record.expiresAt.getTime() <= Date.now()) return null;
    return fromStoredJson(record.data);
  }

  async updateSession(
    sessionId: string,
    updates: Partial<DemoSessionData>
  ): Promise<DemoSessionData | null> {
    return prisma.$transaction(async tx => {
      const record = await tx.demoSessionRecord.findUnique({ where: { id: sessionId } });
      if (!record || record.completed || record.expiresAt.getTime() <= Date.now()) return null;

      const current = fromStoredJson(record.data);
      const updated: DemoSessionData = {
        ...current,
        ...updates,
        lastActivityAt: Date.now(),
      };

      await tx.demoSessionRecord.update({
        where: { id: sessionId },
        data: {
          scenario: updated.scenario,
          presetKey: updated.presetKey ?? 'LEGAL',
          language: updated.language ?? 'en-US',
          state: updated.state,
          data: toInputJson(updated),
          expiresAt: new Date(updated.expiresAt),
          completed: updated.completed,
        },
      });

      return updated;
    });
  }

  async endSession(sessionId: string, reason: string): Promise<boolean> {
    return prisma.$transaction(async tx => {
      const record = await tx.demoSessionRecord.findUnique({ where: { id: sessionId } });
      if (!record) return false;

      const session = fromStoredJson(record.data);
      const completed = { ...session, completed: true, terminationReason: reason };

      await tx.demoSessionRecord.update({
        where: { id: sessionId },
        data: {
          completed: true,
          state: 'COMPLETED',
          data: toInputJson(completed),
          lockExpiresAt: null,
        },
      });
      return true;
    });
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    const deleted = await prisma.demoSessionRecord.deleteMany({ where: { id: sessionId } });
    return deleted.count > 0;
  }

  async clearAllSessions(): Promise<void> {
    await prisma.demoSessionRecord.deleteMany();
  }

  async acquireRequestLock(sessionId: string): Promise<boolean> {
    const now = new Date();
    const acquired = await prisma.demoSessionRecord.updateMany({
      where: {
        id: sessionId,
        completed: false,
        expiresAt: { gt: now },
        OR: [{ lockExpiresAt: null }, { lockExpiresAt: { lt: now } }],
      },
      data: { lockExpiresAt: new Date(now.getTime() + 15_000) },
    });
    return acquired.count === 1;
  }

  async releaseRequestLock(sessionId: string): Promise<void> {
    await prisma.demoSessionRecord.updateMany({
      where: { id: sessionId },
      data: { lockExpiresAt: null },
    });
  }

  async recordTurnId(sessionId: string, turnId: string): Promise<boolean> {
    return prisma.$transaction(async tx => {
      const record = await tx.demoSessionRecord.findUnique({ where: { id: sessionId } });
      if (!record || record.completed || record.expiresAt.getTime() <= Date.now()) return false;

      const session = fromStoredJson(record.data);
      if (!session.processedTurnIds.includes(turnId)) {
        session.processedTurnIds.push(turnId);
        session.lastActivityAt = Date.now();
        await tx.demoSessionRecord.update({
          where: { id: sessionId },
          data: { data: toInputJson(session) },
        });
      }
      return true;
    });
  }

  async hasProcessedTurnId(sessionId: string, turnId: string): Promise<boolean> {
    const session = await this.getSession(sessionId);
    return Boolean(session?.processedTurnIds.includes(turnId));
  }

  async storeResponseId(sessionId: string, text: string): Promise<StoredResponse> {
    const session = await this.getSession(sessionId);
    if (!session) throw new Error('Demo session is unavailable.');

    const createdAt = Date.now();
    const stored: StoredResponse = {
      responseId: `resp_${crypto.randomBytes(18).toString('base64url')}`,
      sessionId,
      text,
      characterCount: text.length,
      createdAt,
      consumed: false,
    };

    await prisma.demoStoredResponse.create({
      data: {
        id: stored.responseId,
        sessionId,
        text,
        characterCount: stored.characterCount,
        expiresAt: new Date(createdAt + RESPONSE_TTL_MS),
      },
    });

    await this.updateSession(sessionId, {
      storedResponses: { ...session.storedResponses, [stored.responseId]: stored },
    });

    return stored;
  }

  async getStoredResponse(responseId: string): Promise<StoredResponse | null> {
    const response = await prisma.demoStoredResponse.findFirst({
      where: { id: responseId, expiresAt: { gt: new Date() } },
    });
    if (!response) return null;

    return {
      responseId: response.id,
      sessionId: response.sessionId,
      text: response.text,
      characterCount: response.characterCount,
      createdAt: response.createdAt.getTime(),
      consumed: response.consumed,
    };
  }

  async consumeResponse(responseId: string): Promise<StoredResponse | null> {
    const consumed = await prisma.demoStoredResponse.updateMany({
      where: { id: responseId, consumed: false, expiresAt: { gt: new Date() } },
      data: { consumed: true },
    });
    if (consumed.count !== 1) return null;
    return this.getStoredResponse(responseId);
  }

  async countActiveSessions(): Promise<number> {
    return prisma.demoSessionRecord.count({
      where: { completed: false, expiresAt: { gt: new Date() } },
    });
  }

  async getActiveSessionCount(): Promise<number> {
    return this.countActiveSessions();
  }

  async getIpDailySessionCount(ipHash: string): Promise<number> {
    return prisma.demoSessionRecord.count({
      where: { ipHash, createdAt: { gte: utcDayStart() } },
    });
  }

  async checkIpCooldown(ipHash: string, cooldownSeconds: number): Promise<boolean> {
    const latest = await prisma.demoSessionRecord.findFirst({
      where: { ipHash },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    });
    if (!latest) return false;
    return Date.now() - latest.createdAt.getTime() < cooldownSeconds * 1000;
  }

  async checkDailyIPLimit(
    ipHash: string
  ): Promise<{ allowed: boolean; current: number; limit: number }> {
    const current = await this.getIpDailySessionCount(ipHash);
    return { allowed: current < 10, current, limit: 10 };
  }

  async checkGlobalDailyLimit(): Promise<{
    allowed: boolean;
    current: number;
    limit: number;
  }> {
    const current = await prisma.demoSessionRecord.count({
      where: { createdAt: { gte: utcDayStart() } },
    });
    return { allowed: current < 100, current, limit: 100 };
  }

  async checkCooldown(ipHash: string): Promise<{ allowed: boolean; secondsRemaining: number }> {
    const latest = await prisma.demoSessionRecord.findFirst({
      where: { ipHash },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    });
    if (!latest) return { allowed: true, secondsRemaining: 0 };

    const remainingMs = 15_000 - (Date.now() - latest.createdAt.getTime());
    return {
      allowed: remainingMs <= 0,
      secondsRemaining: Math.max(0, Math.ceil(remainingMs / 1000)),
    };
  }
}
