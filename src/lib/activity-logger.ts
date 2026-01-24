import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const DB_PATH = "/home/myeduprojects/openai-fm/activity.db";

let db: Database.Database | null = null;
let insertStmt: Database.Statement | null = null;

function initDb() {
  if (db) return;

  // Ensure directory exists BEFORE opening DB
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

  db = new Database(DB_PATH);

  db.exec(`
    CREATE TABLE IF NOT EXISTS activity_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TEXT NOT NULL,
      ip TEXT,
      voice TEXT,
      chars INTEGER,
      text TEXT
    );
  `);

  insertStmt = db.prepare(`
    INSERT INTO activity_log (timestamp, ip, voice, chars, text)
    VALUES (?, ?, ?, ?, ?)
  `);
}

export function logActivity(ip: string, input: string, voice: string) {
  try {
    initDb();

    insertStmt!.run(
      new Date().toISOString(),
      ip,
      voice,
      input.length,
      input
    );
  } catch (error) {
    console.error("[SQLITE LOGGER FAILURE]", error);
  }
}
