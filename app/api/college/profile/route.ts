import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { groqJson } from "@/lib/groq";

export const maxDuration = 60;

const SYSTEM = `You are a college admissions counselor for Grade 9-10 students applying to top universities. Build a readiness profile as JSON:
{
  "readiness_score": 0-100,
  "strengths": string[],
  "gaps": string[],
  "action_plan": [ { "month": "Month 1", "goal": string, "details": string } ],
  "university_matches": [ { "name": string, "country": string, "fit": "reach" | "target" | "safety", "why": string } ]
}
Include 4-6 strengths, 4-6 gaps, 6 months of action plan, 5-8 university matches. Be honest but encouraging.`;

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

  const userMsg = `Student: Grade ${profile?.grade ?? 10} ${profile?.curriculum ?? "IGCSE"}
Target country: ${target_country}
Target universities: ${target_universities?.join(", ") || "open"}
Interests: ${interests?.join(", ") || "—"}
Extracurriculars: ${extracurriculars?.join(", ") || "—"}

Generate profile now.`;

  try {
    const result = await groqJson<{
      readiness_score: number;
      strengths: string[];
      gaps: string[];
      action_plan: any[];
      university_matches: any[];
    }>(SYSTEM, userMsg, { temperature: 0.5, maxTokens: 2500 });

    await sb
      .from("college_profiles")
      .upsert({
        user_id: user.id,
        readiness_score: result.readiness_score,
        strengths: result.strengths,
        gaps: result.gaps,
        action_plan: result.action_plan,
        target_country,
        target_universities: target_universities ?? [],
        interests: interests ?? [],
        extracurriculars: extracurriculars ?? [],
        university_matches: result.university_matches,
        updated_at: new Date().toISOString(),
      });

    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
