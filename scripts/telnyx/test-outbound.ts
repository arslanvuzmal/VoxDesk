import { TelnyxProvider } from '@/lib/telephony/providers/telnyx';

async function main() {
  const telnyx = new TelnyxProvider();

  const toNumber = process.env.TELNYX_TEST_NUMBER || process.argv[2];
  const fromNumber = process.env.TELNYX_PRIMARY_PHONE_NUMBER || process.env.TELNYX_CALLER_ID;

  if (!toNumber || !fromNumber) {
    console.error('Usage: npm run telnyx:test:outbound <to_number>');
    console.error(
      'Requires TELNYX_PRIMARY_PHONE_NUMBER and TELNYX_TEST_NUMBER environment variables'
    );
    process.exit(1);
  }

  console.log('[TEST OUTBOUND] Initiating outbound call via Telnyx...');
  console.log('To:', toNumber);
  console.log('From:', fromNumber);

  const callRecord = await telnyx.startCall({
    workspaceId: process.env.WORKSPACE_ID || 'test_workspace',
    businessId: process.env.BUSINESS_ID || 'test_business',
    agentId: process.env.ELEVENLABS_AGENT_ID_LEGAL_EN || 'test_agent',
    agentVersionId: 'v1',
    callerNumber: toNumber,
    direction: 'OUTBOUND',
    channel: 'PHONE',
    language: 'en-US',
    trainingPackVersion: 1,
  });

  console.log('\n[CALL RECORD]');
  console.log('Provider Call Control ID:', callRecord.providerCallControlId);
  console.log('Session ID:', callRecord.providerCallSessionId);
  console.log('Leg ID:', callRecord.providerCallLegId);
  console.log('Direction:', callRecord.direction);
  console.log('Status:', callRecord.status);

  console.log('\n[TEST] Waiting for call to complete (max 60s)...');
  let completed = false;
  const maxWait = 60000;
  const startTime = Date.now();

  while (!completed && Date.now() - startTime < maxWait) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    const call = await telnyx.getCall(callRecord.providerCallControlId);
    if (call) {
      console.log(`[STATUS] ${call.status} (${Date.now() - startTime}ms)`);
      if (['COMPLETED', 'BUSY', 'NO_ANSWER', 'VOICEMAIL', 'FAILED'].includes(call.status)) {
        completed = true;
        console.log('\n[CALL COMPLETED]');
        console.log('Final Status:', call.status);
        console.log('Duration:', call.durationSeconds, 'seconds');
      }
    }
  }

  if (!completed) {
    console.log('\n[TEST] TIMEOUT - Call did not complete within 60s');
    await telnyx.endCall(callRecord.providerCallControlId);
    process.exit(1);
  }

  console.log('\n[TEST] PASSED - Outbound call completed');
}

main().catch(error => {
  console.error('[TEST ERROR]', error);
  process.exit(1);
});
