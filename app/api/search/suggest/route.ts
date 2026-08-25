import { NextRequest, NextResponse } from "next/server";
import { searchSuggest } from "@/lib/moviebox";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json([]);
  try {
    const items = await searchSuggest(q);
    return NextResponse.json(
      items.slice(0, 6).map((i) => ({
        title: i.name,
        slug: i.slug,
        poster: i.posterUrl,
        year: i.year,
      })),
    );
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
