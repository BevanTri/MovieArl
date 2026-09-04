/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getSql } from "@/lib/db";
export const dynamic = "force-dynamic";
export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user?.email) return NextResponse.json({ error: "Login dulu" }, { status: 401 });
  const { code } = await req.json().catch(()=>({})) as any;
  const c = String(code||"").trim();
  const sql = getSql();
  const r = await sql`SELECT id FROM otp_codes WHERE email=${user.email} AND code=${c} AND type='delete' AND expires_at > NOW() AND used_at IS NULL LIMIT 1`;
  if (!r.length) return NextResponse.json({ error: "Kode salah/kadaluarsa" }, { status: 400 });
  await sql`UPDATE otp_codes SET used_at=NOW() WHERE id=${r[0].id}`;
  await sql`DELETE FROM reading_histories WHERE email=${user.email}`;
  await sql`DELETE FROM favorites WHERE email=${user.email}`;
  await sql`DELETE FROM users WHERE email=${user.email}`;
  const res = NextResponse.json({ ok: true });
  res.cookies.set("moviearl_session", "", { maxAge: 0, path: "/" });
  return res;
}
