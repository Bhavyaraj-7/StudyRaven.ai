import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { groqJson } from "@/lib/groq";

export const maxDuration = 60;

const MAX_ESSAY_CHARS = 12000;

const SYSTEM = `You are a college essay coach who has read thousands of successful applications to top universities. A Grade 9-10 student shares a draft (personal statement, activity description, or scholarship essay). Give feedback as JSON:
{
  "overall_score": 0-100,
  "scores": {
    "hook": 0-10,
    "structure": 0-10,
    "specificity": 0-10,
    "voice": 0-10
  },
  "verdict": string,
  "strengths": string[],
  "improvements": string[],
  "rewrites": [ { "original": string, "suggestion": string, "why": string } ]
}
Rules:
- "verdict": 2-3 honest sentences on where this draft stands and the single biggest thing to fix.
- 3-5 strengths: quote or reference specific lines, explain why they work for admissions readers.
- 4-6 improvements: each names the exact problem AND how to fix it. Never "add more detail" — say what detail, where.
- 2-4 rewrites: pick the weakest sentences from the draft, quote them exactly in "original", give a concrete rewritten "suggestion" in the student's own voice (not fancier vocabulary), and one line "why".
- Score honestly. Most first drafts are 40-65. Reserve 80+ for genuinely compelling essays.
- Judge for authenticity: flag anything that sounds like AI wrote it or a thesaurus exploded.`;

export async function POST(req: Request) {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const essay = typeof body?.essay === "string" ? body.essay.trim() : "";
  const promptContext =
    typeof body?.prompt === "string" ? body.prompt.trim().slice(0, 500) : "";

  if (essay.length < 100) {
    return NextResponse.json(
      { error: "Paste at least a full paragraph (100+ characters) so feedback is meaningful." },
      { status: 400 },
    );
  }
  if (essay.length > MAX_ESSAY_CHARS) {
    return NextResponse.json(
      { error: `Essay too long — keep it under ${MAX_ESSAY_CHARS} characters.` },
      { status: 400 },
    );
  }

  try {
    const result = await groqJson(
      SYSTEM,
      `${promptContext ? `Essay prompt: ${promptContext}\n\n` : ""}Student's draft:\n"""\n${essay}\n"""\n\nGive feedback now.`,
      { temperature: 0.4, maxTokens: 3000 },
    );
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
