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
  title: "GeminiAI-FM | Unlimited Free TTS",
  description:
    "Generate human-like audio for free using Google Gemini 2.0 Flash & Neural2. No OpenAI API key required.",
  metadataBase: new URL("https://myaifm.online"), // Agar aap ki domain yeh hai to
  openGraph: {
    title: "GeminiAI-FM | The Dirty Fast Engine",
    description:
      "Unlimited Free Text-to-Speech powered by Google Cloud. Zero cost, pure vibe.",
  },
  twitter: {
    card: "summary_large_image",
    title: "GeminiAI-FM",
    description: "Unlimited Free Text-to-Speech powered by Google Cloud.",
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
