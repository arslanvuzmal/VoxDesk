import { NextRequest, NextResponse } from 'next/server';
import { featureFlags } from '@/lib/features/flags';
import { retiredEndpoint } from '@/lib/http/retired-endpoint';

export async function POST() {
  return retiredEndpoint('/api/webhooks/telnyx/voice');
}

export async function GET(req: NextRequest) {
  const inboundEnabled = await featureFlags.isEnabled('TELNYX_INBOUND_ENABLED');
  const telnyxEnabled = await featureFlags.isEnabled('TELNYX_TELEPHONY_ENABLED');

  return NextResponse.json({
    inboundEnabled,
    telnyxEnabled,
    provider: 'telnyx',
  });
}
