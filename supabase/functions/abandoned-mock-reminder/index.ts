// Run every 30 minutes. Finds mock tests started 2+ hours ago that were
// never submitted, and sends one comeback reminder per attempt.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { groqText } from "../_shared/groq.ts";
import { emailShell, sendResend } from "../_shared/email.ts";

const APP_URL = Deno.env.get("APP_URL") ?? "https://studyraven.ai";
const ABANDONED_AFTER_HOURS = 2;

const SYSTEM = `You are a friendly IGCSE study coach. Write a short HTML email body (under 100 words) nudging a student to go back and finish a mock test they started but never submitted. Warm, no guilt-tripping, one line encouraging them to finish while it's fresh. Output only HTML body content with <p> tags.`;

Deno.serve(async () => {
  const sb = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const cutoff = new Date(Date.now() - ABANDONED_AFTER_HOURS * 60 * 60 * 1000).toISOString();

  const { data: attempts } = await sb
    .from("mock_attempts")
    .select("id, user_id, subject_name, started_at")
    .is("completed_at", null)
    .eq("reminder_sent", false)
    .lte("started_at", cutoff);

  if (!attempts?.length) return new Response("0 abandoned mocks");

  let sent = 0;
  for (const a of attempts) {
    const { data: profile } = await sb
      .from("profiles")
      .select("name, email")
      .eq("id", a.user_id)
      .maybeSingle();

    // Always flag as handled first so a repeated failure can't loop forever
    // and spam retries — worst case we skip one reminder, never send twice.
    await sb.from("mock_attempts").update({ reminder_sent: true }).eq("id", a.id);

    if (!profile?.email) continue;

    try {
      const body = await groqText(
        SYSTEM,
        `Student: ${profile.name || "there"}\nSubject: ${a.subject_name}\nStarted: ${a.started_at}`,
      );
      await sendResend(
        profile.email,
        `Finish your ${a.subject_name} mock?`,
        emailShell(`You left a ${a.subject_name} mock unfinished`, body, APP_URL),
      );
      sent++;
    } catch (e) {
      console.error(`abandoned-mock-reminder failed for ${profile.email}:`, e);
    }
  }

  return new Response(`Sent ${sent} abandoned-mock reminders`);
});
