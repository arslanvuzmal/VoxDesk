import Link from 'next/link';
import { Navbar } from '@/components/ui/navbar';
import { Footer } from '@/components/ui/footer';
import { Shield, Lock, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy — VoxDesk',
  description:
    'Privacy Policy and data processing disclosures for VoxDesk Voice Operations Platform.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A]">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto p-6 py-12 space-y-8">
        <div className="space-y-3">
          <Link
            href="/"
            className="text-xs text-[#64748B] hover:text-[#0F172A] flex items-center gap-1 transition-colors mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Home
          </Link>
          <div className="flex items-center gap-2 text-[#1D4ED8]">
            <Shield className="w-5 h-5" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Legal Disclosure & Privacy Policy
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">
            VoxDesk Privacy Policy
          </h1>
          <p className="text-xs font-mono text-[#64748B]">
            Effective Date: August 3, 2026 • Environment: Interactive Platform Demo
          </p>
        </div>

        {/* Important Notice */}
        <div className="p-4 rounded-lg bg-white border border-[#CBD5E1] text-xs space-y-2 text-[#334155] shadow-sm">
          <div className="flex items-center gap-2 font-bold text-[#B45309]">
            <Lock className="w-4 h-4" />
            <span>Fictional Business Demonstration Disclosure</span>
          </div>
          <p className="leading-relaxed">
            The public demonstration of VoxDesk uses fictional business data (&quot;Northstar Legal
            Consultations&quot;). Visitors should not provide confidential, sensitive, medical,
            legal, or financial information during voice or text interactions.
          </p>
        </div>

        <div className="space-y-6 text-xs text-[#334155] leading-relaxed">
          <section className="space-y-2 bg-white p-6 rounded-xl border border-[#E2E8F0] shadow-sm">
            <h2 className="text-sm font-bold text-[#0F172A]">
              1. Information Processed During Voice Demonstration
            </h2>
            <p>
              When participating in the interactive voice sandbox, VoxDesk processes microphone
              audio in your web browser for real-time Speech-to-Text transcription. Speech data is
              processed transiently over WebRTC token sessions for demonstration purposes.
            </p>
          </section>

          <section className="space-y-2 bg-white p-6 rounded-xl border border-[#E2E8F0] shadow-sm">
            <h2 className="text-sm font-bold text-[#0F172A]">
              2. Data Protection & Security Controls
            </h2>
            <p>
              VoxDesk implements server-authorized token sessions, role-based workspace access, and
              encrypted transport protocols (HTTPS/WSS) for platform operations.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
