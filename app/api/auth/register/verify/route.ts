import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { createSessionToken, SESSION_COOKIE } from "@/lib/auth";
export const dynamic = "force-dynamic";
export async function POST(req: NextRequest) {
  const { email, code } = (await req.json().catch(() => ({}))) as any;
  const e = String(email || "").trim().toLowerCase();
  const c = String(code || "").trim();
  if (!e || !c) return NextResponse.json({ error: "Email/kode wajib" }, { status: 400 });
  const sql = getSql();
  const rows = await sql`SELECT id, data FROM otp_codes WHERE email = ${e} AND code = ${c} AND type='register' AND expires_at > NOW() AND used_at IS NULL LIMIT 1`;
  if (!rows.length) return NextResponse.json({ error: "Kode salah/kadaluarsa" }, { status: 400 });
  const data = rows[0].data as any;
  await sql`UPDATE otp_codes SET used_at = NOW() WHERE id = ${rows[0].id}`;
  const exists = await sql`SELECT id FROM users WHERE email = ${e} LIMIT 1`;
  if (exists.length) return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 400 });
  await sql`INSERT INTO users (email, name, password, auth_provider, email_verified_at) VALUES (${e}, ${data.name}, ${data.hash}, 'email', NOW())`;
  const token = await createSessionToken({ email: e, name: data.name });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60*60*24*30 });
  return res;
}
