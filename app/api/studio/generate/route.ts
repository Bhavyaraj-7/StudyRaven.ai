import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { groqChat, groqJson } from "@/lib/groq";
import {
  checkAndCountGeneration,
  getUsageToday,
  isProUser,
  FREE_DAILY_LIMIT,
} from "@/lib/subscription";

export const maxDuration = 60;

type Kind = "summary" | "study_guide" | "slide_deck" | "flashcards" | "mind_map";

const SOURCE_RULE =
  "If SOURCE MATERIAL is provided below, base the output PRIMARILY on that material — extract facts, terminology, examples, and structure from it. Only fall back to general IGCSE knowledge to fill gaps the source does not cover.";

const PROMPTS: Record<Kind, { sys: string; json: boolean }> = {
  summary: {
    sys: `You are an IGCSE tutor. Write a clear, concise summary in Markdown. Use ## headings, bullet points, and bold key terms. Keep it under 600 words. ${SOURCE_RULE}`,
    json: false,
  },
  study_guide: {
    sys: `You are an IGCSE tutor. Produce a comprehensive Markdown study guide with sections: ## Overview, ## Key concepts, ## Worked examples, ## Common mistakes, ## Quick revision checklist. Use LaTeX inline as $...$ where useful. ${SOURCE_RULE}`,
    json: false,
  },
  slide_deck: {
    sys: `Produce a slide deck as JSON: { "slides": [ { "title": string, "bullets": string[] } ] }. Make 8-12 slides. Each slide has 3-5 bullets. Keep bullets short. ${SOURCE_RULE}`,
    json: true,
  },
  flashcards: {
    sys: `Produce flashcards as JSON: { "cards": [ { "front": string, "back": string } ] }. Make 10-15 cards. ${SOURCE_RULE}`,
    json: true,
  },
  mind_map: {
    sys: `Produce a mind map as JSON: { "root": string, "branches": [ { "label": string, "children": string[] } ] }. 4-6 branches, each with 3-5 children. ${SOURCE_RULE}`,
    json: true,
  },
};

export async function POST(req: Request) {
  const sb = supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json();
  const kind = body.kind as Kind;
  const subject = body.subject as string;
  const topic = (body.topic as string) || "general revision";
  const source = (body.source as string) || "";

  const cfg = PROMPTS[kind];
  if (!cfg) return NextResponse.json({ error: "invalid kind" }, { status: 400 });

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

  const user_prompt = `Subject: ${subject}
Topic: ${topic}
${source ? `\nSOURCE MATERIAL (extracted from the student's uploaded document — build from this):\n"""\n${source.slice(0, 18000)}\n"""` : ""}

Generate now.`;

  try {
    if (cfg.json) {
      const data = await groqJson(cfg.sys, user_prompt, { maxTokens: 2500 });
      return NextResponse.json({ kind, data, remaining: quota.remaining });
    }
    const text = await groqChat(cfg.sys, user_prompt, { maxTokens: 2500 });
    return NextResponse.json({ kind, data: { markdown: text }, remaining: quota.remaining });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

/** Usage meter for the studio page: how many free generations are left today. */
export async function GET() {
  const sb = supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const pro = await isProUser(user.id);
  if (pro) return NextResponse.json({ isPro: true, used: 0, limit: null });

  const used = await getUsageToday(user.id);
  return NextResponse.json({ isPro: false, used, limit: FREE_DAILY_LIMIT });
}
