import { NextResponse } from 'next/server';
import { TelnyxProvider } from '@/lib/telephony/providers/telnyx';

export async function GET() {
  const configured = Boolean(process.env.TELNYX_API_KEY && process.env.TELNYX_CONNECTION_ID);
  if (!configured) {
    return NextResponse.json({
      status: 'NOT_CONFIGURED',
      provider: 'TELNYX',
      configured: false,
      verified: false,
    });
  }

  const result = await new TelnyxProvider().healthCheck();
  const verified = result.status === 'OPERATIONAL';
  return NextResponse.json(
    {
      status: verified ? 'HEALTHY' : 'DEGRADED',
      provider: 'TELNYX',
      configured: true,
      verified,
      latencyMs: result.latencyMs,
    },
    { status: verified ? 200 : 503 }
  );
}
