"use client";
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="pt-24 pb-16 text-center px-4">
      <p className="font-display text-xl font-bold mb-2">Ups — ada yang error</p>
      <p className="text-muted text-sm mb-1">{error.message || "Coba refresh halaman."}</p>
      {error.digest && <p className="text-xs text-muted/60 mb-4">#{error.digest}</p>}
      <button onClick={reset} className="px-6 py-2.5 rounded-xl bg-rausch text-white font-semibold text-sm active:scale-[0.97]">Coba Lagi</button>
    </div>
  );
}
