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

// GA Toggle
const enableGA = process.env.NEXT_PUBLIC_ENABLE_GA === "true";

export const metadata: Metadata = {
  // 1. SEO Title & Description (The keywords you want to rank for)
  title: "Voicely | Free Neural Text to Speech (Urdu, Hindi, English)",
  description:
    "Convert text to lifelike human speech using Google's Neural2 AI. The best free tool for content creators in Pakistan and India. Supports Urdu, Hindi, and English.",
  
  // 2. Search Keywords (What people type in Google)
  keywords: ["Text to Speech", "Urdu TTS", "Hindi TTS", "Free AI Voice", "Neural2", "Voiceover Generator", "Pakistan AI"],
  
  // 3. Authorship
  authors: [{ name: "Muhib-e-Watan Initiative", url: "https://muhibewatan.org" }],
  
  metadataBase: new URL("https://tryvoicely.com"),

  // 4. Social Media Previews (WhatsApp/Twitter/Facebook cards)
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

  // 5. PWA Support (So users can install it as an App)
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
    <html lang="en">
      <head>
        {/* Google Analytics (Only loads in Production) */}
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
