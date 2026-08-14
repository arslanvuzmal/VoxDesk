import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';

import { resolveApplicationUrl } from '@/lib/config/application-url';

import './globals.css';

const applicationUrl = resolveApplicationUrl();
const productDescription =
  'VoxDesk connects customer conversations with tenant-scoped CRM, scheduling, follow-up, and human-handoff workflows.';

export const metadata: Metadata = {
  metadataBase: new URL(applicationUrl),
  title: 'VoxDesk — AI Customer Operations Infrastructure',
  description: productDescription,
  authors: [{ name: 'Arslan Vuzmal Lone' }],
  openGraph: {
    title: 'VoxDesk — AI Customer Operations Infrastructure',
    description: productDescription,
    url: applicationUrl,
    siteName: 'VoxDesk',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VoxDesk — AI Customer Operations Infrastructure',
    description: productDescription,
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
