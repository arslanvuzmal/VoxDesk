import { Navbar } from '@/components/ui/navbar';
import { ShieldCheck, Lock, Key } from 'lucide-react';

export default function ArchitecturePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-16 space-y-12">
        <div className="text-center space-y-4">
          <span className="px-3 py-1 rounded-full bg-teal-950 text-teal-400 border border-teal-800/60 font-mono text-xs font-semibold">
            SYSTEM ARCHITECTURE & SECURITY
          </span>
          <h1 className="text-4xl font-extrabold text-white">
            Technical Architecture & Security Controls
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm">
            VoxDesk is designed around tenant-scoped authorization, protected sensitive fields,
            signed provider events, and server-owned business tools.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
            <Lock className="w-8 h-8 text-teal-400" />
            <h3 className="text-lg font-bold text-white">Sensitive Data Protection</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Configured credential and identifier paths use authenticated encryption, keyed lookup
              hashes, masked display values, and metadata-only logging controls.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-2xl border border-gray-800 space-y-4">
            <ShieldCheck className="w-8 h-8 text-electric-400" />
            <h3 className="text-lg font-bold text-white">Tenant-Scoped Authorization</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Protected operations resolve the authenticated session, workspace membership,
              permission, and tenant-scoped resource before returning or mutating business data.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-2xl border border-gray-800 space-y-4">
            <Key className="w-8 h-8 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">Signed Provider Webhooks</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Telnyx and ElevenLabs endpoints use provider-specific signature validation, timestamp
              freshness checks, replay protection, and idempotent event handling.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
