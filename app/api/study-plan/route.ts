import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { groqJson } from "@/lib/groq";
import type { DayPlan } from "@/types";

const SYSTEM = `You are an IGCSE study coach. Generate a balanced 7-day study plan as JSON.
Output JSON shape: { "plan": [ { "day": "Mon", "tasks": [ { "title": string, "subject": string, "minutes": number } ] } ] }
Exactly 7 days. Exactly 3 tasks per day. Mix subjects. Keep titles concise and actionable.
If a test schedule is provided, prioritize subjects/topics with the nearest test dates. Otherwise balance evenly across the student's subjects.`;

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

  const userMsg = `Student profile:
- Grade ${profile?.grade ?? "10"} ${profile?.curriculum ?? "IGCSE"}
- Subjects: ${(subjects ?? []).map((s) => `${s.name}${s.code ? ` (${s.code})` : ""}${s.exam_date ? ` exam ${s.exam_date}` : ""}`).join(", ") || "Mathematics, Physics, Chemistry"}
${testSchedule ? `- Test schedule provided by student:\n${testSchedule.slice(0, 4000)}` : "- No test schedule provided — balance the plan across the subjects above."}

Build a 7-day plan starting today.`;

  try {
    const json = await groqJson<{ plan: DayPlan[] }>(SYSTEM, userMsg, {
      temperature: 0.5,
      maxTokens: 1500,
    });
    return NextResponse.json(json);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
