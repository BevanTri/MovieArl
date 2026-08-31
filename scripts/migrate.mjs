import fs from "fs";
import { neon } from "@neondatabase/serverless";
let url = process.env.DATABASE_URL;
if (!url && fs.existsSync(".env.local")) {
  const txt = fs.readFileSync(".env.local", "utf8");
  for (const line of txt.split("\n")) {
    const m = line.match(/^\s*DATABASE_URL\s*=\s*"?([^"]+)"?\s*$/);
    if (m) url = m[1];
  }
}
if (!url) throw new Error("DATABASE_URL missing");
const sql = neon(url);
await sql`CREATE TABLE IF NOT EXISTS user_sync (
  email TEXT PRIMARY KEY,
  favs JSONB NOT NULL DEFAULT '[]'::jsonb,
  history JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
)`;
console.log("table ready");
