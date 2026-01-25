import { Metadata } from 'next';
import Link from 'next/link';
import { getDemoStories } from '@/lib/demoStories';

export const metadata: Metadata = {
  title: 'Free English Text to Speech – Natural AI Voice Generator',
  description: 'Convert text to speech in English with American, British, and Indian accents. Free unlimited AI voice generator.',
  alternates: { canonical: 'https://tryvoicely.com/english-text-to-speech' },
  openGraph: {
    title: 'Free English Text to Speech',
    type: 'website',
    locale: 'en_US',
    siteName: 'Voicely',
  },
};

export default function EnglishTTSPage() {
  const stories = getDemoStories('en');

  return (
    <div className="min-h-screen bg-black text-white px-6 py-12 font-sans">
      <div className="max-w-4xl mx-auto space-y-16">
        
        <section className="text-center space-y-8 mt-8">
          <div className="inline-block px-3 py-1 border border-blue-800/50 rounded-full bg-blue-900/20 text-blue-400 text-xs tracking-widest uppercase mb-2">
            Global AI Engine 🌍
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 to-white bg-clip-text text-transparent">
            Free English Text to Speech
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Generate human-like English audio from text. Supports multiple accents 
            and emotional tones. Free forever for creators.
          </p>
          <div className="pt-4">
            <Link
              href="/"
              className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition transform hover:scale-105 shadow-[0_0_20px_rgba(59,130,246,0.2)]"
            >
              <span>🎙️</span> Generate Audio
            </Link>
          </div>
        </section>

        <section className="space-y-8">
          <div className="flex items-center justify-between border-b border-gray-800 pb-4">
            <h2 className="text-2xl font-bold text-gray-200">🔥 Recent English Stories</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stories.map((s) => (
              <Link
                key={s.id}
                href={`/share/${s.id}`}
                className="group block p-6 rounded-2xl bg-gray-900/40 border border-gray-800 hover:border-blue-500/30 transition hover:bg-gray-900/60"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] uppercase tracking-widest text-gray-500 border border-gray-700 px-2 py-1 rounded">{s.voice}</span>
                  <span className="text-blue-500 text-xs opacity-0 group-hover:opacity-100 transition">Listen →</span>
                </div>
                <p className="text-gray-300 line-clamp-3 text-lg leading-relaxed">{s.input}</p>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
