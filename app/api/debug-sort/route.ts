import { NextResponse } from "next/server";
import { getCategoryData } from "@/lib/moviebox";
export const dynamic = "force-dynamic";
export async function GET() {
  const sorts = ["RECOMMEND","HOT_SCORE","NEWEST_RELEASE","SCORE"] as const;
  const out: Record<string,string[]> = {};
  for(const s of sorts){
    const r = await getCategoryData(2,1,3,s,"ALL","ALL","ALL","ALL");
    out[s] = r.items.map(i=> `${i.name} (${i.rating||"-"}) [${i.year||""}]`);
  }
  return NextResponse.json(out);
}
