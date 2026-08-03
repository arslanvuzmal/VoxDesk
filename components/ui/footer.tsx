import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[#0A0C0E] border-t border-[#272D35] text-xs text-[#8B949E] py-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Col 1: Brand */}
        <div className="space-y-3 md:col-span-1">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#2DD4BF] text-[#0B0D10] font-bold text-xs flex items-center justify-center">
              V
            </div>
            <span className="text-sm font-bold text-white tracking-tight">
              VoxDesk AI
            </span>
          </div>
          <p className="text-[11px] text-[#8B949E] leading-relaxed">
            Production-oriented AI Voice Agent SaaS Platform for inbound call
            automation, scheduling, lead qualification, and CRM activities.
          </p>
          <p className="text-[10px] text-[#8B949E] font-mono">
            Owner: Arslan Vuzmal Lone
          </p>
        </div>

        {/* Col 2: Product */}
        <div className="space-y-2">
          <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
            Product
          </h4>
          <ul className="space-y-1.5 text-[11px]">
            <li>
              <Link
                href="/features"
                className="hover:text-white transition-colors"
              >
                Features
              </Link>
            </li>
            <li>
              <Link
                href="/industries"
                className="hover:text-white transition-colors"
              >
                Industries
              </Link>
            </li>
            <li>
              <Link
                href="/architecture"
                className="hover:text-white transition-colors"
              >
                Architecture
              </Link>
            </li>
            <li>
              <Link
                href="/demo"
                className="hover:text-[#2DD4BF] transition-colors"
              >
                Interactive Voice Sandbox
              </Link>
            </li>
            <li>
              <Link
                href="/demo/story"
                className="hover:text-[#2DD4BF] transition-colors"
              >
                Guided Call Story
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Resources & System */}
        <div className="space-y-2">
          <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
            Resources & System
          </h4>
          <ul className="space-y-1.5 text-[11px]">
            <li>
              <Link href="/docs" className="hover:text-white transition-colors">
                Documentation
              </Link>
            </li>
            <li>
              <Link
                href="/status"
                className="hover:text-white transition-colors"
              >
                System Status
              </Link>
            </li>
            <li>
              <a
                href="https://github.com/arslanvuzmal/voxdesk-ai"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition-colors"
              >
                GitHub Repository
              </a>
            </li>
            <li>
              <Link
                href="/login"
                className="hover:text-white transition-colors"
              >
                Sign In
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 4: Legal */}
        <div className="space-y-2">
          <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
            Legal Disclosures
          </h4>
          <ul className="space-y-1.5 text-[11px]">
            <li>
              <Link
                href="/privacy"
                className="hover:text-white transition-colors"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                href="/terms"
                className="hover:text-white transition-colors"
              >
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-[#1C2127] flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px]">
        <p>
          © 2026 VoxDesk AI. All rights reserved. Fictional business
          demonstration.
        </p>
        <p className="font-mono text-[#8B949E]">Built by Arslan Vuzmal Lone</p>
      </div>
    </footer>
  );
}
