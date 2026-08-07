import { NextRequest, NextResponse } from 'next/server';
import { inboundHandler } from '@/lib/telephony/inbound';
import { featureFlags } from '@/lib/features/flags';

export async function POST(req: NextRequest) {
  try {
    const inboundEnabled = await featureFlags.isEnabled('TELNYX_INBOUND_ENABLED');

    if (!inboundEnabled) {
      return NextResponse.json(
        { error: 'Inbound telephony not enabled', code: 'FEATURE_DISABLED' },
        { status: 503 }
      );
    }

    const body = await req.json();
    const {
      providerCallControlId,
      providerCallSessionId,
      providerCallLegId,
      fromNumber,
      toNumber,
    } = body;

    if (!providerCallControlId || !fromNumber || !toNumber) {
      return NextResponse.json(
        { error: 'Missing required fields: providerCallControlId, fromNumber, toNumber' },
        { status: 400 }
      );
    }

    const result = await inboundHandler.handleInboundCall({
      providerCallControlId,
      providerCallSessionId,
      providerCallLegId,
      fromNumber,
      toNumber,
      direction: 'incoming',
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error, code: 'INBOUND_HANDLER_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      callId: result.callId,
    });
  } catch (error) {
    console.error('[TELEPHONY INBOUND ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
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
