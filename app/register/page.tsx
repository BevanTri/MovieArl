"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export default function RegisterPage() {
  const [name,setName]=useState(""); const [email,setEmail]=useState(""); const [pw,setPw]=useState(""); const [cpw,setCpw]=useState(""); const [msg,setMsg]=useState(""); const [loading,setLoading]=useState(false);
  const [show,setShow]=useState(false); const [show2,setShow2]=useState(false);
  const router=useRouter();
  async function submit(e:React.FormEvent){e.preventDefault(); setLoading(true); setMsg("");
    const r=await fetch("/api/auth/register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name,email,password:pw,confirm:cpw})});
    const j=await r.json().catch(()=>({})); setLoading(false);
    if(!r.ok) setMsg(j.error||"Gagal"); else router.push(`/register/verify?email=${encodeURIComponent(email)}`);
  }
  return (
    <div className="pt-16 pb-16 px-4 max-w-md mx-auto">
      <div className="bg-theme-surface border border-theme-line/60 rounded-2xl p-8 shadow-card">
        <h1 className="font-display text-2xl text-theme-ink text-center">Daftar</h1>
        <p className="text-sm text-theme-muted text-center mt-1">Buat akun MovieArl</p>
        <p className="text-xs text-theme-muted text-center mt-1 mb-6">Setelah mendaftar, kamu akan menerima kode OTP via email (berlaku 5 menit).</p>
        <form onSubmit={submit} className="space-y-3">
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Nama" className="w-full px-3 py-2.5 rounded-xl bg-theme-input border border-theme-line text-sm text-theme-ink placeholder:text-theme-muted focus:ring-2 focus:ring-rausch/30 focus:border-rausch" required autoComplete="name" />
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" type="email" className="w-full px-3 py-2.5 rounded-xl bg-theme-input border border-theme-line text-sm text-theme-ink placeholder:text-theme-muted focus:ring-2 focus:ring-rausch/30" required autoComplete="email" />
          <div className="relative">
            <input value={pw} onChange={e=>setPw(e.target.value)} placeholder="Password (min 8)" type={show?"text":"password"} className="w-full px-3 py-2.5 pr-10 rounded-xl bg-theme-input border border-theme-line text-sm text-theme-ink placeholder:text-theme-muted focus:ring-2 focus:ring-rausch/30" required autoComplete="new-password" />
            <button type="button" onClick={()=>setShow(!show)} className="absolute right-3 inset-y-0 flex items-center text-theme-muted hover:text-theme-ink" aria-label={show?"Sembunyikan":"Tampilkan"}>{show?"🙈":"👁️"}</button>
          </div>
          <div className="relative">
            <input value={cpw} onChange={e=>setCpw(e.target.value)} placeholder="Konfirmasi password" type={show2?"text":"password"} className="w-full px-3 py-2.5 pr-10 rounded-xl bg-theme-input border border-theme-line text-sm text-theme-ink placeholder:text-theme-muted focus:ring-2 focus:ring-rausch/30" required autoComplete="new-password" />
            <button type="button" onClick={()=>setShow2(!show2)} className="absolute right-3 inset-y-0 flex items-center text-theme-muted hover:text-theme-ink" aria-label={show2?"Sembunyikan":"Tampilkan"}>{show2?"🙈":"👁️"}</button>
          </div>
          <button disabled={loading} className="w-full py-3 rounded-xl bg-rausch text-white font-semibold text-sm disabled:opacity-50 hover:bg-rausch-active active:scale-[0.98] transition-all">{loading?"Mengirim...":"Daftar & Kirim OTP"}</button>
        </form>
        <div className="flex items-center gap-3 my-6"><div className="flex-1 h-px bg-theme-line/40" /><span className="text-xs text-theme-muted">atau</span><div className="flex-1 h-px bg-theme-line/40" /></div>
        <a id="google-register" href="/api/auth/google/start" className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl bg-theme-surface border border-theme-line/40 text-theme-ink-2 font-semibold text-sm hover:bg-theme-surface-2/50 active:scale-[0.98] transition-all">
          <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
          Daftar dengan Google
        </a>
        {msg && <p className="text-xs text-rausch text-center mt-3">{msg}</p>}
        <p className="text-xs text-theme-muted text-center mt-4">Sudah punya akun? <a href="/login" className="text-rausch hover:text-rausch-active">Masuk</a></p>
      </div>
    </div>
  );
}
