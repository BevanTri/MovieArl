"use client";
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="id">
      <body className="bg-theme-bg text-theme-ink flex items-center justify-center min-h-dvh p-6">
        <div className="text-center max-w-md">
          <p className="font-display text-xl font-bold mb-2">Ups — gagal memuat</p>
          <p className="text-sm text-theme-muted mb-4">{error.message || "Coba reload."}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => reset()} className="px-6 py-2.5 rounded-xl bg-rausch text-white font-semibold text-sm">Reload</button>
            <a href="/" className="px-6 py-2.5 rounded-xl bg-theme-surface border border-theme-line text-sm">Back</a>
          </div>
        </div>
      </body>
    </html>
  );
}
