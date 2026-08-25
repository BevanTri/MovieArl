# 🎬 MovieArl

Streaming film, serial TV, dan animasi **subtitle Indonesia** — dibangun dengan Next.js 16 + TypeScript + Tailwind CSS v4.

## ✨ Fitur

- 🔍 **Live search** — dropdown instan dengan poster saat mengetik
- ▶️ **Player langsung** — MP4 multi-kualitas (360p–1080p) via proxy internal
- 💬 **Subtitle Indonesia** — auto WebVTT default, 13 bahasa tersedia
- ❤️ **Favorit** & 🕘 **Riwayat tonton** — tersimpan di perangkat
- ⏯️ **Lanjutkan Menonton** — lanjut ke episode terakhir dari beranda
- 📱 **Mobile-first** — bottom navigation, responsive sampai desktop
- 🔐 **Login Google** — NextAuth.js
- 🎠 Hero carousel + rak kategori bergaya bioskop

## 🚀 Menjalankan Lokal

```bash
npm install
npm run dev
```

Buka http://localhost:3001

## 🔑 Environment Variables

Salin `.env.example` → `.env.local`, lalu isi:

| Variable | Keterangan |
|---|---|
| `GOOGLE_CLIENT_ID` | OAuth client ID dari [Google Cloud Console](https://console.cloud.google.com/apis/credentials) |
| `GOOGLE_CLIENT_SECRET` | OAuth client secret |
| `NEXTAUTH_SECRET` | Random string (`node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`) |
| `NEXTAUTH_URL` | `http://localhost:3001` |

Callback URI di Google Console: `http://localhost:3001/api/auth/callback/google`

## 🏗️ Arsitektur

```
app/
├─ api/
│  ├─ auth/[...nextauth]/   Login Google (NextAuth)
│  ├─ caption/route.ts      Proxy SRT→VTT subtitle
│  ├─ search/suggest/       Live search JSON
│  └─ video/route.ts        Proxy video (Range + Referer injection)
├─ browse/[tab]/            Film · Serial · Animasi (+ sort & pagination)
├─ detail/[slug]/           Detail + daftar episode + favorit
├─ watch/[slug]/            Player + pilih episode
├─ favorit/ · riwayat/ · login/
lib/moviebox.ts             Client API themoviebox.xyz (JWT guest otomatis)
components/                 Player, HeroCarousel, LiveSearch, BottomNav, ...
```

## ⚙️ Catatan Teknis

- **Sumber data**: API tidak resmi MovieBox (`themoviebox.xyz`) — metadata, katalog, dan stream. Tidak ada scraping HTML; semuanya endpoint JSON.
- **Proxy video**: CDN upstream menuntut header `Referer` tertentu yang tidak bisa dikirim browser — request video dipipakan lewat `/api/video` dengan dukungan HTTP Range agar seek berfungsi.
- **Subtitle**: upstream menyediakan `.srt`; route `/api/caption` mengonversi ke WebVTT on-the-fly karena `<track>` hanya menerima VTT.
- **Token**: JWT guest diambil otomatis dari header `x-user` dan diperbarui diam-diam.

## 📄 Lisensi

MIT
