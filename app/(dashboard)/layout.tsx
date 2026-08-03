import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { validateSession } from "@/lib/auth";
import { Sidebar } from "@/components/ui/sidebar";

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
    <div className="flex min-h-screen bg-[#0B0D10]">
      <Sidebar user={user} />
      <main className="flex-1 p-8 overflow-y-auto max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
}
