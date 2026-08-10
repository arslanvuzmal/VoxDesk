import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://voxdesk-ai.vercel.app'),
  title: 'VoxDesk â€” Voice Operations Platform',
  description:
    'VoxDesk connects voice conversations with your website, phone system, calendar and CRM. Handle inbound enquiries, qualify opportunities, schedule appointments and prepare human handoffs from one workspace.',
  authors: [{ name: 'Arslan Vuzmal Lone' }],
  openGraph: {
    title: 'VoxDesk â€” Voice Operations Platform',
    description:
      'VoxDesk connects voice conversations with your website, phone system, calendar and CRM. Handle inbound enquiries, qualify opportunities, schedule appointments and prepare human handoffs from one workspace.',
    url: 'https://voxdesk-ai.vercel.app',
    siteName: 'VoxDesk',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VoxDesk â€” Voice Operations Platform',
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
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className={`${GeistSans.className} min-h-screen antialiased`}>{children}</body>
    </html>
  );
}

