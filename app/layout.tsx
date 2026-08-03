import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VoxDesk AI — Configurable AI Voice Receptionist & Call Automation SaaS",
  description:
    "Production-oriented AI voice receptionist SaaS with appointment booking, lead qualification, human escalation, speaker-separated transcripts, and provider-ready telephony integrations.",
  authors: [{ name: "Arslan Vuzmal Lone" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen bg-navy-950 text-gray-100 selection:bg-teal-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
