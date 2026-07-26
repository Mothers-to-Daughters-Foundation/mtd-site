import type { Metadata } from 'next';
import { Suspense } from 'react';
import './globals.css';
import Analytics from '@/components/Analytics';
import AppProvider from '@/components/providers/AppProvider';

export const metadata: Metadata = {
  title: {
    default: 'MTD - Mentor/Mentee Program',
    template: '%s | MTD',
  },
  description: 'Connecting mentors and mentees for positive impact.',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'MTD',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AppProvider>
    <Suspense fallback={null}>
        <Analytics />
    </Suspense>
    {children}
</AppProvider>
      </body>
    </html>
  );
}
