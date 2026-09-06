import { NextResponse } from "next/server";
import { getCategoryData } from "@/lib/moviebox";
export const dynamic = "force-dynamic";
export async function GET() {
  const tests = ["ALL", "Indonesia", "USA", "Japan"] as const;
  const out: Record<string, string[]> = {};
  for (const c of tests) {
    try {
      const r = await getCategoryData(2, 1, 5, "RECOMMEND", "ALL", c, "ALL", "ALL");
      out[c] = r.items.map((i) => `${i.name} [${i.country||i.genre}]`);
    } catch (e) {
      out[c] = [`error ${String(e).slice(0,100)}`];
    }
  }
  return NextResponse.json(out);
}
