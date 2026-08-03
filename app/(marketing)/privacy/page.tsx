import Link from "next/link";
import { Navbar } from "@/components/ui/navbar";
import { Shield, Lock, FileText, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy — VoxDesk AI",
  description:
    "Privacy Policy and data processing disclosures for the VoxDesk AI portfolio demonstration.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0B0D10] text-[#F4F4F5]">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto p-6 py-12 space-y-8">
        <div className="space-y-3">
          <Link
            href="/"
            className="text-xs text-[#8B949E] hover:text-white flex items-center gap-1 transition-colors mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Home
          </Link>
          <div className="flex items-center gap-2 text-[#2DD4BF]">
            <Shield className="w-5 h-5" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider">
              Legal Disclosure & Privacy Policy
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            VoxDesk AI Privacy Policy
          </h1>
          <p className="text-xs font-mono text-[#8B949E]">
            Effective Date: August 3, 2026 • Environment: Public Portfolio Demo
          </p>
        </div>

        {/* Important Notice */}
        <div className="p-4 rounded-lg bg-[#171C22] border border-[#272D35] text-xs space-y-2 text-[#D4D4D8]">
          <div className="flex items-center gap-2 font-bold text-amber-400">
            <Lock className="w-4 h-4" />
            <span>Fictional Business Disclosure</span>
          </div>
          <p className="leading-relaxed">
            The public demonstration of VoxDesk AI uses fictional business data
            (&quot;Northstar Legal Consultations&quot;). Visitors should not
            provide confidential, sensitive, medical, legal, or financial
            information during voice or text interactions.
          </p>
        </div>

        <div className="space-y-8 text-xs text-[#D4D4D8] leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-white tracking-tight">
              1. Information Processed During Voice Demonstration
            </h2>
            <p>
              When participating in the interactive voice sandbox, VoxDesk AI
              processes microphone audio directly in your web browser for
              real-time Speech-to-Text (STT) transcription. Raw microphone audio
              streams are processed in memory and are not permanently recorded
              or stored by VoxDesk servers.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white tracking-tight">
              2. Transcript & Session Data Retention
            </h2>
            <p>
              Text transcripts generated during a demo session are stored
              temporarily in a secure serverless session store for up to 180
              seconds to maintain conversational state. Once a call is completed
              or expired, temporary session data is automatically deleted.
              Completed call summaries and demo database records are isolated
              per session.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white tracking-tight">
              3. IP Hashing & Abuse Prevention
            </h2>
            <p>
              To prevent denial-of-service attacks and quota exhaustion, client
              IP addresses are salted and hashed (`SHA-256`) on the server. Raw
              IP addresses are never persisted in plaintext logs or database
              models.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white tracking-tight">
              4. Third-Party Provider Data Processing
            </h2>
            <p>
              VoxDesk AI utilizes third-party infrastructure providers for
              specific capabilities:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-[#8B949E]">
              <li>
                <strong className="text-white">OpenRouter AI:</strong>{" "}
                Server-side model inference with restricted output token limits.
              </li>
              <li>
                <strong className="text-white">ElevenLabs:</strong> Ephemeral
                token-based Speech-to-Text and Text-to-Speech synthesis.
              </li>
              <li>
                <strong className="text-white">Upstash Redis:</strong>{" "}
                Encrypted, serverless session persistence.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white tracking-tight">
              5. User Data Deletion Rights
            </h2>
            <p>
              Visitors can instantly delete all temporary call logs,
              transcripts, and demo CRM records associated with their session by
              clicking the{" "}
              <strong className="text-white">
                &quot;Delete Demo Data&quot;
              </strong>{" "}
              button upon ending a call, or by visiting the demo console.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white tracking-tight">
              6. Contact & Portfolio Inquiries
            </h2>
            <p>
              This application was built and maintained by{" "}
              <strong className="text-white">Arslan Vuzmal Lone</strong> as a
              production-grade AI Voice Agent demonstration. For custom voice
              agent deployment inquiries, contact through the official GitHub
              repository or Fiverr profile.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
