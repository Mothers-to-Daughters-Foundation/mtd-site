'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';

export default function Analytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

  // Track route changes for GTM
  useEffect(() => {
    if (!gtmId || typeof window === 'undefined') return;

    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');

    // Push page view to GTM dataLayer
    if ((window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: 'page_view',
        page_path: url,
        page_title: document.title,
      });
    }
  }, [pathname, searchParams, gtmId]);

  if (!gtmId) {
    return null;
  }

  return (
    <>
      {/* Google Tag Manager */}
      <Script id="google-tag-manager" strategy="afterInteractive">
        {`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${gtmId}');
        `}
      </Script>
      {/* Google Tag Manager (noscript) */}
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
          height="0"
          width="0"
          style={{ display: 'none', visibility: 'hidden' }}
        />
      </noscript>
    </>
  );
}
