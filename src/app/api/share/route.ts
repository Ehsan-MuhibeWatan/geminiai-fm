import { NextRequest, NextResponse } from "next/server";
import fs from 'fs';   // ADD THIS
import path from 'path'; // ADD THIS
import Database from "better-sqlite3";
import { MAX_PROMPT_LENGTH, MAX_INPUT_LENGTH } from "../generate/route";
import { safeUUID } from "@/lib/safeUUID";

// Initialize SQLite database (stored in the project root)
const dbPath = path.resolve(process.cwd(), "share_links.db");
const db = new Database(dbPath);

// Create the table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS shares (
    id TEXT PRIMARY KEY,
    input TEXT,
    prompt TEXT,
    voice TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

export async function POST(req: NextRequest) {
  try {
    const { input, prompt, voice } = await req.json();
    
    const clippedInput = (input || "").slice(0, MAX_INPUT_LENGTH);
    const clippedPrompt = (prompt || "").slice(0, MAX_PROMPT_LENGTH);
    const id = safeUUID();

    const insert = db.prepare(
      "INSERT INTO shares (id, input, prompt, voice) VALUES (?, ?, ?, ?)"
    );
    insert.run(id, clippedInput, clippedPrompt, voice || "");

    return NextResponse.json({ id });
  } catch (err) {
    console.error("Error storing share params:", err);
    return new NextResponse("An error occurred.", { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const hash = url.searchParams.get("hash");

    if (!hash) {
      return new NextResponse("Not found", { status: 404 });
    }

    const row = db.prepare("SELECT input, prompt, voice FROM shares WHERE id = ?").get(hash) as {
      input: string;
      prompt: string;
      voice: string;
    } | undefined;

    if (!row) {
      return new NextResponse("Not found", { status: 404 });
    }

    return NextResponse.json(row);
  } catch (err) {
    console.error("Error retrieving share params:", err);
    return new NextResponse("An error occurred.", { status: 500 });
  }
}
