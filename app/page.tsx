import { getHome, getGenreShelves } from "@/lib/moviebox";
import MediaRow from "@/components/MediaRow";
import HeroCarousel from "@/components/HeroCarousel";
import ResumeRow from "@/components/ResumeRow";
import Categories from "@/components/Categories";

export const revalidate = 600;

const MAX_SHELVES = 6;

export default async function HomePage() {
  let sections: Awaited<ReturnType<typeof getHome>> = [];
  let genreShelves: Awaited<ReturnType<typeof getGenreShelves>> = [];
  try {
    [sections, genreShelves] = await Promise.all([getHome(), getGenreShelves()]);
  } catch {
    try { sections = await getHome(); } catch { sections = []; }
  }
  const banner = sections.find((s) => s.section === "Banner");
  // dedup judul sama (upstream kadang duplikat "Trending Indo Dubbed") — gabung items
  const deduped = new Map<string, typeof sections[number]>();
  for (const s of sections.filter((s) => s.section !== "Banner")) {
    const cur = deduped.get(s.section);
    if (cur) cur.items = [...cur.items, ...s.items];
    else deduped.set(s.section, { ...s, items: [...s.items] });
  }
  const shelves = Array.from(deduped.values()).slice(0, MAX_SHELVES);

  function hrefFor(title: string) {
    const t = title.toLowerCase();
    if (t.includes("serial") || t.includes("tv") || t.includes("drama")) return "/browse/tv";
    if (t.includes("anim")) return "/browse/animation";
    if (t.includes("indo") || t.includes("trending")) return "/browse/movies";
    return "/browse/movies";
  }
  return (
    <div className="pt-2 sm:pt-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <HeroCarousel items={banner?.items ?? []} />
      <div className="mt-6">
        <Categories />
        <ResumeRow />
        {shelves.map((s, i) => (
          <MediaRow key={`${s.section}-${i}`} title={s.section} items={s.items.slice(0, 14)} moreHref={hrefFor(s.section)} />
        ))}
        {genreShelves.map((s) => (
          <MediaRow key={`genre-${s.section}`} title={s.section} items={s.items.slice(0, 14)} moreHref={`/browse/movies?genre=${encodeURIComponent(s.section)}`} />
        ))}
      </div>
      {!sections.length && !genreShelves.length && (
        <p className="text-theme-muted text-center py-20 px-4">Gagal memuat katalog. Coba refresh.</p>
      )}
    </div>
  );
}
