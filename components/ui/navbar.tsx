'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, PhoneCall } from 'lucide-react';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-white/[0.08] bg-[#08090B]/95 px-4 backdrop-blur-sm sm:px-6">
      <div className="max-w-7xl w-full mx-auto flex items-center justify-between">
        {/* Brand Logo & Wordmark */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center bg-[#78AFFF] text-sm font-semibold text-[#08090B]">
            V
          </div>
          <div>
            <span className="text-base font-semibold tracking-tight text-[#F4F5F7]">VoxDesk</span>
            <span className="-mt-1 block text-[11px] font-medium text-[#737C88]">
              Voice Operations Platform
            </span>
          </div>
        </Link>

        {/* Primary Desktop Navigation (Max 5 items) */}
        <nav className="hidden items-center gap-8 text-sm font-medium text-[#A1A8B3] md:flex">
          <Link href="/#product" className="transition-colors hover:text-[#F4F5F7]">
            Product
          </Link>
          <Link href="/#solutions" className="transition-colors hover:text-[#F4F5F7]">
            Solutions
          </Link>
          <Link href="/#integrations" className="transition-colors hover:text-[#F4F5F7]">
            Integrations
          </Link>
          <Link href="/#enterprise" className="transition-colors hover:text-[#F4F5F7]">
            Enterprise
          </Link>
          <Link
            href="/demo"
            className="font-medium text-[#78AFFF] transition-colors hover:text-[#91BEFF]"
          >
            Demo
          </Link>
        </nav>

        {/* Right-Side Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/login"
            className="px-3 py-1.5 text-sm font-medium text-[#A1A8B3] transition-colors hover:text-[#F4F5F7]"
          >
            Sign in
          </Link>
          <Link
            href="/demo"
            className="flex min-h-10 items-center gap-1.5 bg-[#78AFFF] px-4 py-2 text-sm font-medium text-[#08090B] transition-colors hover:bg-[#91BEFF]"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Try live demo</span>
          </Link>
        </div>

        {/* Mobile Toggle Button */}
        <button
          type="button"
          aria-label={mobileMenuOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="min-h-11 min-w-11 p-2 text-[#A1A8B3] hover:bg-white/[0.05] hover:text-[#F4F5F7] md:hidden"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="absolute left-0 right-0 top-16 space-y-4 border-b border-white/[0.08] bg-[#0D0F12] p-6 md:hidden">
          <nav className="flex flex-col space-y-3 text-sm font-medium text-[#A1A8B3]">
            <Link
              href="/#product"
              onClick={() => setMobileMenuOpen(false)}
              className="min-h-11 py-3 hover:text-[#F4F5F7]"
            >
              Product
            </Link>
            <Link
              href="/#solutions"
              onClick={() => setMobileMenuOpen(false)}
              className="min-h-11 py-3 hover:text-[#F4F5F7]"
            >
              Solutions
            </Link>
            <Link
              href="/#integrations"
              onClick={() => setMobileMenuOpen(false)}
              className="min-h-11 py-3 hover:text-[#F4F5F7]"
            >
              Integrations
            </Link>
            <Link
              href="/#enterprise"
              onClick={() => setMobileMenuOpen(false)}
              className="min-h-11 py-3 hover:text-[#F4F5F7]"
            >
              Enterprise
            </Link>
            <Link
              href="/demo"
              onClick={() => setMobileMenuOpen(false)}
              className="min-h-11 py-3 font-medium text-[#78AFFF]"
            >
              Demo
            </Link>
          </nav>
          <div className="flex flex-col gap-2 border-t border-white/[0.08] pt-4">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="min-h-11 w-full py-3 text-center text-sm font-medium text-[#A1A8B3]"
            >
              Sign in
            </Link>
            <Link
              href="/demo"
              onClick={() => setMobileMenuOpen(false)}
              className="min-h-11 w-full bg-[#78AFFF] py-3 text-center text-sm font-medium text-[#08090B]"
            >
              Try live demo
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

