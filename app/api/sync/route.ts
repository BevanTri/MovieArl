/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getSql } from "@/lib/db";
export const dynamic = "force-dynamic";

async function ensureUser(sql: ReturnType<typeof getSql>, email: string, name?: string | null, picture?: string | null) {
  await sql`INSERT INTO users (email, name, picture) VALUES (${email}, ${name ?? null}, ${picture ?? null})
    ON CONFLICT (email) DO UPDATE SET name = COALESCE(EXCLUDED.name, users.name), picture = COALESCE(EXCLUDED.picture, users.picture)`;
  const r = await sql`SELECT id FROM users WHERE email = ${email}`;
  return r[0].id as number;
}

export async function GET() {
  const user = await getSession();
  if (!user?.email) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const sql = getSql();
    await ensureUser(sql, user.email, user.name, user.picture);
    const favs = await sql`SELECT slug, sid, title, poster, year FROM favorites WHERE email = ${user.email} ORDER BY created_at DESC LIMIT 100`;
    const hist = await sql`SELECT slug, sid, title, poster, se, ep, EXTRACT(EPOCH FROM at)*1000 as at FROM reading_histories WHERE email = ${user.email} ORDER BY at DESC LIMIT 50`;
    return NextResponse.json({ favs, history: hist, db: true });
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user?.email) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { favs?: unknown[]; history?: unknown[] };
  try {
    const sql = getSql();
    const uid = await ensureUser(sql, user.email, user.name, user.picture);
    if (Array.isArray(body.favs)) {
      await sql`DELETE FROM favorites WHERE email = ${user.email}`;
      for (const f of body.favs as any[]) {
        if (!f?.slug) continue;
        await sql`INSERT INTO favorites (user_id, email, slug, sid, title, poster, year)
          VALUES (${uid}, ${user.email}, ${f.slug}, ${f.sid ?? null}, ${f.title ?? null}, ${f.poster ?? null}, ${f.year ?? null})`;
      }
    }
    if (Array.isArray(body.history)) {
      for (const h of body.history as any[]) {
        if (!h?.slug) continue;
        await sql`INSERT INTO reading_histories (user_id, email, slug, sid, title, poster, se, ep, at)
          VALUES (${uid}, ${user.email}, ${h.slug}, ${h.sid ?? null}, ${h.title ?? null}, ${h.poster ?? null}, ${h.se ?? 0}, ${h.ep ?? 0}, to_timestamp(${h.at ? h.at/1000 : Date.now()/1000}))
          ON CONFLICT (email, slug) DO UPDATE SET sid=EXCLUDED.sid, title=EXCLUDED.title, poster=EXCLUDED.poster, se=EXCLUDED.se, ep=EXCLUDED.ep, at=EXCLUDED.at, updated_at=NOW()`;
      }
    }
    return NextResponse.json({ ok: true });
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
