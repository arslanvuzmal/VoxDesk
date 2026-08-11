import { getTelephonyCapabilityMatrix } from '@/lib/telephony/capability-matrix';

export const dynamic = 'force-dynamic';

export default function PhoneNumbersPage() {
  const matrix = getTelephonyCapabilityMatrix();
  return (
    <div className="max-w-3xl space-y-6">
      <header>
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">Telephony</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Phone numbers</h1>
      </header>
      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate-950">
          Production phone number not activated
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          VoxDesk supports Telnyx-backed PSTN numbers. The public portfolio uses deterministic
          simulation, so no carrier number is purchased or dialed here.
        </p>
        <ol className="mt-5 space-y-3 text-sm text-slate-700">
          <li>1. Telnyx Voice API application and connection ID</li>
          <li>2. Customer-owned or provisioned Telnyx number</li>
          <li>3. Outbound voice profile and caller ID</li>
          <li>4. ElevenLabs SIP phone import and agent assignment</li>
          <li>5. Signed webhook verification and readiness test</li>
        </ol>
        <p className="mt-5 border-t border-slate-100 pt-4 text-xs text-slate-500">
          Current status: {matrix.livePstn.status.replaceAll('_', ' ')}. {matrix.livePstn.reason}
        </p>
      </section>
    </div>
  );
}
