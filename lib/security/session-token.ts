import crypto from 'crypto';

export interface DemoSessionPayload {
  sessionId: string;
  presetKey: 'LEGAL';
  language: 'en-US';
  scenario: 'BOOKING' | 'QUALIFICATION' | 'ESCALATION' | 'ROUTINE';
  issuedAt: number;
  expiresAt: number;
}

function getSessionSecret(): string {
  return (
    process.env.DEMO_SESSION_SECRET?.trim() || 'voxdesk_demo_session_fallback_secret_key_32chars!'
  );
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

  if (signature !== expectedSignature) {
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
