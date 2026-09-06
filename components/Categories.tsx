"use client";
import Link from "next/link";

const CATS = [
  { label: "All", href: "/browse/movies", icon: "◯" },
  { label: "Indonesia", href: "/browse/movies?country=Indonesia", color: "from-red-900/80 to-red-700/60" },
  { label: "Hollywood", href: "/browse/movies?country=USA", color: "from-blue-900/80 to-cyan-800/60" },
  { label: "Horror movies", href: "/browse/movies?genre=Horror", color: "from-zinc-900 to-zinc-700" },
  { label: "Indo Dub", href: "/browse/movies?lang=Indo", color: "from-purple-900/40 to-fuchsia-900/30" },
  { label: "Action", href: "/browse/movies?genre=Action", color: "from-violet-900/80 to-purple-800/60" },
  { label: "Romance", href: "/browse/movies?genre=Romance", color: "from-rose-900/80 to-pink-900/60" },
  { label: "Comedy", href: "/browse/movies?genre=Comedy", color: "from-amber-900/60 to-yellow-800/40" },
  { label: "Sci-Fi", href: "/browse/movies?genre=Sci-Fi", color: "from-emerald-900/70 to-teal-800/50" },
];

export default function Categories() {
  return (
    <section className="mb-8 sm:mb-10">
      <h2 className="text-base sm:text-lg font-display font-bold text-theme-ink mb-4">Categories</h2>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        {CATS.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className={`shrink-0 snap-start relative w-36 sm:w-40 h-20 sm:h-24 rounded-xl overflow-hidden flex items-center px-4 font-semibold text-white text-sm shadow-card border border-white/10 bg-gradient-to-br ${c.color} hover:scale-[1.02] active:scale-[0.98] transition-transform`}
          >
            <span className="relative z-10 drop-shadow">{c.label}</span>
            {c.label === "All" && <span className="ml-auto text-lg">⚙</span>}
          </Link>
        ))}
      </div>
    </section>
  );
}
