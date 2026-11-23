import { NextResponse } from "next/server";
import { aiErrorResponse } from "@/lib/ai/errors";
import { supabaseServer } from "@/lib/supabase-server";
import { z } from "zod";
import { chatJson } from "@/lib/ai/client";
import { checkAndCountGeneration, FREE_DAILY_LIMIT } from "@/lib/subscription";

// AI generation regularly exceeds Vercel's default function timeout.
export const maxDuration = 60;

const Body = z.object({
  subject: z.string().trim().min(1).max(120),
  difficulty: z.enum(["easy", "medium", "hard"]).catch("medium"),
  topic: z.string().trim().max(200).catch(""),
  source: z.string().max(60_000).catch(""),
});

const Item = z.object({ q: z.coerce.number().int().min(1), marks: z.coerce.number().int().min(1).max(20) });
// A paper is only usable if every question has a mark scheme entry worth
// the same marks: marking depends on it.
const Paper = z
  .object({
    questions: z.array(Item.extend({ text: z.string().min(5).max(4_000) })).min(3).max(15),
    mark_scheme: z.array(Item.extend({ answer: z.string().min(1).max(4_000) })).min(3).max(15),
  })
  .refine(
    (p) => p.questions.every((q) => p.mark_scheme.some((m) => m.q === q.q && m.marks === q.marks)),
    "every question needs a mark_scheme entry with the same q and marks",
  );

const SYSTEM = `You are an IGCSE examiner. Generate an original practice paper as JSON:
{ "questions": [ { "q": 1, "text": string, "marks": number } ],
  "mark_scheme": [ { "q": 1, "answer": string, "marks": number } ] }
8-12 questions total. Mix short and long. Mark scheme must match question numbers exactly.
If SOURCE MATERIAL is provided below, build the paper PRIMARILY from that material — use its topics, terminology, and question styles. Only fall back to general IGCSE syllabus for the subject when the source doesn't cover something. If a TOPIC is specified, focus the questions on that topic.`;

export async function POST(req: Request) {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Pick a subject before generating a paper." }, { status: 400 });
  }
  const { subject, difficulty, topic, source } = parsed.data;

  // Only a valid request uses up the free daily quota.
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

  const userMsg = `Subject: ${subject}
Difficulty: ${difficulty}
${topic ? `Topic: ${topic}` : ""}
${source ? `\nSOURCE MATERIAL (extracted from the student's uploaded document — build from this):\n"""\n${source.slice(0, 18000)}\n"""` : ""}

Generate now.`;

  try {
    const { data: json } = await chatJson(Paper, SYSTEM, userMsg, {
      task: "generation",
      temperature: 0.7,
      maxTokens: 3000,
    });
    await sb.from("ai_papers").insert({
      user_id: user.id,
      subject,
      questions: json.questions,
      mark_scheme: json.mark_scheme,
      difficulty,
    });
    return NextResponse.json(json);
  } catch (e) {
    return aiErrorResponse(e);
  }
}
