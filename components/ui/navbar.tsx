"use client";

import Link from "next/link";
import { Mic, ShieldCheck, Play, ArrowRight, Activity } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-gray-800/80 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-electric-600 flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform">
            <Mic className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold text-white tracking-tight flex items-center gap-1.5">
              VOXDESK <span className="text-teal-400 font-mono text-sm font-semibold px-2 py-0.5 rounded bg-teal-950/60 border border-teal-800/50">AI</span>
            </span>
            <span className="text-xs text-gray-400 block -mt-1 font-medium">Voice Receptionist & Call Automation</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
          <Link href="/features" className="hover:text-teal-400 transition-colors">Features</Link>
          <Link href="/industries" className="hover:text-teal-400 transition-colors">Industries</Link>
          <Link href="/architecture" className="hover:text-teal-400 transition-colors">Architecture</Link>
          <Link href="/demo/story" className="hover:text-teal-400 transition-colors flex items-center gap-1">
            <Play className="w-3.5 h-3.5 text-teal-400 fill-teal-400" />
            Guided Story
          </Link>
          <Link href="/docs" className="hover:text-teal-400 transition-colors">Docs</Link>
          <Link href="/status" className="hover:text-teal-400 transition-colors flex items-center gap-1 text-xs font-mono px-2.5 py-1 rounded-full bg-emerald-950/50 text-emerald-400 border border-emerald-800/40">
            <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
            Providers Operational
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-gray-300 hover:text-white px-3 py-2 transition-colors">
            Sign In
          </Link>
          <Link href="/demo" className="bg-gradient-to-r from-teal-500 to-electric-600 hover:from-teal-600 hover:to-electric-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-lg shadow-teal-500/25 flex items-center gap-2 transition-all">
            <span>Try Live Demo</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
