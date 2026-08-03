import { Sidebar } from "@/components/ui/sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-navy-950">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto max-w-7xl mx-auto">{children}</main>
    </div>
  );
}
