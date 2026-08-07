import { TelnyxProvider } from '@/lib/telephony/providers/telnyx';

async function main() {
  const telnyx = new TelnyxProvider();

  console.log('[VERIFY] Starting Telnyx resource verification...');

  const result = await telnyx.verifyResources({
    workspaceId: process.env.WORKSPACE_ID || '',
    businessId: process.env.BUSINESS_ID || '',
    businessName: process.env.BUSINESS_NAME || 'VoxDesk Business',
    webhookUrl: `${process.env.APP_URL}/api/webhooks/telnyx/voice`,
    failoverUrl: `${process.env.APP_URL}/api/webhooks/telnyx/voice/failover`,
    outboundEnabled: process.env.TELNYX_OUTBOUND_ENABLED === 'true',
  });

  console.log('\n[VERIFICATION RESULT]');
  console.log('Verified:', result.verified);
  console.log('Phone Numbers:', result.phoneNumbers);
  console.log('Caller IDs:', result.callerIds);
  console.log('Webhook Reachable:', result.webhookReachable);
  console.log('Failover Reachable:', result.failoverReachable);
  console.log('SIP Trunk Healthy:', result.sipTrunkHealthy);
  console.log('Latency (ms):', result.latencyMs);
  console.log('Errors:', result.errors);

  if (!result.verified) {
    console.error('\n[VERIFICATION] FAILED');
    process.exit(1);
  }

  console.log('\n[VERIFICATION] PASSED');
}

main().catch(error => {
  console.error('[VERIFY ERROR]', error);
  process.exit(1);
});
