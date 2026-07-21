import { NextResponse } from "next/server";
import { supabaseServer, supabaseAdmin } from "@/lib/supabase-server";
import { sendEmail } from "@/lib/resend";

export const runtime = "nodejs";

/**
 * Fired once, right after onboarding completes — the first point the
 * student is a real, committed user rather than a dropped signup.
 * Idempotent on welcome_email_sent_at so a retry or double-call never
 * sends it twice.
 */
export async function POST() {
  const sb = supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const admin = supabaseAdmin();
  const { data: profile } = await admin
    .from("profiles")
    .select("name, email, welcome_email_sent_at, unsubscribed")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.email || profile.welcome_email_sent_at || profile.unsubscribed) {
    return NextResponse.json({ skipped: true });
  }

  const firstName = (profile.name || "").split(" ")[0] || "there";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  try {
    await sendEmail({
      to: profile.email,
      subject: "Welcome to StudyRaven — here's what's free vs Pro",
      title: `Hey ${firstName}, you're in`,
      body: `
        <p>StudyRaven is built to actually get you through your exams — an AI tutor grounded in your own papers, mock exams marked against the real scheme, and a college guide when you're ready for that.</p>
        <p style="margin-top:16px"><strong>Free, right now:</strong> study planner, mock tests, 5 AI generations a day, deadline reminders.</p>
        <p><strong>Pro (₹299/mo or ₹2,499/yr):</strong> unlimited generations, the full AI tutor with chat + your own paper library, college guidance, and score prediction.</p>
        <p style="margin-top:20px"><a href="${appUrl}/dashboard" style="display:inline-block;background:#0A0A0A;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none">Go to your dashboard</a></p>
      `,
    });
    await admin
      .from("profiles")
      .update({ welcome_email_sent_at: new Date().toISOString() })
      .eq("id", user.id);
    return NextResponse.json({ sent: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
