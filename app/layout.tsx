import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://voxdesk-ai.vercel.app"),
  title: "VoxDesk AI — Voice Operations & Call Automation",
  description:
    "VoxDesk helps service businesses handle inbound enquiries, qualify opportunities, schedule appointments and prepare human handoffs from one voice operations workspace.",
  authors: [{ name: "Arslan Vuzmal Lone" }],
  openGraph: {
    title: "VoxDesk AI — Voice Operations & Call Automation",
    description:
      "VoxDesk helps service businesses handle inbound enquiries, qualify opportunities, schedule appointments and prepare human handoffs from one voice operations workspace.",
    url: "https://voxdesk-ai.vercel.app",
    siteName: "VoxDesk AI",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "VoxDesk AI — Voice Operations & Call Automation",
    description:
      "VoxDesk helps service businesses handle inbound enquiries, qualify opportunities, schedule appointments and prepare human handoffs from one voice operations workspace.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen bg-[#0B0D10] text-[#F4F4F5] selection:bg-[#2DD4BF] selection:text-[#0B0D10]">
        {children}
      </body>
    </html>
  );
}
