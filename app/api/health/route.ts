import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export async function GET() {
  const started = Date.now();
  let db: "ok" | "fail" | "skip" = "skip";
  let tables: string[] = [];
  try {
    const mod = await import("@/lib/db");
    const sql = mod.getSql();
    const rows = (await sql`SELECT table_name FROM information_schema.tables WHERE table_schema='public' LIMIT 10`) as Array<{ table_name: string }>;
    tables = rows.map((r) => r.table_name);
    db = "ok";
  } catch { db = "fail"; }
  return NextResponse.json({
    ok: true,
    ts: new Date().toISOString(),
    uptime: process.uptime(),
    latencyMs: Date.now() - started,
    db,
    tables,
    version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "local",
  }, { headers: { "Cache-Control": "no-store" } });
}
