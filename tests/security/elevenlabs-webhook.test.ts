import crypto from 'crypto';
import { describe, expect, it } from 'vitest';
import { verifyElevenLabsWebhook } from '@/lib/security/elevenlabs-webhook';

const secret = 'test-elevenlabs-webhook-secret';
const body = JSON.stringify({ type: 'post_call_transcription', data: { conversation_id: 'c1' } });

function sign(timestamp: number, value = body): string {
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}.${value}`)
    .digest('hex');
  return `t=${timestamp},v0=${signature}`;
}

describe('ElevenLabs webhook verification', () => {
  it('accepts a current signature over the exact raw body', () => {
    expect(verifyElevenLabsWebhook(body, sign(1_000), secret, 1_000)).toEqual({
      valid: true,
      timestamp: 1_000,
    });
  });

  it('rejects a forged body', () => {
    expect(verifyElevenLabsWebhook(`${body} `, sign(1_000), secret, 1_000)).toEqual({
      valid: false,
      reason: 'INVALID',
    });
  });

  it('rejects an expired delivery', () => {
    expect(verifyElevenLabsWebhook(body, sign(1_000), secret, 1_301)).toEqual({
      valid: false,
      reason: 'EXPIRED',
    });
  });

  it('rejects missing and malformed signatures', () => {
    expect(verifyElevenLabsWebhook(body, null, secret, 1_000)).toEqual({
      valid: false,
      reason: 'MISSING',
    });
    expect(verifyElevenLabsWebhook(body, 'invalid', secret, 1_000)).toEqual({
      valid: false,
      reason: 'MALFORMED',
    });
  });
});

