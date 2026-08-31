import fs from "fs";
import { neon } from "@neondatabase/serverless";
let url = process.env.DATABASE_URL;
if (!url && fs.existsSync(".env.local")) {
  const t = fs.readFileSync(".env.local","utf8");
  for(const l of t.split("\n")){const m=l.match(/^\s*DATABASE_URL\s*=\s*"?([^"]+)"?\s*$/); if(m) url=m[1];}
}
const sql = neon(url);
await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider TEXT`;
await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS provider_id TEXT`;
await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ`;
await sql`CREATE TABLE IF NOT EXISTS otp_codes (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
)`;
await sql`CREATE INDEX IF NOT EXISTS idx_otp_email ON otp_codes(email)`;
console.log("otp + users cols ready");
