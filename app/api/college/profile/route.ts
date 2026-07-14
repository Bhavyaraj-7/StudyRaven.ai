import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { groqJson } from "@/lib/groq";
import { tavilySearch, type TavilyResult } from "@/lib/tavily";
import type { ActionPlanItem, UniversityMatch } from "@/types";

export const maxDuration = 60;

const READINESS_SYSTEM = `You are a college admissions counselor for Grade 9-10 students applying to top universities. Build a readiness profile as JSON:
{
  "readiness_score": 0-100,
  "strengths": string[],
  "gaps": string[],
  "university_matches": [ { "name": string, "country": string, "fit": "reach" | "target" | "safety", "why": string } ]
}
Rules:
- 5-7 strengths. Each is ONE string: the strength, then a dash, then 1-2 sentences on exactly why it matters for admissions to their target universities.
- 5-7 gaps. Each is ONE string: the gap, then a dash, then 1-2 sentences on the specific, concrete way to close it (name the kind of program, test, project, or habit — not "work harder").
- 6-8 university matches spread across reach/target/safety. "why" must reference the student's actual interests or profile, not generic praise.
- Be honest but encouraging. Score conservatively — most Grade 9-10 students are 40-70.`;

const ROADMAP_SYSTEM = `You are an elite admissions strategist building a personalized 6-month execution plan for a Grade 9-10 student. You are given their profile, their gaps, and a list of REAL opportunities found on the web (competitions, programs, community service, courses) with URLs.

Return JSON:
{
  "action_plan": [
    {
      "month": "Month 1",
      "goal": string,
      "details": string,
      "milestone": string,
      "weeks": [
        {
          "week": "Week 1",
          "focus": string,
          "tasks": [ { "days": string, "task": string } ],
          "resource": { "title": string, "url": string } | null
        }
      ]
    }
  ]
}

Rules:
- Exactly 6 months. Each month has exactly 4 weeks. Each week has 2-4 tasks.
- "goal": the month's single concrete objective tied to closing a specific gap.
- "details": 1-2 sentence summary of the month.
- "milestone": a measurable outcome to hit by month end (e.g. "First draft of research project submitted", "Registered + first mock test scored 60%+").
- "focus": what this week is about, one line.
- Each task: "days" is when to do it ("Mon-Wed", "Thu", "Weekend", "Daily 30 min"), "task" is a single specific action a 15-year-old can start immediately. Never vague ("prepare for SAT" is banned — instead "Do SAT practice sections 1-2 on Khan Academy, note every wrong answer").
- Weave the provided REAL opportunities into the plan: when a week involves one, name it exactly in the task and set "resource" to its title + URL. Use at least 4-6 of the provided opportunities across the 6 months where they genuinely fit.
- Sequence logically: early months = foundations + registrations, later months = execution, submissions, leadership.
- Balance across: academics, 1-2 competitions, one community-service/leadership thread, one skill/project thread.`;

function buildQueries(interests: string[], country: string): string[] {
  if (!interests.length) {
    return [
      "competitions for high school students 2026 registration open",
      "community service volunteer opportunities for teenagers",
    ];
  }
  const qs = interests
    .slice(0, 2)
    .map(
      (i) =>
        `${i} competitions programs for high school students 2026${country ? ` ${country}` : ""}`,
    );
  qs.push(`community service volunteer projects for teenagers ${interests[0]}`);
  return qs;
}

export async function POST(req: Request) {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json();
  const { target_country, target_universities, interests, extracurriculars } = body;

  const { data: profile } = await sb
    .from("profiles")
    .select("grade, curriculum")
    .eq("id", user.id)
    .maybeSingle();

  const studentBlock = `Student: Grade ${profile?.grade ?? 10} ${profile?.curriculum ?? "IGCSE"}
Target country: ${target_country}
Target universities: ${target_universities?.join(", ") || "open"}
Interests: ${interests?.join(", ") || "—"}
Extracurriculars: ${extracurriculars?.join(", ") || "—"}`;

  try {
    // Real opportunities feed the roadmap so weeks reference actual programs,
    // not invented ones. Fail-open: a Tavily outage degrades detail, not the
    // whole generation.
    let opportunities: TavilyResult[] = [];
    try {
      const results = await Promise.all(
        buildQueries(interests ?? [], target_country ?? "").map((q) =>
          tavilySearch(q, { maxResults: 4 }),
        ),
      );
      const seen = new Set<string>();
      opportunities = results.flat().filter((r) => {
        if (seen.has(r.url)) return false;
        seen.add(r.url);
        return true;
      });
    } catch {
      // proceed without live opportunities
    }

    const readiness = await groqJson<{
      readiness_score: number;
      strengths: string[];
      gaps: string[];
      university_matches: UniversityMatch[];
    }>(READINESS_SYSTEM, `${studentBlock}\n\nGenerate the readiness profile now.`, {
      temperature: 0.5,
      maxTokens: 2500,
    });

    const oppBlock = opportunities.length
      ? opportunities
          .slice(0, 10)
          .map((o) => `- ${o.title} | ${o.url} | ${o.content?.slice(0, 160) ?? ""}`)
          .join("\n")
      : "(none found — build the plan from well-known real programs instead, but do not invent URLs; leave resource null unless certain)";

    const roadmap = await groqJson<{ action_plan: ActionPlanItem[] }>(
      ROADMAP_SYSTEM,
      `${studentBlock}

Their gaps to close:
${readiness.gaps.map((g) => `- ${g}`).join("\n")}

REAL opportunities found on the web:
${oppBlock}

Generate the 6-month week-by-week plan now.`,
      { temperature: 0.5, maxTokens: 6000 },
    );

    const action_plan = roadmap.action_plan ?? [];

    // Keep the Opportunities tab in sync with what the roadmap references.
    if (opportunities.length) {
      const rows = opportunities.slice(0, 12).map((r) => ({
        user_id: user.id,
        title: r.title,
        description: r.content?.slice(0, 280) ?? "",
        url: r.url,
        category: null,
      }));
      await sb.from("competitions").delete().eq("user_id", user.id);
      await sb.from("competitions").insert(rows);
    }

    await sb
      .from("college_profiles")
      .upsert({
        user_id: user.id,
        readiness_score: readiness.readiness_score,
        strengths: readiness.strengths,
        gaps: readiness.gaps,
        action_plan,
        target_country,
        target_universities: target_universities ?? [],
        interests: interests ?? [],
        extracurriculars: extracurriculars ?? [],
        university_matches: readiness.university_matches,
        updated_at: new Date().toISOString(),
      });

    return NextResponse.json({ ...readiness, action_plan });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
