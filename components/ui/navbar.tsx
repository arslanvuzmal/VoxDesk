'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Menu, X } from 'lucide-react';

const navigation = [
  { href: '/platform', label: 'Platform' },
  { href: '/operations', label: 'Operations' },
  { href: '/demo', label: 'Demo' },
  { href: '/dashboard', label: 'Dashboard' },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-white/[0.08] bg-[#08090B]/95 px-4 backdrop-blur-sm sm:px-6">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5" aria-label="VoxDesk home">
          <div className="flex h-8 w-8 items-center justify-center bg-[#78AFFF] text-sm font-semibold text-[#08090B]">
            V
          </div>
          <div>
            <span className="text-base font-semibold tracking-tight text-[#F4F5F7]">VoxDesk</span>
            <span className="-mt-1 block text-[11px] font-medium text-[#737C88]">
              AI Customer Operations
            </span>
          </div>
        </Link>

        <nav
          className="hidden items-center gap-8 text-sm font-medium text-[#A1A8B3] md:flex"
          aria-label="Primary navigation"
        >
          {navigation.map(item => (
            <Link key={item.href} href={item.href} className="transition-colors hover:text-[#F4F5F7]">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="px-3 py-2 text-sm font-medium text-[#A1A8B3] transition-colors hover:text-[#F4F5F7]"
          >
            Sign in
          </Link>
          <Link
            href="/demo"
            className="flex min-h-10 items-center gap-2 rounded-md bg-[#78AFFF] px-4 py-2 text-sm font-medium text-[#08090B] transition-colors hover:bg-[#91BEFF]"
          >
            Open demo <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <button
          type="button"
          aria-label={mobileMenuOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="min-h-11 min-w-11 p-2 text-[#A1A8B3] hover:bg-white/[0.05] hover:text-[#F4F5F7] md:hidden"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="absolute left-0 right-0 top-16 border-b border-white/[0.08] bg-[#0D0F12] p-6 md:hidden">
          <nav className="flex flex-col text-sm font-medium text-[#A1A8B3]" aria-label="Mobile navigation">
            {navigation.map(item => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="min-h-11 py-3 hover:text-[#F4F5F7]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-2 border-t border-white/[0.08] pt-4">
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
              className="min-h-11 w-full rounded-md bg-[#78AFFF] py-3 text-center text-sm font-medium text-[#08090B]"
            >
              Open demo
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
