'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Menu, X, PhoneCall } from 'lucide-react';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#E2E8F0] px-6 h-16 flex items-center justify-between shadow-sm">
      <div className="max-w-7xl w-full mx-auto flex items-center justify-between">
        {/* Brand Logo & Wordmark */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#1D4ED8] flex items-center justify-center font-bold text-white text-sm shadow-sm">
            V
          </div>
          <div>
            <span className="text-base font-bold text-[#0F172A] tracking-tight">VoxDesk</span>
            <span className="text-[11px] text-[#64748B] block -mt-1 font-medium">
              Voice Operations Platform
            </span>
          </div>
        </Link>

        {/* Primary Desktop Navigation (Max 5 items) */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#475569]">
          <Link href="/#product" className="hover:text-[#1D4ED8] transition-colors">
            Product
          </Link>
          <Link href="/#solutions" className="hover:text-[#1D4ED8] transition-colors">
            Solutions
          </Link>
          <Link href="/#integrations" className="hover:text-[#1D4ED8] transition-colors">
            Integrations
          </Link>
          <Link href="/#enterprise" className="hover:text-[#1D4ED8] transition-colors">
            Enterprise
          </Link>
          <Link
            href="/demo"
            className="hover:text-[#1D4ED8] transition-colors font-semibold text-[#1D4ED8]"
          >
            Demo
          </Link>
        </nav>

        {/* Right-Side Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-[#475569] hover:text-[#0F172A] px-3 py-1.5 transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/demo"
            className="bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-semibold text-sm px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Try live demo</span>
          </Link>
        </div>

        {/* Mobile Toggle Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-md text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9]"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-[#E2E8F0] p-6 space-y-4 shadow-lg">
          <nav className="flex flex-col space-y-3 text-sm font-medium text-[#475569]">
            <Link
              href="/#product"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-[#1D4ED8] py-1"
            >
              Product
            </Link>
            <Link
              href="/#solutions"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-[#1D4ED8] py-1"
            >
              Solutions
            </Link>
            <Link
              href="/#integrations"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-[#1D4ED8] py-1"
            >
              Integrations
            </Link>
            <Link
              href="/#enterprise"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-[#1D4ED8] py-1"
            >
              Enterprise
            </Link>
            <Link
              href="/demo"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-[#1D4ED8] py-1 font-semibold text-[#1D4ED8]"
            >
              Demo
            </Link>
          </nav>
          <div className="pt-4 border-t border-[#E2E8F0] flex flex-col gap-2">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2 text-sm font-medium text-[#475569]"
            >
              Sign in
            </Link>
            <Link
              href="/demo"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 bg-[#1D4ED8] text-white font-semibold text-sm rounded-lg"
            >
              Try live demo
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
