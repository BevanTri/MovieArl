import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { createSessionToken, SESSION_COOKIE } from "@/lib/auth";
import bcrypt from "bcryptjs";
export const dynamic = "force-dynamic";
export async function POST(req: NextRequest) {
  const { email, password } = (await req.json().catch(() => ({}))) as any;
  const e = String(email||"").trim().toLowerCase();
  if (!e || !password) return NextResponse.json({ error: "Email/password wajib" }, { status: 400 });
  const sql = getSql();
  const rows = await sql`SELECT password, name, email FROM users WHERE email = ${e} LIMIT 1`;
  if (!rows.length || !rows[0].password) return NextResponse.json({ error: "Akun tidak ditemukan atau belum set password" }, { status: 400 });
  const ok = await bcrypt.compare(String(password), rows[0].password);
  if (!ok) return NextResponse.json({ error: "Password salah" }, { status: 400 });
  const token = await createSessionToken({ email: e, name: rows[0].name });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV==="production", sameSite:"lax", path:"/", maxAge:60*60*24*30 });
  return res;
}
