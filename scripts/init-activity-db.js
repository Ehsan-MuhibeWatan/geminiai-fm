const Database = require("better-sqlite3");

const db = new Database("/home/ehsanonyx/openai-fm/activity.db");

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

console.log("✅ activity_log table ready");

db.close();
