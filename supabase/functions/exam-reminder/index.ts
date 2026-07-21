// Run daily at 8AM IST (02:30 UTC).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { groqText } from "../_shared/groq.ts";
import { emailShell, sendResend } from "../_shared/email.ts";

const APP_URL = Deno.env.get("APP_URL") ?? "https://studyraven.ai";
const SYSTEM = `You are a study coach writing a brief HTML email body (under 150 words) about an upcoming exam. Be calm, encouraging, give one specific tip for the time remaining. Output only HTML body content.`;

Deno.serve(async () => {
  const sb = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const targets = [7, 3, 1];
  const todayUTC = new Date();
  todayUTC.setUTCHours(0, 0, 0, 0);

  const datesToCheck = targets.map((d) => {
    const x = new Date(todayUTC);
    x.setUTCDate(x.getUTCDate() + d);
    return { days: d, date: x.toISOString().slice(0, 10) };
  });

  const { data: subjects } = await sb
    .from("subjects")
    .select("user_id, name, exam_date")
    .in("exam_date", datesToCheck.map((d) => d.date));

  if (!subjects?.length) return new Response("0 exam reminders");

  let sent = 0;
  for (const s of subjects) {
    const days = datesToCheck.find((d) => d.date === s.exam_date)?.days ?? 0;
    const { data: profile } = await sb
      .from("profiles")
      .select("name, email")
      .eq("id", s.user_id)
      .maybeSingle();
    if (!profile?.email) continue;

    try {
      const body = await groqText(
        SYSTEM,
        `Student: ${profile.name || "there"}\nSubject: ${s.name}\nDays until exam: ${days}`,
      );
      await sendResend(
        profile.email,
        `${s.name} exam in ${days} day${days === 1 ? "" : "s"}`,
        emailShell(`${s.name} — ${days} day${days === 1 ? "" : "s"} to go`, body, APP_URL),
      );
      sent++;
    } catch (e) {
      console.error(`exam-reminder failed for ${profile.email}:`, e);
    }
  }

  return new Response(`Sent ${sent} exam reminders`);
});
