import { getHome } from "@/lib/moviebox";
import MediaRow from "@/components/MediaRow";
import HeroCarousel from "@/components/HeroCarousel";
import ResumeRow from "@/components/ResumeRow";

export const revalidate = 600;

const MAX_SHELVES = 6;

export default async function HomePage() {
  const sections = await getHome();
  const banner = sections.find((s) => s.section === "Banner");
  const shelves = sections.filter((s) => s.section !== "Banner").slice(0, MAX_SHELVES);

  return (
    <div className="pt-2 sm:pt-4">
      <HeroCarousel items={banner?.items ?? []} />
      <div className="mt-6">
        <ResumeRow />
        {shelves.map((s) => (
          <MediaRow key={s.section} title={s.section} items={s.items.slice(0, 14)} moreHref="/browse/movies" />
        ))}
      </div>
      {!sections.length && (
        <p className="text-muted text-center py-20 px-4">Gagal memuat katalog. Coba refresh.</p>
      )}
    </div>
  );
}
