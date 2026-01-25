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

// ---- Google Analytics Controls ----
// Enable only when explicitly turned on
const enableGA = process.env.NEXT_PUBLIC_ENABLE_GA === "true";
const GA_ID = process.env.NEXT_PUBLIC_GA_ID; // G-XXXXXXXXXX

export const metadata: Metadata = {
  title: "Voicely | Free Neural Text to Speech (Urdu, Hindi, English)",
  description:
    "Convert text to lifelike human speech using Google's Neural2 AI. The best free tool for content creators in Pakistan and India. Supports Urdu, Hindi, and English.",

  keywords: [
    "Text to Speech",
    "Urdu TTS",
    "Hindi TTS",
    "Free AI Voice",
    "Neural2",
    "Voiceover Generator",
    "Pakistan AI",
  ],

  authors: [{ name: "Muhib-e-Watan Initiative", url: "https://muhibewatan.org" }],

  metadataBase: new URL("https://tryvoicely.com"),

  openGraph: {
    title: "Voicely - Turn Text into Reality",
    description: "Create viral shorts with lifelike AI voices. Free & Fast.",
    siteName: "Voicely",
    type: "website",
    locale: "en_US",
    url: "https://tryvoicely.com",
  },

  twitter: {
    card: "summary_large_image",
    title: "Voicely - Free AI Voice Generator",
    description: "Unlimited Free Text-to-Speech powered by Google Cloud.",
  },

  manifest: "/manifest.json",

  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="x-default">
      <head>
        {/* --- Google Analytics (Safe, Optional, Production-only) --- */}
        {enableGA && GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());

                gtag('config', '${GA_ID}', {
                  anonymize_ip: true,
                  send_page_view: true
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
