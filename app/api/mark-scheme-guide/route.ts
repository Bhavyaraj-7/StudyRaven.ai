import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { groqChat } from "@/lib/groq";

export const maxDuration = 60;

export async function POST(req: Request) {
  const sb = supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { subject, code } = await req.json();
  if (!subject) {
    return NextResponse.json({ error: "subject is required" }, { status: 400 });
  }

  const sys = `You are a senior Cambridge IGCSE examiner. In Markdown, explain exactly how ${subject}${code ? ` (${code})` : ""} answers are marked, so a Grade 9-10 student can write to the mark scheme. Use these sections:
## How marks are awarded
The mark types this subject uses (e.g. M marks for method, A marks for accuracy, B marks for independent points, or the equivalent for essay subjects) and what earns each.
## Command words that matter
The command words examiners use in this subject (state, describe, explain, calculate, evaluate, etc.) and precisely what each one demands to score full marks.
## Worked example
One realistic exam-style question, a model answer, and the mark-scheme breakdown showing where each individual mark is earned.
## Top 3 ways students lose marks
The most common avoidable mistakes in this subject.

Be concrete and specific to ${subject}. Keep under 700 words.`;

  try {
    const markdown = await groqChat(
      sys,
      `Write the mark scheme guide for ${subject} now.`,
      { maxTokens: 2000 },
    );
    return NextResponse.json({ markdown });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
