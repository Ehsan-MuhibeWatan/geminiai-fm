import { Metadata } from "next";
import ClientDynamicTTS from "@/components/ClientDynamicTTS";

// SEO Meta Data (Google ko khush karnay ke liye)
export const metadata: Metadata = {
  title: "MyAIFM - Unlimited Free AI Text to Speech",
  description: "Generate unlimited AI audio with Google Gemini 2.0 & Neural2. No limits, human-like voices for creators. Built by Muhib-e-Watan.",
};

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-12 bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white">
      
      {/* --- 1. THE TRAP (ANNOUNCEMENT BANNER) --- */}
      <div className="w-full max-w-4xl bg-yellow-900/30 border border-yellow-600/50 p-3 rounded-lg mb-8 text-center animate-pulse shadow-[0_0_15px_rgba(234,179,8,0.2)]">
        <p className="text-yellow-400 font-bold text-lg">
          🎉 LIMITS REMOVED: Generate Unlimited Audio for Free!
        </p>
        <p className="text-xs text-yellow-200/70">
          Powered by Google Cloud Gemini 2.0 Flash & Neural2 Engine
        </p>
      </div>

      {/* --- BRANDING HEADER --- */}
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex mb-8 text-gray-400">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-800 bg-black/50 pb-6 pt-8 backdrop-blur-2xl lg:static lg:w-auto lg:rounded-xl lg:border lg:p-4">
          <code className="font-bold text-white">MyAIFM.online</code>&nbsp;| The "Dirty" Fast Engine
        </p>
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-black via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
          <a
            className="flex place-items-center gap-2 p-8 lg:p-0 hover:text-white transition-colors"
            href="https://muhibewatan.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            By Muhib-e-Watan Initiative 🇵🇰
          </a>
        </div>
      </div>

      {/* --- 2. THE MAIN ENGINE (Your App Logic) --- */}
      <div className="relative w-full max-w-4xl z-10 min-h-[400px]">
        {/* Background Glow Effect */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        
        {/* Is component mein aapka Form aur Player hai */}
        <div className="relative bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-6 shadow-2xl">
           <ClientDynamicTTS />
        </div>
      </div>

      {/* --- 3. THE DIRTY MONEY HOOKS (Affiliates) --- */}
      <div className="mt-16 grid text-center lg:max-w-5xl lg:w-full lg:grid-cols-3 lg:text-left gap-6">
        
        {/* Hook 1: Support */}
        <a
          href="https://www.buymeacoffee.com/" // Yahan apna link daal dena
          className="group rounded-lg border border-gray-800 px-5 py-4 transition-colors hover:border-gray-600 hover:bg-gray-800/50"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className="mb-3 text-2xl font-semibold text-gray-200">
            Support Dev ☕{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm text-gray-500">
            Server bill is on me. A coffee helps keep the engine running 24/7.
          </p>
        </a>

        {/* Hook 2: Mic Affiliate */}
        <a
          href="#" // Amazon link here
          className="group rounded-lg border border-gray-800 px-5 py-4 transition-colors hover:border-gray-600 hover:bg-gray-800/50"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className="mb-3 text-2xl font-semibold text-gray-200">
            Pro Mic Setup 🎙️{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm text-gray-500">
            Want your voice to sound like this AI? Check out this gear.
          </p>
        </a>

        {/* Hook 3: Cloud Affiliate */}
        <a
          href="#" // Cloud referral
          className="group rounded-lg border border-gray-800 px-5 py-4 transition-colors hover:border-gray-600 hover:bg-gray-800/50"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className="mb-3 text-2xl font-semibold text-gray-200">
            Host for Free ☁️{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm text-gray-500">
            Learn how we scaled to 1M+ requests without paying a dime.
          </p>
        </a>
      </div>

       {/* --- 4. SEO FOOTER --- */}
      <div className="mt-12 text-center text-xs text-gray-600">
        <p>Built with ❤️ in Pakistan. Optimized for Urdu, Hindi, English & Arabic Narrations.</p>
        <p className="mt-1 opacity-50">v2.0-Dirty-Engine | Powered by Google Cloud</p>
      </div>
    </main>
  );
}
