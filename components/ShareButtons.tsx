"use client";
export default function ShareButtons({ title, slug }: { title: string; slug: string }) {
  const url = typeof window !== "undefined" ? `${window.location.origin}/detail/${encodeURIComponent(slug)}` : `/detail/${slug}`;
  const text = `Nonton ${title} di MovieArl`;
  const copy = async () => {
    try { await navigator.clipboard.writeText(url); alert("Link disalin!"); } catch { alert(url); }
  };
  return (
    <div className="flex items-center gap-2 mt-3">
      <button onClick={copy} className="px-3 py-1.5 rounded-full surface border border-line/50 text-xs text-muted hover:text-ink">📋 Salin Link</button>
      <a href={`https://wa.me/?text=${encodeURIComponent(text + " " + url)}`} target="_blank" rel="noopener" className="px-3 py-1.5 rounded-full bg-[#25D366] text-white text-xs font-medium">WA</a>
      <a href={`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`} target="_blank" rel="noopener" className="px-3 py-1.5 rounded-full bg-[#229ED9] text-white text-xs font-medium">Telegram</a>
      <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`} target="_blank" rel="noopener" className="px-3 py-1.5 rounded-full bg-black text-white text-xs font-medium">X</a>
    </div>
  );
}
