export function emailShell(title: string, body: string, appUrl: string) {
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#F4F4F5;font-family:Inter,-apple-system,sans-serif;color:#0A0A0A">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid #E5E5E5;border-radius:12px;overflow:hidden">
        <tr><td style="padding:32px">
          <div style="font-family:'JetBrains Mono',monospace;font-weight:700;font-size:20px;letter-spacing:-0.02em">StudyRaven<span style="color:#8A8A8A">.ai</span></div>
          <h1 style="margin:24px 0 16px;font-size:28px;font-weight:600;line-height:1.2">${title}</h1>
          <div style="font-size:16px;line-height:1.6;color:#4A4A4A">${body}</div>
        </td></tr>
        <tr><td style="padding:20px 32px;border-top:1px solid #E5E5E5;font-size:12px;color:#8A8A8A">
          You are receiving this because you signed up at StudyRaven.ai.
          <a href="${appUrl}/settings" style="color:#0A0A0A;text-decoration:underline">Manage preferences</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

// Until studyraven.ai is verified in Resend, fall back to their shared test
// address so sends don't silently fail. Set RESEND_FROM_EMAIL once verified.
const FROM = Deno.env.get("RESEND_FROM_EMAIL") || "StudyRaven.ai <onboarding@resend.dev>";

// Logs failures instead of swallowing them, so one bad send shows up in
// Supabase function logs instead of vanishing silently. Callers should still
// wrap each user's send in try/catch so one failure doesn't stop the batch.
export async function sendResend(to: string, subject: string, html: string) {
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM,
      to,
      subject,
      html,
    }),
  });
  if (!r.ok) {
    const text = await r.text().catch(() => "");
    console.error(`Resend send to ${to} failed: ${r.status} ${text}`);
    throw new Error(`Resend ${r.status}: ${text}`);
  }
  return r;
}
