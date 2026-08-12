import { Navbar } from '@/components/ui/navbar';
import { ShieldCheck, Lock, Database, Server, Cpu, Key } from 'lucide-react';

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
            VoxDesk AI is built for strict multi-tenant isolation, AES-256 encryption, HMAC
            signature verification, and zero credential leakage.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
            <Lock className="w-8 h-8 text-teal-400" />
            <h3 className="text-lg font-bold text-white">AES-256-GCM Encryption</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              All stored telephony credentials, provider tokens, and customer phone numbers are
              encrypted at rest using AES-256-GCM authenticated encryption.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-2xl border border-gray-800 space-y-4">
            <ShieldCheck className="w-8 h-8 text-electric-400" />
            <h3 className="text-lg font-bold text-white">Multi-Tenant Isolation</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Every database query is enforced with a mandatory workspaceId scoping filter. RBAC
              permissions ensure cross-workspace data access is strictly prevented.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-2xl border border-gray-800 space-y-4">
            <Key className="w-8 h-8 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">Webhook HMAC Signature Verification</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Telnyx and ElevenLabs webhooks require provider-specific signature, timestamp, and replay verification
              verification and timestamp replay protection.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
