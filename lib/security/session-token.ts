import crypto from 'crypto';
import { env } from '@/lib/config/env';

export interface DemoSessionPayload {
  sessionId: string;
  presetKey: 'LEGAL';
  language: 'en-US';
  scenario: 'BOOKING' | 'QUALIFICATION' | 'ESCALATION' | 'ROUTINE';
  issuedAt: number;
  expiresAt: number;
}

function getSessionSecret(): string {
  return env.DEMO_SESSION_SECRET;
}

export function signDemoSessionToken(payload: DemoSessionPayload): string {
  const secret = getSessionSecret();
  const jsonStr = JSON.stringify(payload);
  const base64Data = Buffer.from(jsonStr).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(base64Data).digest('base64url');
  return `${base64Data}.${signature}`;
}

export function verifyDemoSessionToken(token: string): DemoSessionPayload | null {
  if (!token || !token.includes('.')) return null;
  const [base64Data, signature] = token.split('.');
  if (!base64Data || !signature) return null;

  const secret = getSessionSecret();
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(base64Data)
    .digest('base64url');

  const actual = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);
  if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) {
    return null;
  }

  try {
    const payload: DemoSessionPayload = JSON.parse(
      Buffer.from(base64Data, 'base64url').toString('utf8')
    );
    if (Date.now() > payload.expiresAt) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}
