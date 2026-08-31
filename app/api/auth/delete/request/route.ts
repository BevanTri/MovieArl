import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getSql } from "@/lib/db";
import { sendOtpEmail } from "@/lib/mail";
export const dynamic = "force-dynamic";
export async function POST() {
  const user = await getSession();
  if (!user?.email) return NextResponse.json({ error: "Login dulu" }, { status: 401 });
  const code = Math.floor(100000 + Math.random()*900000).toString();
  const sql = getSql();
  await sql`DELETE FROM otp_codes WHERE email=${user.email} AND type='delete'`;
  await sql`INSERT INTO otp_codes (email, code, type, expires_at) VALUES (${user.email}, ${code}, 'delete', NOW() + INTERVAL '5 minutes')`;
  await sendOtpEmail(user.email, code);
  return NextResponse.json({ ok: true });
}
