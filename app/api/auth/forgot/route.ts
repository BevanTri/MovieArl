import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { sendOtpEmail } from "@/lib/mail";
export const dynamic = "force-dynamic";
export async function POST(req: NextRequest) {
  const { email } = (await req.json().catch(() => ({}))) as any;
  const e = String(email||"").trim().toLowerCase();
  if (!e || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return NextResponse.json({ error: "Email tidak valid" }, { status: 400 });
  const sql = getSql();
  const u = await sql`SELECT id FROM users WHERE email = ${e} LIMIT 1`;
  if (!u.length) return NextResponse.json({ error: "Email tidak terdaftar" }, { status: 400 });
  const code = Math.floor(100000 + Math.random()*900000).toString();
  await sql`DELETE FROM otp_codes WHERE email=${e} AND type='reset'`;
  await sql`INSERT INTO otp_codes (email, code, type, expires_at) VALUES (${e}, ${code}, 'reset', NOW() + INTERVAL '5 minutes')`;
  await sendOtpEmail(e, code);
  return NextResponse.json({ ok: true });
}
