import type { Metadata } from 'next';
import Script from 'next/script';
import { Suspense } from 'react';
import './globals.css';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import Analytics from '@/components/Analytics';

export const metadata: Metadata = {
  title: {
    default: 'MTD - Mentor/Mentee Program',
    template: '%s | MTD',
  },
  description: 'Connecting mentors and mentees for positive impact.',
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
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
        <Suspense fallback={null}>
          <Analytics />
        </Suspense>
      </body>
    </html>
  );
}
