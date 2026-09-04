export async function sendOtpEmail(email: string, code: string) {
  const from = process.env.MAIL_FROM || "MovieArl <noreply@moviearl.vercel.app>";
  const subject = "Kode OTP MovieArl";
  const html = `<p>Kode OTP kamu: <b style="font-size:20px;letter-spacing:4px">${code}</b></p><p>Berlaku 5 menit.</p>`;
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    try {
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from, to: email, subject, html }),
      });
      if (r.ok) return true;
    } catch {}
  }
  const smtpHost = process.env.SMTP_HOST || process.env.MAIL_HOST;
  if (smtpHost) {
    try {
      // @ts-expect-error no types
      const nodemailer = await import("nodemailer");
      const tr = nodemailer.createTransport({
        host: smtpHost,
        port: Number(process.env.SMTP_PORT || process.env.MAIL_PORT || 587),
        secure: process.env.SMTP_SECURE === "true" || process.env.MAIL_ENCRYPTION === "ssl",
        auth: process.env.SMTP_USER || process.env.MAIL_USERNAME ? { user: process.env.SMTP_USER || process.env.MAIL_USERNAME!, pass: process.env.SMTP_PASS || process.env.MAIL_PASSWORD! } : undefined,
      });
      await tr.sendMail({ from, to: email, subject, html });
      return true;
    } catch (e) { console.log("smtp fail", String(e).slice(0,200)); }
  }
  console.log(`[OTP] ${email} code=${code}`);
  return false;
}
