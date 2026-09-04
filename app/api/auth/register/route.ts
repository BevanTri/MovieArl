/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { sendOtpEmail } from "@/lib/mail";
import bcrypt from "bcryptjs";
export const dynamic = "force-dynamic";
export async function POST(req: NextRequest) {
  const { name, email, password, confirm } = (await req.json().catch(() => ({}))) as any;
  if (!name || !email || !password) return NextResponse.json({ error: "Lengkapi semua field" }, { status: 400 });
  if (password !== confirm) return NextResponse.json({ error: "Password tidak cocok" }, { status: 400 });
  if (password.length < 8) return NextResponse.json({ error: "Password minimal 8 karakter" }, { status: 400 });
  const e = String(email).trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return NextResponse.json({ error: "Email tidak valid" }, { status: 400 });
  const sql = getSql();
  const exists = await sql`SELECT id FROM users WHERE email = ${e} LIMIT 1`;
  if (exists.length) return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 400 });
  const nameExists = await sql`SELECT id FROM users WHERE name = ${name} LIMIT 1`;
  if (nameExists.length) return NextResponse.json({ error: "Nama sudah dipakai" }, { status: 400 });
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const hash = await bcrypt.hash(password, 10);
  await sql`DELETE FROM otp_codes WHERE email = ${e} AND type = 'register'`;
  await sql`INSERT INTO otp_codes (email, code, type, expires_at, data) VALUES (${e}, ${code}, 'register', NOW() + INTERVAL '5 minutes', ${JSON.stringify({ name, hash })}::jsonb)`;
  await sendOtpEmail(e, code);
  return NextResponse.json({ ok: true });
}
