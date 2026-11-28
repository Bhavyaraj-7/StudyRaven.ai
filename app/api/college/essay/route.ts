import { NextResponse } from "next/server";
import { consumeQuota, quotaResponse } from "@/lib/rate-limit";
import { aiErrorResponse } from "@/lib/ai/errors";
import { supabaseServer } from "@/lib/supabase-server";
import { isProUser } from "@/lib/subscription";
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
  "weak_spots": [ { "quote": string, "question": string } ]
}
Rules:
- You NEVER write sentences, example wording or new lines for the essay. The student writes every word; you point and ask. Submitting AI-written essay content counts as misrepresentation at many universities.
- "verdict": 2-3 honest sentences on where this draft stands and the single biggest thing to fix.
- 3-5 strengths: quote or reference specific lines, explain why they work for admissions readers.
- 4-6 improvements: each names the exact problem and WHERE it is. Say what is missing (e.g. "a specific moment", "what changed afterwards"), never how to word it. Never "add more detail" — say what kind of detail, where.
- 2-4 weak_spots: copy the weakest sentences EXACTLY from the draft into "quote", and in "question" ask ONE short question (max 25 words) that helps the student rewrite it themselves, e.g. "Which single moment shows this?".
- Score honestly. Most first drafts are 40-65. Reserve 80+ for genuinely compelling essays.
- Judge for authenticity: flag anything that sounds like AI wrote it or a thesaurus exploded.`;

export async function POST(req: Request) {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!(await isProUser(user.id))) {
    return NextResponse.json(
      { error: "The college guide is a Pro feature.", pro_required: true },
      { status: 403 },
    );
  }
  const quota = await consumeQuota(user.id, "college", true);
  if (!quota.ok) return quotaResponse(quota);

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
    const result = await groqJson<RawFeedback>(
      SYSTEM,
      `${promptContext ? `Essay prompt: ${promptContext}\n\n` : ""}Student's draft:\n"""\n${essay}\n"""\n\nGive feedback now.`,
      { temperature: 0.4, maxTokens: 3000 },
    );
    return NextResponse.json(sanitizeFeedback(result, essay));
  } catch (e) {
    return aiErrorResponse(e);
  }
}

interface RawFeedback {
  overall_score?: unknown;
  scores?: Record<string, unknown>;
  verdict?: unknown;
  strengths?: unknown;
  improvements?: unknown;
  weak_spots?: unknown;
}

// Double-quoted spans, plus single-quoted spans that start after a space/colon
// (so apostrophes in "don't … it's" aren't read as quotes).
const QUOTED = [
  /["\u201C]([^"\u201C\u201D]{20,}?)["\u201D]/g,
  /(?:^|[\s:(])['\u2018]([^'\u2018\u2019]{20,}?)['\u2019](?=$|[\s.,;:!?)])/g,
];

/** True unless the text quotes a 6+ word span that isn't in the student's draft
 *  (blocks example rewrites smuggled in as "Try: '...'"). */
function quotesFromDraft(text: string, draft: string): boolean {
  for (const m of QUOTED.flatMap((re) => Array.from(text.matchAll(re)))) {
    const q = m[1].trim();
    if (q.split(/\s+/).length >= 6 && !draft.includes(q)) return false;
  }
  return true;
}

function cleanList(v: unknown, draft: string, max: number): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((x): x is string => typeof x === "string")
    .map((x) => x.trim().slice(0, 400))
    .filter((x) => x && quotesFromDraft(x, draft))
    .slice(0, max);
}

/** Whitelists fields so no AI-written prose for the essay reaches the student:
 *  weak spots must quote the draft verbatim; anything else is dropped. */
function sanitizeFeedback(raw: RawFeedback, draft: string) {
  const num = (v: unknown, hi: number) =>
    typeof v === "number" && Number.isFinite(v) ? Math.max(0, Math.min(hi, Math.round(v))) : null;
  const scores = raw.scores ?? {};
  const weakSpots = (Array.isArray(raw.weak_spots) ? raw.weak_spots : [])
    .map((w) => w as { quote?: unknown; question?: unknown })
    .filter(
      (w) =>
        typeof w.quote === "string" &&
        typeof w.question === "string" &&
        w.quote.trim().length > 0 &&
        draft.includes(w.quote.trim()) &&
        quotesFromDraft(w.question, draft),
    )
    .map((w) => ({
      quote: (w.quote as string).trim(),
      question: (w.question as string).trim().slice(0, 200),
    }))
    .slice(0, 4);

  return {
    overall_score: num(raw.overall_score, 100),
    scores: {
      hook: num(scores.hook, 10),
      structure: num(scores.structure, 10),
      specificity: num(scores.specificity, 10),
      voice: num(scores.voice, 10),
    },
    verdict:
      typeof raw.verdict === "string" && quotesFromDraft(raw.verdict, draft)
        ? raw.verdict.trim().slice(0, 600)
        : "",
    strengths: cleanList(raw.strengths, draft, 5),
    improvements: cleanList(raw.improvements, draft, 6),
    weak_spots: weakSpots,
  };
}
