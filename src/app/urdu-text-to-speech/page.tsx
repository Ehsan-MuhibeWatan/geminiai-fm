import { Metadata } from 'next';
import Link from 'next/link';
import { getDemoStories } from '@/lib/demoStories';

export const metadata: Metadata = {
  title: 'Free Urdu Text to Speech – Natural AI Voice Generator | Voicely',
  description: 'Convert Urdu text into natural AI voice instantly. Free Urdu text to speech with realistic male and female voices. Best for YouTube & Instagram.',
  alternates: { canonical: 'https://tryvoicely.com/urdu-text-to-speech' },
  openGraph: {
    title: 'Free Urdu Text to Speech – AI Voice Generator',
    description: 'Listen to Urdu stories and convert your own Urdu text into natural AI speech.',
    type: 'website',
    locale: 'ur_PK',
    siteName: 'Voicely',
  },
};

export default function UrduTTSPage() {
  const stories = getDemoStories('ur');

  return (
    <div className="min-h-screen bg-black text-white px-6 py-12 font-sans">
      <div className="max-w-4xl mx-auto space-y-16">
        
        {/* HERO SECTION */}
        <section className="text-center space-y-8 mt-8">
          <div className="inline-block px-3 py-1 border border-green-800/50 rounded-full bg-green-900/20 text-green-400 text-xs tracking-widest uppercase mb-2">
            AI for Pakistan 🇵🇰
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Free Urdu Text to Speech
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Convert Urdu script (Nastaliq compatible) into lifelike AI audio. 
            No signup. No limits. Perfect for YouTube automation, reels, and storytelling.
          </p>
          <div className="pt-4">
            <Link
              href="/"
              className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition transform hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            >
              <span>🎙️</span> Create Urdu Audio Now
            </Link>
          </div>
        </section>

        {/* LIVE DEMOS (The "Social Proof") */}
        <section className="space-y-8">
          <div className="flex items-center justify-between border-b border-gray-800 pb-4">
            <h2 className="text-2xl font-bold text-gray-200 flex items-center gap-2">
              <span>🔥</span> Recent Urdu Generations
            </h2>
            <span className="text-xs text-gray-500">Live from Community</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stories.map((s) => (
              <Link
                key={s.id}
                href={`/share/${s.id}`}
                className="group block p-6 rounded-2xl bg-gray-900/40 border border-gray-800 hover:border-green-500/30 transition hover:bg-gray-900/60"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] uppercase tracking-widest text-gray-500 border border-gray-700 px-2 py-1 rounded">
                    {s.voice}
                  </span>
                  <span className="text-green-500 text-xs opacity-0 group-hover:opacity-100 transition">Listen →</span>
                </div>
                <p className="text-gray-300 line-clamp-3 text-lg leading-relaxed font-serif" dir="rtl">
                  {s.input}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* SEO CONTENT (Hidden in plain sight for Google) */}
        <section className="prose prose-invert prose-sm max-w-none text-gray-500 pt-12 border-t border-gray-900">
          <h3>Why use Voicely for Urdu?</h3>
          <p>
            Most TTS engines sound robotic with Urdu. We use Google's advanced <strong>Neural2</strong> and <strong>WaveNet</strong> models optimized for South Asian languages. Whether you are creating Islamic content, poetry, or news, our AI captures the correct pronunciation and intonation.
          </p>
        </section>

      </div>
    </div>
  );
}
