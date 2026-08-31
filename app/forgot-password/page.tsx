"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export default function ForgotPage(){
  const [email,setEmail]=useState(""); const [code,setCode]=useState(""); const [pw,setPw]=useState(""); const [cpw,setCpw]=useState(""); const [step,setStep]=useState<"email"|"reset">("email"); const [msg,setMsg]=useState(""); const [loading,setLoading]=useState(false);
  const router=useRouter();
  async function reqOtp(e:React.FormEvent){e.preventDefault(); setLoading(true); setMsg("");
    const r=await fetch("/api/auth/forgot",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email})});
    const j=await r.json().catch(()=>({})); setLoading(false);
    if(!r.ok) setMsg(j.error||"Gagal"); else {setStep("reset"); setMsg("Kode dikirim ke email");}
  }
  async function reset(e:React.FormEvent){e.preventDefault(); setLoading(true);
    const r=await fetch("/api/auth/reset",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,code,password:pw,confirm:cpw})});
    const j=await r.json().catch(()=>({})); setLoading(false);
    if(!r.ok) setMsg(j.error||"Gagal"); else router.push("/login");
  }
  return (
    <div className="pt-16 pb-16 px-4 max-w-md mx-auto">
      <div className="surface border border-line/60 rounded-2xl p-8 shadow-card">
        <h1 className="font-display text-xl text-ink text-center">Lupa Password</h1>
        {step==="email" ? (
          <form onSubmit={reqOtp} className="space-y-3 mt-6">
            <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email terdaftar" type="email" className="w-full px-3 py-2.5 rounded-xl bg-surface2 border border-line text-sm" required />
            <button disabled={loading} className="w-full py-3 rounded-xl bg-rausch text-white font-semibold text-sm disabled:opacity-50">{loading?"Mengirim...":"Kirim OTP"}</button>
          </form>
        ) : (
          <form onSubmit={reset} className="space-y-3 mt-6">
            <input value={code} onChange={e=>setCode(e.target.value)} placeholder="Kode OTP" className="w-full px-3 py-2.5 rounded-xl bg-surface2 border border-line text-sm tracking-[0.3em] text-center" required />
            <input value={pw} onChange={e=>setPw(e.target.value)} placeholder="Password baru" type="password" className="w-full px-3 py-2.5 rounded-xl bg-surface2 border border-line text-sm" required />
            <input value={cpw} onChange={e=>setCpw(e.target.value)} placeholder="Konfirmasi" type="password" className="w-full px-3 py-2.5 rounded-xl bg-surface2 border border-line text-sm" required />
            <button disabled={loading} className="w-full py-3 rounded-xl bg-rausch text-white font-semibold text-sm disabled:opacity-50">{loading?"Menyimpan...":"Reset Password"}</button>
          </form>
        )}
        {msg && <p className="text-xs text-muted text-center mt-3">{msg}</p>}
        <p className="text-xs text-muted text-center mt-4"><a href="/login" className="text-rausch">Kembali login</a></p>
      </div>
    </div>
  );
}
