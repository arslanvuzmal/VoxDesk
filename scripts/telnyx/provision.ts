import { TelnyxProvider } from '@/lib/telephony/providers/telnyx';
import { env } from '@/lib/config/env';

interface ProvisionConfig {
  workspaceId: string;
  businessId: string;
  businessName: string;
  phoneNumber?: string;
  callerId?: string;
  webhookUrl: string;
  failoverUrl: string;
  outboundEnabled: boolean;
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  const telnyx = new TelnyxProvider();

  if (command === 'verify') {
    await verifyResources(telnyx);
    return;
  }

  const config: ProvisionConfig = {
    workspaceId: process.env.WORKSPACE_ID || args[1] || '',
    businessId: process.env.BUSINESS_ID || args[2] || '',
    businessName: process.env.BUSINESS_NAME || args[3] || 'VoxDesk Business',
    phoneNumber: process.env.TELNYX_PHONE_NUMBER || args[4],
    callerId: process.env.TELNYX_CALLER_ID || args[5],
    webhookUrl: `${process.env.APP_URL}/api/webhooks/telnyx/voice`,
    failoverUrl: `${process.env.APP_URL}/api/webhooks/telnyx/voice/failover`,
    outboundEnabled: process.env.TELNYX_OUTBOUND_ENABLED === 'true',
  };

  if (!config.workspaceId || !config.businessId) {
    console.error(
      'Usage: npm run telnyx:provision [verify] <workspaceId> <businessId> <businessName> [phoneNumber] [callerId]'
    );
    console.error(
      'Or set environment variables: WORKSPACE_ID, BUSINESS_ID, BUSINESS_NAME, TELNYX_PHONE_NUMBER, TELNYX_CALLER_ID'
    );
    process.exit(1);
  }

  console.log('[PROVISIONING] Starting Telnyx provisioning...');
  console.log('Config:', {
    workspaceId: config.workspaceId,
    businessId: config.businessId,
    businessName: config.businessName,
    phoneNumber: config.phoneNumber ? '***' : 'not provided',
    callerId: config.callerId ? '***' : 'not provided',
    webhookUrl: config.webhookUrl,
    failoverUrl: config.failoverUrl,
    outboundEnabled: config.outboundEnabled,
  });

  const result = await telnyx.provisionResources(config);

  console.log('\n[PROVISIONING RESULT]');
  console.log('Success:', result.success);
  console.log('Connection ID:', result.connectionId);
  console.log('Phone Number:', result.phoneNumber);
  console.log('Outbound Profile ID:', result.outboundProfileId);
  console.log('SIP Trunk ID:', result.sipTrunkId);
  console.log('Webhook Configured:', result.webhookConfigured);
  console.log('Failover Configured:', result.failoverConfigured);
  console.log('Errors:', result.errors);

  if (!result.success) {
    process.exit(1);
  }

  console.log('\n[VERIFICATION] Verifying provisioned resources...');
  await verifyResources(telnyx, config);
}

async function verifyResources(telnyx: TelnyxProvider, config?: ProvisionConfig) {
  const result = await telnyx.verifyResources(
    config || {
      workspaceId: process.env.WORKSPACE_ID || '',
      businessId: process.env.BUSINESS_ID || '',
      businessName: process.env.BUSINESS_NAME || '',
      webhookUrl: `${process.env.APP_URL}/api/webhooks/telnyx/voice`,
      failoverUrl: `${process.env.APP_URL}/api/webhooks/telnyx/voice/failover`,
      outboundEnabled: process.env.TELNYX_OUTBOUND_ENABLED === 'true',
    }
  );

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
    console.error('\n[VERIFICATION] FAILED - Resources not fully verified');
    process.exit(1);
  }

  console.log('\n[VERIFICATION] PASSED - All resources verified');
}

main().catch(error => {
  console.error('[PROVISIONING ERROR]', error);
  process.exit(1);
});
