import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabase-server";

export const resend = new Resend(process.env.RESEND_API_KEY);

// Until studyraven.ai is verified in Resend, fall back to their shared test
// address so sends don't silently fail. Set RESEND_FROM_EMAIL once verified.
const FROM = process.env.RESEND_FROM_EMAIL || "StudyRaven.ai <onboarding@resend.dev>";

export function emailShell(title: string, body: string) {
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
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/settings" style="color:#0A0A0A;text-decoration:underline">Manage preferences</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export async function sendEmail(args: {
  to: string;
  subject: string;
  title: string;
  body: string;
}) {
  return resend.emails.send({
    from: FROM,
    to: args.to,
    subject: args.subject,
    html: emailShell(args.title, args.body),
  });
}

/**
 * For lifecycle/marketing sends (welcome, mock results, upgrade nudges,
 * payment recovery) — anything the student didn't just click a button to
 * trigger. Checks the unsubscribe flag first so opting out in Settings
 * actually works. Transactional sends the user directly requested (e.g.
 * "email me this schedule") should call sendEmail() directly instead.
 */
export async function sendLifecycleEmail(
  userId: string,
  args: { subject: string; title: string; body: string },
) {
  const admin = supabaseAdmin();
  const { data: profile } = await admin
    .from("profiles")
    .select("email, unsubscribed")
    .eq("id", userId)
    .maybeSingle();

  if (!profile?.email || profile.unsubscribed) return { skipped: true };

  return sendEmail({ to: profile.email, ...args });
}
