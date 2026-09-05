"use client";
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="pt-24 pb-16 text-center px-4">
      <p className="font-display text-xl font-bold mb-2">This page couldn&apos;t load</p>
      <p className="text-theme-muted text-sm mb-1">{error.message || "Reload to try again, or go back."}</p>
      {error.digest && <p className="text-xs text-theme-muted/60 mb-4">#{error.digest}</p>}
      <div className="flex gap-3 justify-center mt-4">
        <button onClick={() => reset()} className="px-6 py-2.5 rounded-xl bg-rausch text-white font-semibold text-sm active:scale-[0.97]">Reload</button>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/" className="px-6 py-2.5 rounded-xl bg-theme-surface border border-theme-line text-sm">Back</a>
      </div>
    </div>
  );
}
