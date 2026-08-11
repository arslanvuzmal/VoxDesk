import 'server-only';
import crypto from 'crypto';

const DEFAULT_TOLERANCE_SECONDS = 5 * 60;

export type ElevenLabsWebhookVerification =
  | { valid: true; timestamp: number }
  | { valid: false; reason: 'MISSING' | 'MALFORMED' | 'EXPIRED' | 'INVALID' };

export function verifyElevenLabsWebhook(
  rawBody: string,
  signatureHeader: string | null,
  secret: string,
  nowSeconds = Math.floor(Date.now() / 1000),
  toleranceSeconds = DEFAULT_TOLERANCE_SECONDS
): ElevenLabsWebhookVerification {
  if (!signatureHeader || !secret) return { valid: false, reason: 'MISSING' };

  const parts = new Map(
    signatureHeader.split(',').map(part => {
      const [key, ...value] = part.trim().split('=');
      return [key, value.join('=')] as const;
    })
  );
  const timestampText = parts.get('t');
  const providedSignature = parts.get('v0');
  const timestamp = Number(timestampText);

  if (!timestampText || !providedSignature || !Number.isSafeInteger(timestamp)) {
    return { valid: false, reason: 'MALFORMED' };
  }

  if (Math.abs(nowSeconds - timestamp) > toleranceSeconds) {
    return { valid: false, reason: 'EXPIRED' };
  }

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}.${rawBody}`)
    .digest('hex');
  const expected = Buffer.from(expectedSignature, 'utf8');
  const provided = Buffer.from(providedSignature, 'utf8');

  if (expected.length !== provided.length || !crypto.timingSafeEqual(expected, provided)) {
    return { valid: false, reason: 'INVALID' };
  }

  return { valid: true, timestamp };
}
