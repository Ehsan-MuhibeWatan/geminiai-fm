'use client';

import Script from 'next/script';

export default function GoogleAnalytics({ gaId }: { gaId: string }) {
  // Safety check: Don't render script if ID is missing
  if (!gaId) return null;

  return (
    <>
      {/* Load the library (Off-thread) */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      
      {/* Initialize the Black Box */}
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          
          // Config: Anonymize IP for privacy compliance
          // Note: We do NOT override page_path (GA4 handles this natively)
          gtag('config', '${gaId}', {
            anonymize_ip: true
          });
        `}
      </Script>
    </>
  );
}
