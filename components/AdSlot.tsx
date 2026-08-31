"use client";
export default function AdSlot({ id = "detail-top" }: { id?: string }) {
  // placeholder — ganti src/ data-ad-slot saat sudah ada ad network
  const enabled = process.env.NEXT_PUBLIC_ADSENSE_ID;
  if (!enabled) {
    return (
      <div data-ad={id} className="w-full h-20 rounded-xl surface border border-dashed border-line/40 flex items-center justify-center text-xs text-muted">
        AdSlot {id} — set NEXT_PUBLIC_ADSENSE_ID untuk aktif
      </div>
    );
  }
  return <div data-ad={id} className="w-full min-h-20 surface border border-line/40 rounded-xl" />;
}
