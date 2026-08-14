import { beforeEach, describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/demo/session/start/route';
import { demoSessionStore } from '@/lib/demo/store';

describe('demo session start', () => {
  beforeEach(async () => {
    await demoSessionStore.clearAllSessions();
  });

  it('creates a signed admission and reuses it without consuming another session', async () => {
    const payload = {
      scenario: 'QUALIFICATION',
      presetKey: 'LEGAL',
      language: 'en-US',
    };

    const first = await POST(
      new NextRequest('http://localhost/api/demo/session/start', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'user-agent': 'voxdesk-unit-test',
          'x-forwarded-for': '192.0.2.42',
        },
        body: JSON.stringify(payload),
      })
    );

    expect(first.status).toBe(200);
    const firstBody = await first.json();
    expect(firstBody.success).toBe(true);
    expect(firstBody.reused).toBe(false);

    const setCookie = first.headers.get('set-cookie');
    expect(setCookie).toContain('voxdesk_demo_session=');
    const cookie = setCookie?.split(';')[0] ?? '';

    const second = await POST(
      new NextRequest('http://localhost/api/demo/session/start', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          cookie,
          'user-agent': 'voxdesk-unit-test',
          'x-forwarded-for': '192.0.2.42',
        },
        body: JSON.stringify(payload),
      })
    );

    expect(second.status).toBe(200);
    const secondBody = await second.json();
    expect(secondBody.success).toBe(true);
    expect(secondBody.reused).toBe(true);
    expect(secondBody.sessionId).toBe(firstBody.sessionId);
  });
});
