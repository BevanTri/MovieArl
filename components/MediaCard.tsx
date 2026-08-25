import Link from "next/link";
import Image from "next/image";
import type { MediaItem } from "@/lib/moviebox";

const SIZES =
  "(max-width: 420px) 30vw, (max-width: 640px) 24vw, (max-width: 768px) 19vw, (max-width: 1280px) 13vw, 176px";

export default function MediaCard({
  item,
  variant = "grid",
}: {
  item: MediaItem;
  variant?: "row" | "grid";
}) {
  if (!item.slug) return null;

  const isHot = item.badge && /hot|vip|prem/i.test(item.badge);

  return (
    <Link
      href={`/detail/${item.slug}`}
      className={`group/card relative block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch rounded-xl ${
        variant === "row" ? "shrink-0 w-32 sm:w-44 snap-start" : "w-full"
      }`}
    >
      {isHot && (
        <span className="absolute top-2 left-2 z-10 inline-block whitespace-nowrap px-2 py-0.5 text-[10px] font-bold rounded text-white shadow-md bg-rausch">
          {item.badge}
        </span>
      )}

      <div className="relative aspect-[3/4] frame-card overflow-hidden">
        {item.posterUrl ? (
          <Image
            src={item.posterUrl}
            alt={item.name ?? ""}
            fill
            sizes={SIZES}
            loading={variant === "row" ? "lazy" : "lazy"}
            className="w-full h-full object-cover rounded-lg skeleton group-hover/card:scale-[1.03] transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted text-xs p-2 text-center">
            {item.name}
          </div>
        )}
        {item.rating && (
          <span className="absolute top-2 right-2 text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-goldchip/90 text-black">
            ★ {item.rating}
          </span>
        )}
      </div>

      <div className="p-1.5">
        <h3 className="text-xs sm:text-sm font-semibold text-ink line-clamp-2 leading-snug group-hover/card:text-rausch transition-colors duration-200">
          {item.name}
        </h3>
        {item.year && <p className="text-[11px] text-muted mt-0.5">{item.year}</p>}
      </div>
    </Link>
  );
}
