"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export default function RegisterPage() {
  const [name,setName]=useState(""); const [email,setEmail]=useState(""); const [pw,setPw]=useState(""); const [cpw,setCpw]=useState(""); const [msg,setMsg]=useState(""); const [loading,setLoading]=useState(false);
  const router=useRouter();
  async function submit(e:React.FormEvent){e.preventDefault(); setLoading(true); setMsg("");
    const r=await fetch("/api/auth/register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name,email,password:pw,confirm:cpw})});
    const j=await r.json().catch(()=>({})); setLoading(false);
    if(!r.ok) setMsg(j.error||"Gagal"); else router.push(`/register/verify?email=${encodeURIComponent(email)}`);
  }
  return (
    <div className="pt-16 pb-16 px-4 max-w-md mx-auto">
      <div className="surface border border-line/60 rounded-2xl p-8 shadow-card">
        <h1 className="font-display text-2xl text-ink text-center">Daftar</h1>
        <p className="text-sm text-muted text-center mt-1 mb-6">Buat akun MovieArl</p>
        <form onSubmit={submit} className="space-y-3">
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Nama" className="w-full px-3 py-2.5 rounded-xl bg-surface2 border border-line text-sm" required />
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" type="email" className="w-full px-3 py-2.5 rounded-xl bg-surface2 border border-line text-sm" required />
          <input value={pw} onChange={e=>setPw(e.target.value)} placeholder="Password (min 8)" type="password" className="w-full px-3 py-2.5 rounded-xl bg-surface2 border border-line text-sm" required />
          <input value={cpw} onChange={e=>setCpw(e.target.value)} placeholder="Konfirmasi password" type="password" className="w-full px-3 py-2.5 rounded-xl bg-surface2 border border-line text-sm" required />
          <button disabled={loading} className="w-full py-3 rounded-xl bg-rausch text-white font-semibold text-sm disabled:opacity-50">{loading?"Mengirim...":"Daftar & Kirim OTP"}</button>
        </form>
        {msg && <p className="text-xs text-rausch text-center mt-3">{msg}</p>}
        <p className="text-xs text-muted text-center mt-4">Sudah punya akun? <a href="/login" className="text-rausch">Masuk</a></p>
      </div>
    </div>
  );
}
