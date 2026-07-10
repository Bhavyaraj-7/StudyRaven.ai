import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { groqJson } from "@/lib/groq";
import { checkAndCountGeneration, FREE_DAILY_LIMIT } from "@/lib/subscription";

// AI generation regularly exceeds Vercel's default function timeout.
export const maxDuration = 60;

const SYSTEM = `You are an IGCSE examiner. Generate an original practice paper as JSON:
{ "questions": [ { "q": 1, "text": string, "marks": number } ],
  "mark_scheme": [ { "q": 1, "answer": string, "marks": number } ] }
8-12 questions total. Mix short and long. Mark scheme must match question numbers exactly.
If SOURCE MATERIAL is provided below, build the paper PRIMARILY from that material — use its topics, terminology, and question styles. Only fall back to general IGCSE syllabus for the subject when the source doesn't cover something. If a TOPIC is specified, focus the questions on that topic.`;

export async function POST(req: Request) {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  // Free tier: shares the daily generation quota. Pro: unlimited.
  const quota = await checkAndCountGeneration(user.id);
  if (!quota.ok) {
    return NextResponse.json(
      {
        error: `You've used all ${FREE_DAILY_LIMIT} free generations for today. Upgrade to Pro for unlimited.`,
        limit_reached: true,
      },
      { status: 429 },
    );
  }

  const { subject, difficulty = "medium", topic = "", source = "" } = await req.json();

  const userMsg = `Subject: ${subject}
Difficulty: ${difficulty}
${topic ? `Topic: ${topic}` : ""}
${source ? `\nSOURCE MATERIAL (extracted from the student's uploaded document — build from this):\n"""\n${source.slice(0, 18000)}\n"""` : ""}

Generate now.`;

  try {
    const json = await groqJson<{ questions: any[]; mark_scheme: any[] }>(
      SYSTEM,
      userMsg,
      { temperature: 0.7, maxTokens: 3000 },
    );
    await sb.from("ai_papers").insert({
      user_id: user.id,
      subject,
      questions: json.questions,
      mark_scheme: json.mark_scheme,
      difficulty,
    });
    return NextResponse.json(json);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
