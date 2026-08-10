import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as crmSync } from '@/app/api/crm/sync/route';
import { POST as calendarBook } from '@/app/api/calendar/book/route';
import { POST as calendarAvailability } from '@/app/api/calendar/availability/route';
import { POST as voiceEvent } from '@/app/api/voice/event/route';
import { POST as voiceStart } from '@/app/api/voice/start/route';
import { POST as liveKitToken } from '@/app/api/voice/livekit/token/route';
import { POST as inboundStart } from '@/app/api/telephony/inbound/route';

const routes = [
  ['CRM sync', crmSync],
  ['calendar booking', calendarBook],
  ['calendar availability', calendarAvailability],
  ['browser-authored voice events', voiceEvent],
  ['legacy voice start', voiceStart],
  ['LiveKit token minting', liveKitToken],
  ['unverified inbound start', inboundStart],
] as const;

describe('legacy mutation routes', () => {
  for (const [name, handler] of routes) {
    it(`retires ${name} without processing browser input`, async () => {
      const request = new NextRequest('https://example.test/api/legacy', {
        method: 'POST',
        body: JSON.stringify({
          workspaceId: 'workspace-forged',
          phone: '+15559999999',
          provider: 'DEMO',
        }),
      });
      const callable = handler as (...args: unknown[]) => Promise<Response>;
      const response = await callable(request);

      expect(response.status).toBe(410);
      await expect(response.json()).resolves.toMatchObject({
        error: { code: 'ENDPOINT_RETIRED' },
      });
    });
  }
});
