import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { groqJson } from "@/lib/groq";
import { tavilySearch, type TavilyResult } from "@/lib/tavily";
import type { ActionPlanItem, UniversityMatch } from "@/types";

export const maxDuration = 60;

const READINESS_SYSTEM = `You are a hard-nosed admissions counselor for top-30 global universities, assessing a Grade 9-10 student. Your job is to be ACCURATE, not kind. A sugar-coated score is worse than useless — it makes the student complacent. Build a readiness profile as JSON:
{
  "readiness_score": 0-100,
  "score_rationale": string,
  "strengths": string[],
  "gaps": string[],
  "university_matches": [ { "name": string, "country": string, "fit": "reach" | "target" | "safety", "why": string } ]
}

SCORING RUBRIC — score ONLY on evidence the student actually provided. Absence of evidence is a low score, never a middle one.
- Start every student at 15 (a Grade 9-10 with no track record yet).
- Academics: +0 to +30 based on the actual grades/marks they entered. No grades entered = +0, not a guess.
- Extracurriculars: +0 to +20. Only count ECs with a stated role AND time commitment AND a tangible result/evidence. "Member of a club" with nothing behind it = +0-2. A founded/led initiative with numbers = high.
- Competitions/awards: +0 to +20, and ONLY if the student named a real competition and their result/evidence. Vague "I like science" = +0.
- Community service: +0 to +10, scaled by hours and genuine ownership (led vs. attended).
- Test scores (SAT/IELTS/etc.): +0 to +5 if provided and strong.
- Narrative/spike: +0 to +10 if a clear, evidenced through-line exists across their interests and activities. Scattered = +0.
- A student who typed almost nothing MUST land 15-30. Do not inflate. Do not average to 50. If the profile is empty, say so in score_rationale.

- "score_rationale": 1-2 blunt sentences explaining the exact number — what earned points and what scored zero for lack of evidence.
- 3-6 strengths — ONLY things the student actually evidenced. If they evidenced nothing, return an empty array; never invent "strong communication" or "curious mind" with no basis.
- 5-8 gaps — specific and evidence-based. Each: the gap, a dash, then the concrete first step (name the exact kind of competition, project, test, or role — not "work harder"). Where the student gave no evidence for something, the gap is "you have no evidence of X yet — here's how to build it".

UNIVERSITY MATCHES — must be internally consistent with selectivity:
- Reach = HARDER to get into than Target; Target = harder than Safety. Never label a more-selective university "safety" while a less-selective one is "reach". Order must track real admit rates.
- Base the bands on THIS student's actual strength from the rubric above. A 20/100 student's "target" is not Oxford — be realistic; their reaches are selective, their safeties are genuinely likely.
- 6-8 matches. "why" cites the student's real profile and the school's actual selectivity, not generic praise.`;

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
          "outcome": string,
          "tasks": [ { "days": string, "task": string } ],
          "resource": { "title": string, "url": string } | null
        }
      ]
    }
  ]
}

Structure rules:
- The full plan spans 6 months, but generate ONLY the months the user message asks for — no more. Each month has exactly 4 weeks. Each week has 3-5 tasks.
- "goal": the month's single concrete objective tied to closing ONE named gap from their list.
- "details": 1-2 sentences: what this month builds and why it comes at this point in the sequence.
- "milestone": a measurable, checkable outcome ("Essay submitted to John Locke portal", "Scored 65%+ on second timed mock", "20 volunteer hours logged with photos"). Never "made progress on X".
- "focus": what this week is about, one line.
- "outcome": the tangible thing that exists at the end of the week that didn't exist before (a document, a registration confirmation, a score, a published post, a recorded video). Every week must produce something.

Task rules — this is where the plan lives or dies:
- "days" states BOTH when and how long: "Tue + Thu, 45 min each", "Sat morning, 2 hrs", "Daily, 20 min". Total weekly load must stay realistic for a full-time student: 5-8 hrs/week.
- "task" is one specific action a 15-year-old can start within 5 minutes of reading it. Name the exact platform, tool, document, person, or search to use.
- Every task states its deliverable: "...and save it as a one-page outline", "...ending with a 10-entry spreadsheet", "...and send it to your teacher for comments".
- BANNED words in tasks: "prepare", "work on", "research" (alone), "improve", "continue", "explore", "look into". Replace with the actual first physical action.
- BAD: "Research summer programs". GOOD: "List 8 summer programs in a sheet with columns: name, dates, cost, deadline, essay needed — start from the two resource links in this plan, 1 hr".
- Weekend tasks can be bigger (2-3 hrs); weekday tasks max 60 min.

