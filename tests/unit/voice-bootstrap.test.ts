import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { POST } from '@/app/api/demo/voice-bootstrap/route';
import { signDemoSessionToken, verifyDemoSessionToken } from '@/lib/security/session-token';

describe('Voice Bootstrap Endpoint Unit Tests', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should reject non-LEGAL preset or non-en-US language with 400 UNSUPPORTED_CONFIGURATION', async () => {
    const req = new Request('http://localhost/api/demo/voice-bootstrap', {
      method: 'POST',
      body: JSON.stringify({
        presetKey: 'HEALTHCARE',
        language: 'en-US',
        scenario: 'QUALIFICATION',
        channel: 'WEB_VOICE',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('UNSUPPORTED_CONFIGURATION');
  });

  it('should return 503 ELEVENLABS_NOT_CONFIGURED when ELEVENLABS_API_KEY is missing', async () => {
    delete process.env.ELEVENLABS_API_KEY;

    const req = new Request('http://localhost/api/demo/voice-bootstrap', {
      method: 'POST',
      body: JSON.stringify({
        presetKey: 'LEGAL',
        language: 'en-US',
        scenario: 'QUALIFICATION',
        channel: 'WEB_VOICE',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.error).toBe('ELEVENLABS_NOT_CONFIGURED');
  });

  it('should return 502 ELEVENLABS_AGENT_INVALID when ELEVENLABS_AGENT_ID_LEGAL_EN is missing', async () => {
    process.env.ELEVENLABS_API_KEY = 'sk_mock_key_for_unit_tests_1234567890';
    delete process.env.ELEVENLABS_AGENT_ID_LEGAL_EN;
    delete process.env.ELEVENLABS_AGENT_ID;

    const req = new Request('http://localhost/api/demo/voice-bootstrap', {
      method: 'POST',
      body: JSON.stringify({
        presetKey: 'LEGAL',
        language: 'en-US',
        scenario: 'QUALIFICATION',
        channel: 'WEB_VOICE',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(502);
    const body = await res.json();
    expect(body.error).toBe('ELEVENLABS_AGENT_INVALID');
  });

  it('should successfully sign and verify short-lived session token', () => {
    const payload = {
      sessionId: 'demo_sess_unit_test',
      presetKey: 'LEGAL' as const,
      language: 'en-US' as const,
      scenario: 'QUALIFICATION' as const,
      issuedAt: Date.now(),
      expiresAt: Date.now() + 60000,
    };

    const token = signDemoSessionToken(payload);
    expect(token).toBeDefined();
    expect(token).toContain('.');

    const verified = verifyDemoSessionToken(token);
    expect(verified).not.toBeNull();
    expect(verified?.sessionId).toBe('demo_sess_unit_test');
  });
});
