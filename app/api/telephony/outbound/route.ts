import { NextRequest, NextResponse } from 'next/server';
import { outboundHandler } from '@/lib/telephony/outbound';
import { featureFlags } from '@/lib/features/flags';

export async function POST(req: NextRequest) {
  try {
    const outboundEnabled = await featureFlags.isEnabled('TELNYX_OUTBOUND_ENABLED');
    const campaignsEnabled = await featureFlags.isEnabled('OUTBOUND_CAMPAIGNS_ENABLED');

    if (!outboundEnabled) {
      return NextResponse.json(
        { error: 'Outbound telephony not enabled', code: 'FEATURE_DISABLED' },
        { status: 503 }
      );
    }

    const body = await req.json();
    const {
      workspaceId,
      businessId,
      agentId,
      agentVersionId,
      toNumber,
      fromNumber,
      workflowType,
      language,
      trainingPackVersion,
      contactId,
      campaignId,
      openingDisclosure,
      maxAttempts,
      retryIntervalMinutes,
      callingWindowStart,
      callingWindowEnd,
      timeZone,
    } = body;

    if (
      !workspaceId ||
      !businessId ||
      !agentId ||
      !agentVersionId ||
      !toNumber ||
      !fromNumber ||
      !workflowType ||
      !language
    ) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (campaignId && !campaignsEnabled) {
      return NextResponse.json(
        { error: 'Campaigns not enabled', code: 'FEATURE_DISABLED' },
        { status: 503 }
      );
    }

    const result = await outboundHandler.initiateOutboundCall({
      workspaceId,
      businessId,
      agentId,
      agentVersionId,
      toNumber,
      fromNumber,
      workflowType,
      language,
      trainingPackVersion: trainingPackVersion || 1,
      contactId,
      campaignId,
      openingDisclosure,
      maxAttempts,
      retryIntervalMinutes,
      callingWindowStart,
      callingWindowEnd,
      timeZone,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error,
          code: 'OUTBOUND_HANDLER_FAILED',
          blockedReason: result.blockedReason,
        },
        { status: result.blockedReason ? 409 : 500 }
      );
    }

    return NextResponse.json({
      success: true,
      callId: result.callId,
    });
  } catch (error) {
    console.error('[TELEPHONY OUTBOUND ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const outboundEnabled = await featureFlags.isEnabled('TELNYX_OUTBOUND_ENABLED');
  const campaignsEnabled = await featureFlags.isEnabled('OUTBOUND_CAMPAIGNS_ENABLED');
  const telnyxEnabled = await featureFlags.isEnabled('TELNYX_TELEPHONY_ENABLED');

  return NextResponse.json({
    outboundEnabled,
    campaignsEnabled,
    telnyxEnabled,
    provider: 'telnyx',
    supportedWorkflows: [
      'APPOINTMENT_REMINDER',
      'REQUESTED_CALLBACK',
      'CUSTOMER_FOLLOW_UP',
      'MISSING_INFORMATION_REMINDER',
      'SERVICE_UPDATE',
      'CONSENTED_LEAD_FOLLOW_UP',
      'SURVEY_REQUEST',
    ],
  });
}
