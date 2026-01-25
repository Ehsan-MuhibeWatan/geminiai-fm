import Database from 'better-sqlite3';
import path from 'path';

export function getDemoStories(langCode: 'ur' | 'hi' | 'en', limit = 6) {
  try {
    const dbPath = path.resolve(process.cwd(), 'share_links.db');
    // Open DB with Read-Only for safety
    const db = new Database(dbPath, { readonly: true, fileMustExist: false });

    // ⚡ MAGIC: Register REGEXP function for SQLite so we can filter languages
    db.function('REGEXP', (regex: string, text: string) => {
      return new RegExp(regex).test(text) ? 1 : 0;
    });

    let regexPattern;
    if (langCode === 'ur') regexPattern = '[\\u0600-\\u06FF]'; // Arabic/Urdu Range
    else if (langCode === 'hi') regexPattern = '[\\u0900-\\u097F]'; // Devanagari Range
    else regexPattern = '^[\\x00-\\x7F\\s\\p{P}]+$'; // ASCII/English + Punctuation

    // Fetch stories that match the language pattern
    // We intentionally grab a few more to filter out potential garbage/short ones
    const stories = db.prepare(`
      SELECT id, input, voice, created_at
      FROM shares
      WHERE input REGEXP ?
      ORDER BY created_at DESC
      LIMIT ?
    `).all(regexPattern, limit + 5) as { id: string; input: string; voice: string }[];

    // Return the clean limit
    return stories.slice(0, limit);

  } catch (error) {
    console.error('Error fetching demo stories:', error);
    return [];
  }
}
