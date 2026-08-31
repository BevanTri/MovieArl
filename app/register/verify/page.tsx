"use client";
import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
export const dynamic = "force-dynamic";
function VerifyInner(){
  const sp=useSearchParams(); const email=sp.get("email")||""; const [code,setCode]=useState(""); const [msg,setMsg]=useState(""); const [loading,setLoading]=useState(false);
  const router=useRouter();
  async function submit(e:React.FormEvent){e.preventDefault(); setLoading(true);
    const r=await fetch("/api/auth/register/verify",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,code})});
    const j=await r.json().catch(()=>({})); setLoading(false);
    if(!r.ok) setMsg(j.error||"Gagal"); else router.push("/");
  }
  return (
    <div className="pt-16 pb-16 px-4 max-w-md mx-auto">
      <div className="surface border border-line/60 rounded-2xl p-8 shadow-card text-center">
        <h1 className="font-display text-xl text-ink">Verifikasi OTP</h1>
        <p className="text-sm text-muted mt-1 mb-6">Kode dikirim ke {email}</p>
        <form onSubmit={submit} className="space-y-3">
          <input value={code} onChange={e=>setCode(e.target.value)} placeholder="6 digit" className="w-full px-3 py-2.5 rounded-xl bg-surface2 border border-line text-sm tracking-[0.3em] text-center" required />
          <button disabled={loading} className="w-full py-3 rounded-xl bg-rausch text-white font-semibold text-sm disabled:opacity-50">{loading?"Memeriksa...":"Verifikasi"}</button>
        </form>
        {msg && <p className="text-xs text-rausch mt-3">{msg}</p>}
        <p className="text-xs text-muted mt-4"><a href={`/register?resend=${encodeURIComponent(email)}`} className="text-rausch">Kirim ulang</a></p>
      </div>
    </div>
  );
}
export default function VerifyPage(){ return <Suspense fallback={null}><VerifyInner/></Suspense>; }
