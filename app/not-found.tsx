import Link from "next/link";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { FileQuestion, Home, PhoneCall, LogIn, LayoutDashboard } from "lucide-react";

export const metadata = {
  title: "Page Not Found (404) — VoxDesk",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-6 py-16">
        <div className="max-w-md w-full bg-white border border-[#E2E8F0] p-8 rounded-xl text-center space-y-6 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-[#EFF6FF] text-[#1D4ED8] border border-[#1D4ED8]/20 flex items-center justify-center mx-auto">
            <FileQuestion className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono text-[#1D4ED8] font-bold uppercase">
              Error 404
            </span>
            <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">
              Page not found
            </h1>
            <p className="text-xs text-[#64748B] leading-relaxed">
              The page may have moved, or the URL might be outdated.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 text-xs font-medium">
            <Link
              href="/"
              className="p-2.5 rounded-lg bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#0F172A] border border-[#E2E8F0] flex items-center justify-center gap-1.5 transition-colors"
            >
              <Home className="w-3.5 h-3.5 text-[#1D4ED8]" />
              <span>Return Home</span>
            </Link>

            <Link
              href="/demo"
              className="p-2.5 rounded-lg bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Explore Demo</span>
            </Link>

            <Link
              href="/login"
              className="p-2.5 rounded-lg bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0] flex items-center justify-center gap-1.5 transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>

            <Link
              href="/dashboard"
              className="p-2.5 rounded-lg bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0] flex items-center justify-center gap-1.5 transition-colors"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
