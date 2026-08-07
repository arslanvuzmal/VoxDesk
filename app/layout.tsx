import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://voxdesk-ai.vercel.app'),
  title: 'VoxDesk — Voice Operations Platform',
  description:
    'VoxDesk connects voice conversations with your website, phone system, calendar and CRM. Handle inbound enquiries, qualify opportunities, schedule appointments and prepare human handoffs from one workspace.',
  authors: [{ name: 'Arslan Vuzmal Lone' }],
  openGraph: {
    title: 'VoxDesk — Voice Operations Platform',
    description:
      'VoxDesk connects voice conversations with your website, phone system, calendar and CRM. Handle inbound enquiries, qualify opportunities, schedule appointments and prepare human handoffs from one workspace.',
    url: 'https://voxdesk-ai.vercel.app',
    siteName: 'VoxDesk',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VoxDesk — Voice Operations Platform',
    description:
      'VoxDesk connects voice conversations with your website, phone system, calendar and CRM. Handle inbound enquiries, qualify opportunities, schedule appointments and prepare human handoffs from one workspace.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-[#F8FAFC] text-[#0F172A] selection:bg-[#1D4ED8] selection:text-white">
        {children}
      </body>
    </html>
  );
}
