// Run daily at 7AM IST (01:30 UTC).
// Schedule with: supabase functions deploy deadline-reminder; then in Supabase Studio → Database → Cron.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { groqText } from "../_shared/groq.ts";
import { emailShell, sendResend } from "../_shared/email.ts";

const APP_URL = Deno.env.get("APP_URL") ?? "https://studyraven.ai";

const SYSTEM = `You are a friendly study coach writing to one student. Write a short HTML email body (under 120 words) reminding them about a deadline. Tone: warm, motivating, second person. Output only HTML body content (no <html> tags). Use <p> tags.`;

Deno.serve(async () => {
  const sb = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const in2Days = new Date(Date.now() + 2 * 86400_000).toISOString();
  const today = new Date().toISOString();

  const { data: tasks } = await sb
    .from("tasks")
    .select("id, user_id, title, due_date")
    .gte("due_date", today)
    .lte("due_date", in2Days)
    .neq("status", "done");

  if (!tasks?.length) return new Response("0 reminders");

  let sent = 0;
  for (const t of tasks) {
    const { data: profile } = await sb
      .from("profiles")
      .select("name, email")
      .eq("id", t.user_id)
      .maybeSingle();
    if (!profile?.email) continue;

    try {
      const body = await groqText(
        SYSTEM,
        `Student name: ${profile.name || "there"}\nTask: ${t.title}\nDue: ${t.due_date}`,
      );
      await sendResend(
        profile.email,
        `Heads up — ${t.title} is due soon`,
        emailShell(`Heads up — ${t.title}`, body, APP_URL),
      );
      sent++;
    } catch (e) {
      console.error(`deadline-reminder failed for ${profile.email}:`, e);
    }
  }

  return new Response(`Sent ${sent} reminders`);
});
