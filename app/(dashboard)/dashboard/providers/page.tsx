import { TelephonyCapabilityPanel } from '@/components/telephony/capability-panel';
import { getTelephonyCapabilityMatrix } from '@/lib/telephony/capability-matrix';

export const dynamic = 'force-dynamic';

export default function ProvidersPage() {
  const matrix = getTelephonyCapabilityMatrix();
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
          Configuration
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Providers</h1>
        <p className="mt-1 text-sm text-slate-600">
          Implemented provider architecture and activation status.
        </p>
      </header>
      <TelephonyCapabilityPanel
        mode={matrix.mode.toUpperCase()}
        readiness={matrix.readiness}
        simulation={matrix.simulation}
        livePstn={matrix.livePstn}
        activationRequirements={matrix.activationRequirements}
      />
    </div>
  );
}
