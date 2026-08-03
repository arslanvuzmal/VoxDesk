import Link from "next/link";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { FileQuestion, Home, Mic, LogIn, LayoutDashboard } from "lucide-react";

export const metadata = {
  title: "Page Not Found (404) — VoxDesk AI",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0B0D10] text-[#F4F4F5]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-6 py-16">
        <div className="max-w-md w-full bg-[#13171C] border border-[#272D35] p-8 rounded-xl text-center space-y-6">
          <div className="w-12 h-12 rounded-full bg-[#2DD4BF]/10 border border-[#2DD4BF]/20 text-[#2DD4BF] flex items-center justify-center mx-auto">
            <FileQuestion className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono text-[#2DD4BF] font-bold uppercase">
              Error 404
            </span>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Page not found
            </h1>
            <p className="text-xs text-[#8B949E] leading-relaxed">
              The page may have moved, or the link may be outdated.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 text-xs font-medium">
            <Link
              href="/"
              className="p-2.5 rounded-lg bg-[#171C22] hover:bg-[#202730] text-white border border-[#272D35] flex items-center justify-center gap-1.5 transition-colors"
            >
              <Home className="w-3.5 h-3.5 text-[#2DD4BF]" />
              <span>Return Home</span>
            </Link>

            <Link
              href="/demo"
              className="p-2.5 rounded-lg bg-[#2DD4BF] hover:bg-[#26b8a5] text-[#0B0D10] font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Explore Demo</span>
            </Link>

            <Link
              href="/login"
              className="p-2.5 rounded-lg bg-[#171C22] hover:bg-[#202730] text-[#D4D4D8] border border-[#272D35] flex items-center justify-center gap-1.5 transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>

            <Link
              href="/dashboard"
              className="p-2.5 rounded-lg bg-[#171C22] hover:bg-[#202730] text-[#D4D4D8] border border-[#272D35] flex items-center justify-center gap-1.5 transition-colors"
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
