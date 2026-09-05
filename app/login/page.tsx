"use client";

import { useUser } from "@/components/useUser";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.push("/");
  }, [loading, user, router]);

  return (
    <div className="pt-16 sm:pt-24 pb-16 px-4 max-w-md mx-auto animate-slide-up">
      <div className="bg-theme-surface border border-theme-line/60 rounded-2xl p-8 sm:p-10 text-center shadow-card-lg">
        <p className="font-display text-3xl text-theme-ink">
          Movie<span className="text-rausch">Arl</span>
        </p>
        <p className="text-sm text-theme-muted mt-2 mb-8">Masuk buat identitasmu tersimpan.</p>

        {!loading && user ? (
          <div className="space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-rausch text-white flex items-center justify-center text-xl font-bold overflow-hidden">
              {user.picture ? (
                <img src={user.picture} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                (user.name ?? "U").charAt(0)
              )}
            </div>
            <p className="font-semibold text-ink">{user.name}</p>
            <p className="text-xs text-muted">{user.email}</p>
            <a href="/api/auth/logout" className="text-xs text-muted hover:text-rausch underline">
              Keluar
            </a>
            <DeleteAccount />
          </div>
        ) : (
          <>
            <a
              id="google-login"
              href="/api/auth/google/start"
              className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl bg-theme-surface border border-theme-line/40 text-theme-ink-2 font-semibold text-sm hover:bg-theme-surface-2/50 active:scale-[0.98] transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden>
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Masuk dengan Google
            </a>
            <PasswordForm />
          </>
        )}

        <p className="text-[11px] text-muted/70 mt-8 leading-relaxed">
          Favorit & riwayat tetap disimpan di perangkat ini.
        </p>
      </div>
    </div>
  );
}

function PasswordForm() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setMsg("");
    const r = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password: pw, remember }) });
    const j = await r.json().catch(() => ({})); setLoading(false);
    if (!r.ok) setMsg(j.error || "Gagal"); else window.location.assign("/");
  }
  return (
    <form onSubmit={submit} className="mt-6 pt-6 border-t border-theme-line/30 space-y-3">
      <p className="text-xs text-theme-muted text-center">atau login password</p>
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" className="w-full px-3 py-2.5 rounded-xl bg-theme-input border border-theme-line text-sm text-theme-ink placeholder:text-theme-muted focus:ring-2 focus:ring-rausch/30" required autoComplete="username" />
      <div className="relative">
        <input value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Password" type={show?"text":"password"} className="w-full px-3 py-2.5 pr-10 rounded-xl bg-theme-input border border-theme-line text-sm text-theme-ink placeholder:text-theme-muted focus:ring-2 focus:ring-rausch/30" required autoComplete="current-password" />
        <button type="button" onClick={()=>setShow(!show)} className="absolute right-3 inset-y-0 flex items-center text-theme-muted hover:text-theme-ink" aria-label={show?"Sembunyikan":"Tampilkan"}>{show?"🙈":"👁️"}</button>
      </div>
      <label className="flex items-center gap-2 text-xs text-theme-muted"><input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)} className="rounded border-theme-line bg-theme-surface-2/50 text-rausch focus:ring-rausch/30" /> Ingat saya</label>
      <button disabled={loading} className="w-full py-2.5 rounded-xl bg-rausch text-white font-semibold text-sm hover:bg-rausch-active disabled:opacity-50 active:scale-[0.97]">Masuk</button>
      {msg && <p className="text-xs text-rausch text-center">{msg}</p>}
      <p className="text-xs text-center"><a href="/forgot-password" className="text-theme-muted hover:text-rausch">Lupa password?</a> · <a href="/register" className="text-rausch">Daftar</a></p>
    </form>
  );
}

function DeleteAccount() {
  const [step, setStep] = useState("idle");
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  async function request() {
    setLoading(true);
    const r = await fetch("/api/auth/delete/request", { method: "POST" });
    const j = await r.json().catch(() => ({}));
    setLoading(false);
    if (!r.ok) alert(j.error || "Gagal");
    else setStep("code");
  }
  async function verify() {
    setLoading(true); setMsg("");
    const r = await fetch("/api/auth/delete/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code }) });
    const j = await r.json().catch(() => ({}));
    setLoading(false);
    if (!r.ok) setMsg(j.error || "Gagal");
    else window.location.assign("/");
  }
  if (step === "idle") {
    return (
      <div className="mt-6 pt-6 border-t border-line/50 text-left">
        <p className="text-xs text-muted mb-2">Hapus akun permanen (butuh OTP email):</p>
        <button onClick={request} disabled={loading} className="w-full py-2 text-sm text-rausch hover:underline disabled:opacity-50">
          {loading ? "Mengirim..." : "Kirim OTP Hapus Akun"}
        </button>
      </div>
    );
  }
  if (step === "code") {
    return (
      <div className="mt-6 pt-6 border-t border-line/50 text-left">
        <p className="text-xs text-muted mb-2">Hapus akun permanen (butuh OTP email):</p>
        <div className="flex gap-2 mt-2">
          <input value={code} onChange={e => setCode(e.target.value)} placeholder="6 digit" className="flex-1 px-3 py-2 rounded-xl bg-surface2 border border-line text-sm tracking-[0.3em] text-center" required />
          <button onClick={() => setStep("confirm")} disabled={loading || code.length < 6} className="px-3 py-2 rounded-xl bg-rausch text-white text-sm font-semibold disabled:opacity-50">
            Lanjut
          </button>
        </div>
        {msg && <p className="text-xs text-rausch mt-2">{msg}</p>}
      </div>
    );
  }
  return (
    <div className="mt-6 pt-6 border-t border-line/50 text-left">
      <p className="text-xs text-muted mb-2">Hapus akun permanen (butuh OTP email):</p>
      <div className="flex gap-2 mt-2">
        <p className="text-xs text-muted self-center">Yakin hapus permanen?</p>
        <button onClick={verify} disabled={loading} className="px-3 py-2 rounded-xl bg-rausch text-white text-sm font-semibold disabled:opacity-50">
          Ya, Hapus
        </button>
        <button onClick={() => setStep("code")} disabled={loading} className="px-3 py-2 rounded-xl text-sm text-muted hover:text-ink disabled:opacity-50">
          Batal
        </button>
      </div>
      {msg && <p className="text-xs text-rausch mt-2">{msg}</p>}
    </div>
  );
}