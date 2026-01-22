import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import clsx from "clsx";
import Script from "next/script";
import "./globals.css";

const jetBrainsMono = JetBrains_Mono({
  weight: "400",
  subsets: [],
  preload: true,
});

// Public environment config (SAFE)
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const enableGA =
  process.env.NEXT_PUBLIC_ENABLE_GA === "true";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "OpenAI.fm",
  description:
    "An interactive demo for developers to try the new text-to-speech model in the OpenAI API",
  authors: [{ name: "OpenAI" }],
  openGraph: {
    title: "OpenAI.fm",
    description:
      "An interactive demo for developers to try the new text-to-speech model in the OpenAI API",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "OpenAI.fm, a text-to-speech demo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Google Analytics (production only) */}
        {enableGA && (
          <>
            <Script
              src="https://www.googletagmanager.com/gtag/js?id=G-YVZ3QD0WH8"
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-YVZ3QD0WH8', {
                  anonymize_ip: true
                });
              `}
            </Script>
          </>
        )}
      </head>
      <body className={clsx("antialiased", jetBrainsMono.className)}>
        {children}
      </body>
    </html>
  );
}
