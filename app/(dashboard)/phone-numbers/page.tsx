import { Phone, CheckCircle2 } from "lucide-react";

export default function PhoneNumbersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Virtual Phone Numbers</h1>
        <p className="text-sm text-gray-400">Assigned inbound virtual phone numbers routing calls to voice agents.</p>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
        <div className="p-4 rounded-xl bg-gray-950 border border-gray-900 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-teal-400" />
            <div>
              <h4 className="text-sm font-bold text-white">+1 (555) 019-2834</h4>
              <p className="text-gray-400 mt-0.5">Assigned Agent: <strong className="text-teal-300">Maya — Reception & Appointments</strong></p>
            </div>
          </div>

          <span className="px-3 py-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold font-mono">
            ACTIVE DEMO NUMBER
          </span>
        </div>
      </div>
    </div>
  );
}