Content rules:
- Weave the provided REAL opportunities in: when a week involves one, name it exactly in the task and set "resource" to its title + URL. Use at least 4-6 of the provided opportunities where they genuinely fit. Never invent URLs.
- Sequence with dependencies: registrations and account setups in weeks 1-3; skill-building in months 1-3; drafts in month 3-4; feedback and revision in month 4-5; submissions and public sharing in month 5-6. A task may reference an earlier week's deliverable by name.
- Run 4 parallel threads across the 6 months, touching each thread at least every 2 weeks: (1) academics tied to their IGCSE subjects, (2) one or two competitions matched to their interests, (3) one community-service/leadership project they OWN (they start it, recruit 2-3 people, document it), (4) one skill/portfolio project (code, writing, research, art — matched to their stated interests).
- Months 1 and 6 each include one week with a "reflect and log" task: update a brag sheet document listing everything done, with dates and evidence links. Colleges ask for this later; starting it now is a cheat code.
- Reference the student's ACTUAL interests, target country, and named gaps throughout — a reader should be able to guess this student's profile from the plan alone.`;

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
  const {
    target_country,
    target_universities,
    interests,
    extracurriculars,
    academics,
    community_service,
    awards,
    test_scores,
  } = body;

  const { data: profile } = await sb
    .from("profiles")
    .select("grade, curriculum")
    .eq("id", user.id)
    .maybeSingle();

  const studentBlock = `Student: Grade ${profile?.grade ?? 10} ${profile?.curriculum ?? "IGCSE"}
Target country: ${target_country || "—"}
Target universities: ${target_universities?.join(", ") || "open"}
Academic interests: ${interests?.join(", ") || "—"}
Current/predicted grades & marks: ${academics?.trim() || "(none provided — score academics as 0)"}
Extracurriculars (role, hours, result): ${extracurriculars?.join(" | ") || "(none provided — score ECs as 0)"}
Community service: ${community_service?.trim() || "(none provided — score as 0)"}
Awards & competitions (with evidence): ${awards?.trim() || "(none provided — score as 0)"}
Test scores: ${test_scores?.trim() || "(none)"}`;

  try {
    // Wall-clock budget: Vercel kills this function at 60s. One 7000-token
    // generation blows that alone, so everything independent runs in
    // parallel and the roadmap is generated as two 3-month halves at once.

    // Real opportunities feed the roadmap so weeks reference actual programs,
    // not invented ones. Fail-open: a Tavily outage degrades detail, not the
    // whole generation.
    const opportunitiesPromise: Promise<TavilyResult[]> = (async () => {
      try {
        const results = await Promise.all(
          buildQueries(interests ?? [], target_country ?? "").map((q) =>
            tavilySearch(q, { maxResults: 4 }),
          ),
        );
        const seen = new Set<string>();
        return results.flat().filter((r) => {
          if (seen.has(r.url)) return false;
          seen.add(r.url);
          return true;
        });
      } catch {
        return [];
      }
    })();

    const readinessPromise = groqJson<{
      readiness_score: number;
      score_rationale: string;
      strengths: string[];
      gaps: string[];
      university_matches: UniversityMatch[];
    }>(READINESS_SYSTEM, `${studentBlock}\n\nGenerate the readiness profile now. Be strict — reward evidence, penalise its absence.`, {
      temperature: 0.4,
      maxTokens: 2500,
    });

    const [opportunities, readiness] = await Promise.all([
      opportunitiesPromise,
      readinessPromise,
    ]);

    const oppBlock = opportunities.length
      ? opportunities
          .slice(0, 10)
          .map((o) => `- ${o.title} | ${o.url} | ${o.content?.slice(0, 160) ?? ""}`)
          .join("\n")
      : "(none found — build the plan from well-known real programs instead, but do not invent URLs; leave resource null unless certain)";

    const roadmapContext = `${studentBlock}

Their gaps to close:
${readiness.gaps.map((g) => `- ${g}`).join("\n")}

REAL opportunities found on the web:
${oppBlock}`;

    // Two halves in parallel — each ~3500 tokens finishes comfortably in time.
    const halfPrompt = (label: string, extra: string) =>
      groqJson<{ action_plan: ActionPlanItem[] }>(
        ROADMAP_SYSTEM,
        `${roadmapContext}

Generate ONLY ${label} of the 6-month plan now (still following every rule, exactly 4 weeks per month). ${extra}`,
        { temperature: 0.5, maxTokens: 3600 },
      );

    const [firstHalf, secondHalf] = await Promise.all([
      halfPrompt(
        "Months 1-3",
        "Label them Month 1, Month 2, Month 3. These months cover: account setups + registrations, foundations, and skill-building.",
      ),
      halfPrompt(
        "Months 4-6",
        "Label them Month 4, Month 5, Month 6. These months cover: first drafts, feedback + revision, then submissions, public sharing, and the final brag-sheet update. Assume months 1-3 completed registrations and foundations.",
      ),
    ]);

    const action_plan = [
      ...(firstHalf.action_plan ?? []),
      ...(secondHalf.action_plan ?? []),
    ];

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
