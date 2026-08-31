import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
export const dynamic = "force-dynamic";
export async function POST(req: NextRequest) {
  const { email, code } = (await req.json().catch(() => ({}))) as any;
  const e = String(email||"").trim().toLowerCase();
  const c = String(code||"").trim();
  const sql = getSql();
  const r = await sql`SELECT id FROM otp_codes WHERE email=${e} AND code=${c} AND type='reset' AND expires_at > NOW() AND used_at IS NULL LIMIT 1`;
  if (!r.length) return NextResponse.json({ error: "Kode salah/kadaluarsa" }, { status: 400 });
  return NextResponse.json({ ok: true });
}
