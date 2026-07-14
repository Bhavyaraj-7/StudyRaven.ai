import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { groqJson } from "@/lib/groq";
import { topicsForCode } from "@/lib/igcse-topics";
import type { DayPlan } from "@/types";

export const maxDuration = 60;

const SYSTEM = `You are an IGCSE study coach. Generate a balanced 7-day study plan as JSON.
Output JSON shape: { "plan": [ { "day": "Mon", "tasks": [ { "title": string, "subject": string, "minutes": number } ] } ] }

Structure: exactly 7 days, exactly 3 tasks per day, mix subjects across the week.

Task quality rules:
- Every task names a REAL syllabus topic from the provided topic lists — never a bare subject ("Revise algebra" is banned; "Solve 10 simultaneous-equations problems, Ch. 2 exercise style" is right).
- Rotate task types across the week: (a) learn/review a topic with notes, (b) active recall — self-quiz or flashcards on a topic studied 2-3 days earlier, (c) past-paper practice — a specific number of questions on one topic, timed.
- Vary minutes realistically: 25-60 per task, lighter on weekdays, one longer session on the weekend.
- If exam dates are provided, weight the nearest exams heaviest and say why in the title ("Physics exam in 12 days — timed paper 2 practice").
- If a test schedule is provided, prioritize those subjects/topics first.
- Sunday includes one review task covering the week's weakest area.`;

export async function POST(req: Request) {
  const sb = supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const testSchedule = (body?.test_schedule as string) || "";

  const [{ data: profile }, { data: subjects }] = await Promise.all([
    sb.from("profiles").select("name, grade, curriculum").eq("id", user.id).maybeSingle(),
    sb.from("subjects").select("name, code, exam_date").eq("user_id", user.id),
  ]);

  // Ground every task in the real Cambridge syllabus for the student's codes.
  const topicBlock = (subjects ?? [])
    .map((s) => {
      const topics = topicsForCode(s.code);
      if (!topics.length) return null;
      return `${s.name}: ${topics.slice(0, 12).join("; ")}`;
    })
    .filter(Boolean)
    .join("\n");

  const today = new Date().toISOString().slice(0, 10);

  const userMsg = `Student profile:
- Grade ${profile?.grade ?? "10"} ${profile?.curriculum ?? "IGCSE"}
- Today's date: ${today}
- Subjects: ${(subjects ?? []).map((s) => `${s.name}${s.code ? ` (${s.code})` : ""}${s.exam_date ? ` exam ${s.exam_date}` : ""}`).join(", ") || "Mathematics, Physics, Chemistry"}
${topicBlock ? `\nReal syllabus topics per subject (use these EXACT topic names in tasks):\n${topicBlock}` : ""}
${testSchedule ? `- Test schedule provided by student:\n${testSchedule.slice(0, 4000)}` : "- No test schedule provided — balance the plan across the subjects above."}

Build a 7-day plan starting today.`;

  try {
    const json = await groqJson<{ plan: DayPlan[] }>(SYSTEM, userMsg, {
      temperature: 0.5,
      maxTokens: 2200,
    });
    return NextResponse.json(json);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
