import fs from "fs";
import { neon } from "@neondatabase/serverless";
let url = process.env.DATABASE_URL;
if (!url && fs.existsSync(".env.local")) {
  const t = fs.readFileSync(".env.local","utf8");
  for(const l of t.split("\n")){const m=l.match(/^\s*DATABASE_URL\s*=\s*"?([^"]+)"?\s*$/); if(m) url=m[1];}
}
const sql = neon(url);
await sql`DROP TABLE IF EXISTS user_sync`;
console.log("dropped user_sync");
const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name`;
console.log(tables.map(r=>r.table_name).join(", "));
