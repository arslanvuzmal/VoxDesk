import { TelnyxProvider } from '@/lib/telephony/providers/telnyx';

async function main() {
  const telnyx = new TelnyxProvider();

  const testNumber = process.env.TELNYX_TEST_NUMBER || process.argv[2];
  const fromNumber = process.env.TELNYX_FROM_NUMBER || '+15550000001';

  if (!testNumber) {
    console.error('Usage: npm run telnyx:test:inbound <test_phone_number>');
    console.error('Or set TELNYX_TEST_NUMBER environment variable');
    process.exit(1);
  }

  console.log('[TEST INBOUND] Simulating inbound call to Telnyx number...');
  console.log('Test number:', testNumber);
  console.log('From number:', fromNumber);

  const mockWebhook = {
    data: {
      event_type: 'call.initiated',
      payload: {
        call_control_id: `test_${Date.now()}`,
        call_session_id: `session_${Date.now()}`,
        call_leg_id: `leg_${Date.now()}`,
        connection_id: process.env.TELNYX_CONNECTION_ID || 'conn_test',
        from: fromNumber,
        to: testNumber,
        state: 'initiated',
        direction: 'incoming',
      },
    },
    meta: { attempt: 1, delivered_to: 'webhook' },
  };

  console.log('\n[TEST] Sending mock webhook payload:');
  console.log(JSON.stringify(mockWebhook, null, 2));

  const response = await fetch(
    `${process.env.APP_URL || 'http://localhost:3000'}/api/webhooks/telnyx/voice`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'telnyx-signature-ed25519': 'test_signature',
        'telnyx-timestamp': Math.floor(Date.now() / 1000).toString(),
      },
      body: JSON.stringify(mockWebhook),
    }
  );

  const result = await response.json();
  console.log('\n[TEST RESULT]', result);

  if (response.ok) {
    console.log('\n[TEST] PASSED - Webhook processed successfully');
  } else {
    console.error('\n[TEST] FAILED');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('[TEST ERROR]', error);
  process.exit(1);
});
