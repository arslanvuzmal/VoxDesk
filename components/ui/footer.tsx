import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-white border-t border-[#E2E8F0] text-xs text-[#64748B] py-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Col 1: Brand */}
        <div className="space-y-3 md:col-span-1">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#1D4ED8] text-white font-bold text-xs flex items-center justify-center">
              V
            </div>
            <span className="text-sm font-bold text-[#0F172A] tracking-tight">
              VoxDesk
            </span>
          </div>
          <p className="text-[11px] text-[#64748B] leading-relaxed">
            Voice Operations Platform for business call automation, intake qualification, appointment scheduling, and CRM workflows.
          </p>
          <p className="text-[10px] text-[#94A3B8] font-mono">
            Owner: Arslan Vuzmal Lone
          </p>
        </div>

        {/* Col 2: Product */}
        <div className="space-y-2">
          <h4 className="font-bold text-[#0F172A] uppercase tracking-wider text-[11px]">
            Product
          </h4>
          <ul className="space-y-1.5 text-[11px]">
            <li>
              <Link
                href="/#product"
                className="hover:text-[#1D4ED8] transition-colors"
              >
                Overview
              </Link>
            </li>
            <li>
              <Link
                href="/demo"
                className="hover:text-[#1D4ED8] transition-colors"
              >
                Interactive Voice Demo
              </Link>
            </li>
            <li>
              <Link
                href="/#integrations"
                className="hover:text-[#1D4ED8] transition-colors"
              >
                System Integrations
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Solutions */}
        <div className="space-y-2">
          <h4 className="font-bold text-[#0F172A] uppercase tracking-wider text-[11px]">
            Solutions
          </h4>
          <ul className="space-y-1.5 text-[11px]">
            <li>
              <Link
                href="/#inbound"
                className="hover:text-[#1D4ED8] transition-colors"
              >
                Inbound Calls
              </Link>
            </li>
            <li>
              <Link
                href="/#outbound"
                className="hover:text-[#1D4ED8] transition-colors"
              >
                Outbound Workflows
              </Link>
            </li>
            <li>
              <Link
                href="/#website"
                className="hover:text-[#1D4ED8] transition-colors"
              >
                Website Voice
              </Link>
            </li>
            <li>
              <Link
                href="/#solutions"
                className="hover:text-[#1D4ED8] transition-colors"
              >
                Appointment Handling
              </Link>
            </li>
            <li>
              <Link
                href="/#solutions"
                className="hover:text-[#1D4ED8] transition-colors"
              >
                Lead Qualification
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 4: Company & System */}
        <div className="space-y-2">
          <h4 className="font-bold text-[#0F172A] uppercase tracking-wider text-[11px]">
            System & Legal
          </h4>
          <ul className="space-y-1.5 text-[11px]">
            <li>
              <Link href="/docs" className="hover:text-[#1D4ED8] transition-colors">
                Documentation
              </Link>
            </li>
            <li>
              <Link
                href="/privacy"
                className="hover:text-[#1D4ED8] transition-colors"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                href="/terms"
                className="hover:text-[#1D4ED8] transition-colors"
              >
                Terms of Service
              </Link>
            </li>
            <li>
              <a
                href="https://github.com/arslanvuzmal/voxdesk-ai"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#1D4ED8] transition-colors"
              >
                GitHub Repository
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px]">
        <p>
          © 2026 VoxDesk. All rights reserved. Interactive demonstration platform.
        </p>
        <p className="font-mono text-[#94A3B8]">Built by Arslan Vuzmal Lone</p>
      </div>
    </footer>
  );
}
