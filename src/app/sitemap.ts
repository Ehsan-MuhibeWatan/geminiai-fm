import { MetadataRoute } from 'next'
import Database from 'better-sqlite3'
import path from 'path'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://tryvoicely.com'
  
  // 1. Connect to Ghajini Memory (Database)
  let shares: { id: string, created_at: string }[] = []
  
  try {
    const dbPath = path.resolve(process.cwd(), 'share_links.db')
    const db = new Database(dbPath, { readonly: true, fileMustExist: false })
    
    const tableExists = db.prepare("SELECT count(*) as count FROM sqlite_master WHERE type='table' AND name='shares'").get() as { count: number };
    
    if (tableExists.count > 0) {
      shares = db.prepare('SELECT id, created_at FROM shares ORDER BY created_at DESC').all() as any[]
    }
  } catch (error) {
    console.error('Sitemap DB Error:', error)
  }

  // 2. Map User Stories to URLs
  const shareUrls = shares.map((share) => ({
    url: `${baseUrl}/share/${share.id}`,
    lastModified: new Date(share.created_at),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  // 3. Return Full Map (Homepage + Money Pages + User Stories)
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    // --- THE NEW MONEY PAGES ---
    {
      url: `${baseUrl}/urdu-text-to-speech`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/hindi-text-to-speech`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/english-text-to-speech`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    // ---------------------------
    ...shareUrls,
  ]
}
