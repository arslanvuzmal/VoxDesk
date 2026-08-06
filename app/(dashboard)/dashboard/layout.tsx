import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { validateSession } from "@/lib/auth";
import { Sidebar } from "@/components/ui/sidebar";
import Link from "next/link";
import { Search, Radio, PhoneCall, ShieldCheck, HelpCircle, Bell } from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("voxdesk_session")?.value;
  const user = await validateSession(token || "");

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-[#0D1117] text-[#C9D1D9] font-sans antialiased">
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Enterprise Utility Bar */}
        <header className="h-13 bg-[#161B22] border-b border-[#30363D] px-6 flex items-center justify-between gap-4 sticky top-0 z-20 shrink-0">
          {/* Left: Global Search & Breadcrumb context */}
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="relative w-full max-w-md">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8B949E]" />
              <input
                type="text"
                placeholder="Search leads, phone numbers, transcripts... (Ctrl+K)"
                className="w-full bg-[#0D1117] border border-[#30363D] rounded-md pl-9 pr-3 py-1.5 text-xs text-white placeholder-[#6E7681] focus:outline-none focus:border-[#58A6FF] transition-colors"
                readOnly
              />
            </div>
          </div>

          {/* Right: Operational Status & Actions */}
          <div className="flex items-center gap-3 shrink-0 text-xs">
            <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#0D1117] border border-[#30363D] text-[11px] font-mono">
              <span className="w-2 h-2 rounded-full bg-[#3FB950] animate-pulse" />
              <span className="text-[#8B949E]">Voice Pipeline:</span>
              <span className="text-white font-semibold">WebRTC Active</span>
            </div>

            <Link
              href="/demo"
              className="bg-[#238636] hover:bg-[#2ea043] text-white font-medium text-xs px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Launch Live Call Demo</span>
            </Link>

            <div className="w-px h-4 bg-[#30363D]" />

            <button
              type="button"
              className="p-1.5 rounded-md hover:bg-[#21262D] text-[#8B949E] hover:text-white transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="p-1.5 rounded-md hover:bg-[#21262D] text-[#8B949E] hover:text-white transition-colors"
              title="Help & Documentation"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
