import { Metadata } from 'next';
import Database from 'better-sqlite3';
import path from 'path';
import Link from 'next/link';
import { notFound } from 'next/navigation';

// 1. Safe Database Connection
const dbPath = path.resolve(process.cwd(), 'share_links.db');
const db = new Database(dbPath, { readonly: true, fileMustExist: false });

interface ShareData {
  id: string;
  input: string;
  voice: string;
  created_at: string;
}

// 2. Fetch Helper
function getShare(id: string): ShareData | undefined {
  try {
    return db.prepare('SELECT * FROM shares WHERE id = ?').get(id) as ShareData | undefined;
  } catch (e) { return undefined; }
}

// 3. Related Stories ("The Trap")
function getRelatedStories(currentId: string) {
  try {
    return db.prepare(`
      SELECT id, input, voice 
      FROM shares 
      WHERE id != ? 
      ORDER BY created_at DESC 
      LIMIT 4
    `).all(currentId) as { id: string, input: string, voice: string }[];
  } catch (e) { return []; }
}

// 4. Robust Language Detection
function detectLanguage(text: string) {
  if (/[\u0600-\u06FF]/.test(text)) return { label: 'Urdu', code: 'ur', locale: 'ur_PK' };
  if (/[\u0900-\u097F]/.test(text)) return { label: 'Hindi', code: 'hi', locale: 'hi_IN' };
  return { label: 'English', code: 'en', locale: 'en_US' };
}

// Helper: Smart Title Splitter (Fixes the Regex Bug)
// Splits by Newline OR Hindi Danda (।) OR Period
function getSmartSnippet(text: string, length: number) {
  return text.split(/\n|।|\./)[0].slice(0, length).replace(/[\r\t]+/g, ' ').trim();
}

// 5. SEO Metadata
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const data = getShare(params.id);
  if (!data) return { title: 'Story Not Found' };

  const lang = detectLanguage(data.input);
  const snippet = getSmartSnippet(data.input, 60);

  return {
    title: `${snippet} – Free AI Voice Story (${data.voice}) | Voicely`,
    description: `Listen to this free ${lang.label} story narrated in ${data.voice} voice. Convert your own text to natural AI speech instantly.`,
    alternates: {
      canonical: `https://tryvoicely.com/share/${params.id}`,
    },
    other: {
      'content-language': lang.code,
    },
    openGraph: {
      title: snippet,
      description: data.input.slice(0, 140),
      type: 'article',
      publishedTime: data.created_at,
      locale: lang.locale, // FIXED: Now uses ur_PK, hi_IN, etc.
      url: `https://tryvoicely.com/share/${params.id}`,
      siteName: 'Voicely',
    },
  };
}

export default function SharePage({ params }: { params: { id: string } }) {
  const data = getShare(params.id);
  if (!data) notFound();

  const related = getRelatedStories(params.id);
  const lang = detectLanguage(data.input);
  const title = getSmartSnippet(data.input, 80);

  // 6. JSON-LD Schema (Article + Breadcrumb)
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      'headline': title,
      'articleBody': data.input,
      'datePublished': data.created_at,
      'inLanguage': lang.code,
      'isAccessibleForFree': true,
      'author': {
        '@type': 'Organization',
        'name': 'Voicely Community'
      },
      'publisher': {
        '@type': 'Organization',
        'name': 'Voicely',
        'url': 'https://tryvoicely.com'
      },
      'associatedMedia': {
        '@type': 'AudioObject',
        'description': `AI narration in ${data.voice} voice`
      }
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': [
        {
          '@type': 'ListItem',
          'position': 1,
          'name': 'Voicely',
          'item': 'https://tryvoicely.com'
        },
        {
          '@type': 'ListItem',
          'position': 2,
          'name': `${lang.label} Stories`,
          'item': `https://tryvoicely.com/share` // Ideally leads to a listing page
        },
        {
          '@type': 'ListItem',
          'position': 3,
          'name': title
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-4 md:p-8 font-sans">
      
      {/* Inject Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-3xl w-full">
        
        {/* Top Nav / Breadcrumb UI */}
        <div className="mb-8 flex items-center justify-between text-sm text-gray-500">
          <Link href="/" className="hover:text-blue-400 transition flex items-center gap-1 group">
            <span className="group-hover:-translate-x-1 transition-transform">←</span> 
            Create your own {lang.label} AI Story
          </Link>
          <div className="flex gap-2">
            <span className="uppercase tracking-widest text-[10px] border border-gray-800 px-2 py-1 rounded bg-gray-900">
              {lang.label}
            </span>
            <span className="uppercase tracking-widest text-[10px] border border-gray-800 px-2 py-1 rounded bg-gray-900">
              {data.voice}
            </span>
          </div>
        </div>

        {/* Main Content */}
        <article className="prose prose-invert lg:prose-xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent mb-6 leading-tight">
             {title}...
          </h1>
          
          <div className="bg-gray-900/40 p-6 md:p-10 rounded-2xl border border-gray-800 shadow-[0_0_40px_-10px_rgba(0,0,0,0.5)] relative">
             <div className="absolute top-4 left-4 text-6xl text-gray-800 opacity-20 font-serif">“</div>
             <p className="text-lg md:text-xl leading-8 text-gray-300 whitespace-pre-wrap relative z-10 font-medium font-serif">
               {data.input}
             </p>
             <div className="absolute bottom-4 right-4 text-6xl text-gray-800 opacity-20 font-serif transform rotate-180">“</div>
          </div>
          
          <div className="mt-4 text-center text-xs text-gray-600 border-t border-gray-900 pt-4">
            Created by a Voicely user • Public story • Free to listen
          </div>
        </article>

        {/* CTA */}
        <div className="my-12 text-center">
          <Link 
            href="/"
            className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition transform hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          >
            <span>🎙️</span> Turn Your Text into Audio
          </Link>
          <p className="mt-3 text-xs text-gray-500">Free Unlimited AI • {lang.label} Supported</p>
        </div>

        {/* Related Stories */}
        {related.length > 0 && (
          <div className="border-t border-gray-900 pt-12 mt-12">
            <h3 className="text-xl font-bold text-gray-400 mb-6 flex items-center gap-2">
              <span>🔥</span> More from the Community
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {related.map(story => (
                <Link 
                  key={story.id} 
                  href={`/share/${story.id}`}
                  className="group block p-5 rounded-xl bg-gray-900/30 border border-gray-800 hover:border-blue-500/30 transition hover:bg-gray-900/50"
                >
                  <div className="text-sm text-gray-300 line-clamp-2 mb-3 leading-relaxed group-hover:text-blue-200 transition">
                    "{story.input}"
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-600 font-mono uppercase bg-black px-2 py-1 rounded">
                      {story.voice}
                    </span>
                    <span className="text-xs text-blue-500 opacity-0 group-hover:opacity-100 transition transform -translate-x-2 group-hover:translate-x-0">
                      Read →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
