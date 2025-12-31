import Database from "better-sqlite3";
import path from "path";
import { NextRequest } from "next/server";

const dbPath = path.join(process.cwd(), "data", "rate_limits.db");
const db = new Database(dbPath);

// ---------------- IP helper ----------------

export function getClientIP(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

// ---------------- rate limit check ----------------

export function canUseAPI(ip: string): boolean {
  const now = Date.now();

  const row = db
    .prepare("SELECT count, reset_at FROM rate_limits WHERE ip = ?")
    .get(ip) as { count: number; reset_at: number } | undefined;

  if (!row || now > row.reset_at) {
    db.prepare(
      `INSERT OR REPLACE INTO rate_limits
       (ip, count, reset_at, last_input, last_prompt)
       VALUES (?, 0, ?, NULL, NULL)`
    ).run(ip, now + 24 * 60 * 60 * 1000);

    return true;
  }

  if (row.count >= 5) return false;

  return true;
}

// ---------------- record successful usage ----------------

export function recordSuccess(
  ip: string,
  input: string,
  prompt: string
): void {
  db.prepare(
    `UPDATE rate_limits
     SET count = count + 1,
         last_input = ?,
         last_prompt = ?
     WHERE ip = ?`
  ).run(
    input.slice(0, 1000),
    prompt.slice(0, 1000),
    ip
  );
}
