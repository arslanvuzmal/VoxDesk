import { NextResponse } from 'next/server';

export async function GET() {
  const integrations = {
    elevenLabs: {
      configured: Boolean(process.env.ELEVENLABS_API_KEY && process.env.ELEVENLABS_AGENT_ID),
      status: process.env.ELEVENLABS_API_KEY ? 'CONFIGURED' : 'NOT_CONFIGURED',
    },
    telnyx: {
      configured: Boolean(process.env.TELNYX_API_KEY && process.env.TELNYX_CONNECTION_ID),
      status:
        process.env.TELNYX_API_KEY && process.env.TELNYX_CONNECTION_ID
          ? 'CONFIGURED'
          : 'NOT_CONFIGURED',
    },
    crm: { configured: false, status: 'NOT_CONFIGURED' },
    calendar: { configured: false, status: 'NOT_CONFIGURED' },
  };
  return NextResponse.json({ status: 'HEALTHY', integrations });
}
