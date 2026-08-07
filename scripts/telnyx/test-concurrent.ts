import { TelnyxProvider } from '@/lib/telephony/providers/telnyx';
import { acquireCallLeases, releaseCallLeases } from '@/lib/telephony/concurrency';

async function main() {
  const telnyx = new TelnyxProvider();

  const inboundNumber = process.env.TELNYX_TEST_NUMBER || '+15550000002';
  const outboundNumber = process.env.TELNYX_OUTBOUND_TEST_NUMBER || '+15550000003';
  const fromNumber = process.env.TELNYX_PRIMARY_PHONE_NUMBER || process.env.TELNYX_CALLER_ID;

  if (!inboundNumber || !outboundNumber || !fromNumber) {
    console.error('Requires:');
    console.error('  TELNYX_TEST_NUMBER (for inbound simulation)');
    console.error('  TELNYX_OUTBOUND_TEST_NUMBER (for outbound)');
    console.error('  TELNYX_PRIMARY_PHONE_NUMBER or TELNYX_CALLER_ID');
    process.exit(1);
  }

  const workspaceId = process.env.WORKSPACE_ID || 'test_workspace';
  const businessId = process.env.BUSINESS_ID || 'test_business';
  const agentId = process.env.ELEVENLABS_AGENT_ID_LEGAL_EN || 'test_agent';

  console.log('[TEST CONCURRENT] Starting simultaneous inbound/outbound test...');
  console.log('Workspace:', workspaceId);
  console.log('Business:', businessId);
  console.log('Agent:', agentId);

  const inboundLeases = await acquireCallLeases(
    workspaceId,
    businessId,
    agentId,
    undefined,
    undefined,
    'INBOUND'
  );
  console.log('\n[INBOUND LEASES]');
  console.log('Success:', inboundLeases.success);
  console.log('Leases:', inboundLeases.leases);
  console.log('Failed:', inboundLeases.failed);

  if (!inboundLeases.success) {
    console.error('[TEST] FAILED - Could not acquire inbound leases');
    process.exit(1);
  }

  const outboundLeases = await acquireCallLeases(
    workspaceId,
    businessId,
    agentId,
    undefined,
    undefined,
    'OUTBOUND'
  );
  console.log('\n[OUTBOUND LEASES]');
  console.log('Success:', outboundLeases.success);
  console.log('Leases:', outboundLeases.leases);
  console.log('Failed:', outboundLeases.failed);

  if (!outboundLeases.success) {
    console.error('[TEST] FAILED - Could not acquire outbound leases');
    await releaseCallLeases('inbound', inboundLeases.leases);
    process.exit(1);
  }

  console.log('\n[TEST] Both leases acquired - simulating concurrent calls...');

  const inboundCall = await telnyx.startCall({
    workspaceId,
    businessId,
    agentId,
    agentVersionId: 'v1',
    callerNumber: inboundNumber,
    direction: 'INBOUND',
    channel: 'PHONE',
    language: 'en-US',
    trainingPackVersion: 1,
  });

  console.log('\n[INBOUND CALL]');
  console.log('Provider Call Control ID:', inboundCall.providerCallControlId);

  const outboundCall = await telnyx.startCall({
    workspaceId,
    businessId,
    agentId,
    agentVersionId: 'v1',
    callerNumber: outboundNumber,
    direction: 'OUTBOUND',
    channel: 'PHONE',
    language: 'en-US',
    trainingPackVersion: 1,
  });

  console.log('\n[OUTBOUND CALL]');
  console.log('Provider Call Control ID:', outboundCall.providerCallControlId);

  console.log('\n[TEST] Both calls initiated - monitoring for 30s...');
  let inboundCompleted = false;
  let outboundCompleted = false;
  const maxWait = 30000;
  const startTime = Date.now();

  while ((!inboundCompleted || !outboundCompleted) && Date.now() - startTime < maxWait) {
    await new Promise(resolve => setTimeout(resolve, 3000));

    if (!inboundCompleted) {
      const inboundStatus = await telnyx.getCall(inboundCall.providerCallControlId);
      if (
        inboundStatus &&
        ['COMPLETED', 'BUSY', 'NO_ANSWER', 'VOICEMAIL', 'FAILED'].includes(inboundStatus.status)
      ) {
        inboundCompleted = true;
        console.log(`[INBOUND] Completed: ${inboundStatus.status}`);
      }
    }

    if (!outboundCompleted) {
      const outboundStatus = await telnyx.getCall(outboundCall.providerCallControlId);
      if (
        outboundStatus &&
        ['COMPLETED', 'BUSY', 'NO_ANSWER', 'VOICEMAIL', 'FAILED'].includes(outboundStatus.status)
      ) {
        outboundCompleted = true;
        console.log(`[OUTBOUND] Completed: ${outboundStatus.status}`);
      }
    }
  }

  console.log('\n[TEST] Releasing leases...');
  await releaseCallLeases('inbound', inboundLeases.leases);
  await releaseCallLeases('outbound', outboundLeases.leases);

  if (inboundCompleted && outboundCompleted) {
    console.log('\n[TEST] PASSED - Both calls completed with concurrent leases');
  } else {
    console.log('\n[TEST] PARTIAL - Inbound:', inboundCompleted, 'Outbound:', outboundCompleted);
  }
}

main().catch(error => {
  console.error('[TEST ERROR]', error);
  process.exit(1);
});
