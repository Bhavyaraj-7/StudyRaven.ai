import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { groqChat } from "@/lib/groq";
import { sendEmail } from "@/lib/resend";

export const maxDuration = 60;

const SYSTEM = `You are an IGCSE study coach. Build a 4-week study schedule as a Markdown plan, week by week, with daily blocks. Include rest days. Keep it tight and actionable. Use ## for each week.`;

export async function POST(req: Request) {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { kind, content } = await req.json();

  if (kind === "plan") {
    const [{ data: profile }, { data: subjects }] = await Promise.all([
      sb.from("profiles").select("grade, curriculum").eq("id", user.id).maybeSingle(),
      sb.from("subjects").select("name, exam_date").eq("user_id", user.id),
    ]);
    const userMsg = `Grade ${profile?.grade ?? 10} ${profile?.curriculum ?? "IGCSE"}.
Subjects: ${(subjects ?? []).map((s) => `${s.name}${s.exam_date ? ` exam ${s.exam_date}` : ""}`).join(", ") || "Maths, Physics, Chemistry"}`;
    const markdown = await groqChat(SYSTEM, userMsg, { maxTokens: 2200 });
    return NextResponse.json({ markdown });
  }

  if (kind === "reminders") {
    const { data: subjects } = await sb
      .from("subjects")
      .select("id, name, exam_date")
      .eq("user_id", user.id)
      .not("exam_date", "is", null);
    const tasksToInsert = (subjects ?? []).flatMap((s) =>
      [7, 3, 1].map((days) => {
        const due = new Date(s.exam_date as string);
        due.setDate(due.getDate() - days);
        return {
          user_id: user.id,
          subject_id: s.id,
          title: `${s.name} — ${days} day check-in`,
          due_date: due.toISOString(),
          status: "pending",
          priority: "high",
        };
      }),
    );
    if (tasksToInsert.length) {
      await sb.from("tasks").insert(tasksToInsert);
    }
    return NextResponse.json({ inserted: tasksToInsert.length });
  }

  if (kind === "email") {
    if (!user.email) return NextResponse.json({ error: "no email on account" }, { status: 400 });
    try {
      await sendEmail({
        to: user.email,
        subject: "Your StudyRaven study schedule",
        title: "Your study schedule",
        body: `<pre style="white-space:pre-wrap;font-family:inherit">${(content || "").replace(/</g, "&lt;")}</pre>`,
      });
      return NextResponse.json({ sent: true });
    } catch (e) {
      return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "invalid kind" }, { status: 400 });
}
