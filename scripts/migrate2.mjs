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
const sql = neon(url);
await sql`CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  picture TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
)`;
await sql`CREATE TABLE IF NOT EXISTS favorites (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  slug TEXT NOT NULL,
  sid TEXT,
  title TEXT,
  poster TEXT,
  year TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(email, slug)
)`;
await sql`CREATE TABLE IF NOT EXISTS reading_histories (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  slug TEXT NOT NULL,
  sid TEXT,
  title TEXT,
  poster TEXT,
  se INT DEFAULT 0,
  ep INT DEFAULT 0,
  at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(email, slug)
)`;
console.log("tables ready");
// migrasi dari user_sync lama jika ada
try {
  const rows = await sql`SELECT email, favs, history FROM user_sync`;
  for (const r of rows) {
    const email = r.email;
    await sql`INSERT INTO users (email) VALUES (${email}) ON CONFLICT (email) DO NOTHING`;
    const u = await sql`SELECT id FROM users WHERE email = ${email}`;
    const uid = u[0].id;
    for (const f of (r.favs ?? [])) {
      await sql`INSERT INTO favorites (user_id, email, slug, sid, title, poster, year)
        VALUES (${uid}, ${email}, ${f.slug}, ${f.sid}, ${f.title}, ${f.poster}, ${f.year})
        ON CONFLICT (email, slug) DO NOTHING`;
    }
    for (const h of (r.history ?? [])) {
      await sql`INSERT INTO reading_histories (user_id, email, slug, sid, title, poster, se, ep, at)
        VALUES (${uid}, ${email}, ${h.slug}, ${h.sid}, ${h.title}, ${h.poster}, ${h.se}, ${h.ep}, to_timestamp(${h.at}/1000.0))
        ON CONFLICT (email, slug) DO UPDATE SET sid=EXCLUDED.sid, title=EXCLUDED.title, poster=EXCLUDED.poster, se=EXCLUDED.se, ep=EXCLUDED.ep, at=EXCLUDED.at, updated_at=NOW()`;
    }
  }
  console.log("migrasi", rows.length, "user");
} catch (e) { console.log("skip migrasi", String(e).slice(0,200)); }
