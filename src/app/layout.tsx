import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import './globals.css';
import Analytics from '@/components/Analytics';
import AppProvider from '@/components/providers/AppProvider';
import ChatDock from '@/components/chat/ChatDock';

const SITE_DESCRIPTION =
  'Mothers to Daughters is a 501(c)(3) nonprofit connecting women across generations through mentorship—bridging the generational gap and empowering young women to lead.';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.motherstodaughters.org'),
  title: {
    default: 'Mothers to Daughters | Bridging Generations, Empowering Women',
    template: '%s | Mothers to Daughters',
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Mothers to Daughters',
    title: 'Mothers to Daughters | Bridging Generations, Empowering Women',
    description: SITE_DESCRIPTION,
    url: 'https://www.motherstodaughters.org',
    images: [
      {
        url: '/images/Heroimage.jpg',
        width: 1200,
        height: 630,
        alt: 'Mothers to Daughters — women connecting across generations',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mothers to Daughters | Bridging Generations, Empowering Women',
    description: SITE_DESCRIPTION,
    images: ['/images/Heroimage.jpg'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
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
    <ChatDock />
</AppProvider>
      </body>
    </html>
  );
}
