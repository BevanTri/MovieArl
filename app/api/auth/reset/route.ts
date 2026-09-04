/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import bcrypt from "bcryptjs";
export const dynamic = "force-dynamic";
export async function POST(req: NextRequest) {
  const { email, code, password, confirm } = (await req.json().catch(() => ({}))) as any;
  const e = String(email||"").trim().toLowerCase();
  if (!e || !code || !password) return NextResponse.json({ error: "Lengkapi" }, { status: 400 });
  if (password !== confirm) return NextResponse.json({ error: "Password tidak cocok" }, { status: 400 });
  if (String(password).length < 8) return NextResponse.json({ error: "Minimal 8 karakter" }, { status: 400 });
  const sql = getSql();
  const r = await sql`SELECT id FROM otp_codes WHERE email=${e} AND code=${String(code).trim()} AND type='reset' AND expires_at > NOW() AND used_at IS NULL LIMIT 1`;
  if (!r.length) return NextResponse.json({ error: "Kode salah" }, { status: 400 });
  const hash = await bcrypt.hash(String(password), 10);
  await sql`UPDATE users SET password=${hash} WHERE email=${e}`;
  await sql`UPDATE otp_codes SET used_at=NOW() WHERE id=${r[0].id}`;
  return NextResponse.json({ ok: true });
}
