"use client";

import Link from "next/link";
import { ArrowRight, Activity } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-[#0B0D10]/90 border-b border-[#272D35] px-6 py-3.5 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#2DD4BF] flex items-center justify-center font-bold text-[#0B0D10] text-sm">
            V
          </div>
          <div>
            <span className="text-base font-bold text-[#F4F4F5] tracking-tight">VoxDesk AI</span>
            <span className="text-[11px] text-[#8B949E] block -mt-1 font-medium">Voice Operations Workspace</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#D4D4D8]">
          <Link href="/features" className="hover:text-[#2DD4BF] transition-colors">Features</Link>
          <Link href="/industries" className="hover:text-[#2DD4BF] transition-colors">Industries</Link>
          <Link href="/architecture" className="hover:text-[#2DD4BF] transition-colors">Architecture</Link>
          <Link href="/demo/story" className="hover:text-[#2DD4BF] transition-colors">Call Story</Link>
          <Link href="/docs" className="hover:text-[#2DD4BF] transition-colors">Docs</Link>
          <Link href="/status" className="hover:text-[#2DD4BF] transition-colors text-xs font-mono text-[#8B949E]">
            System status
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-[#D4D4D8] hover:text-white px-3 py-1.5 transition-colors">
            Sign in
          </Link>
          <Link
            href="/demo"
            className="bg-[#2DD4BF] hover:bg-[#26b8a5] text-[#0B0D10] font-semibold text-sm px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <span>Explore Demo</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
