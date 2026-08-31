import fs from "fs";
import { neon } from "@neondatabase/serverless";
let url = process.env.DATABASE_URL;
if (!url && fs.existsSync(".env.local")) {
  const t=fs.readFileSync(".env.local","utf8");
  for(const l of t.split("\n")){const m=l.match(/^\s*DATABASE_URL\s*=\s*"?([^"]+)"?\s*$/); if(m) url=m[1];}
}
const sql=neon(url);
await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS password TEXT`;
await sql`ALTER TABLE otp_codes ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'generic'`;
await sql`ALTER TABLE otp_codes ADD COLUMN IF NOT EXISTS used_at TIMESTAMPTZ`;
await sql`CREATE INDEX IF NOT EXISTS idx_otp_email_type ON otp_codes(email, type)`;
console.log("migrated password + otp type");
