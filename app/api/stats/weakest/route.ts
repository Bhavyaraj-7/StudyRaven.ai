import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { groqJson } from "@/lib/groq";

export const maxDuration = 60;

const SYSTEM = `Analyze a student's mock test history and return their weakest topics as JSON:
{ "weakest": [ { "topic": string, "reason": string, "fix": string } ] }
Pick the 3-5 weakest topics by aggregated performance. Each "fix" is one actionable sentence.`;

export async function GET() {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: mocks } = await sb
    .from("mock_tests")
    .select("score, max_score, topic_breakdown, feedback, taken_at")
    .eq("user_id", user.id)
    .order("taken_at", { ascending: false })
    .limit(20);

  if (!mocks || mocks.length === 0) {
    return NextResponse.json({ weakest: [] });
  }

  try {
    const json = await groqJson(SYSTEM, JSON.stringify(mocks), {
      temperature: 0.3,
      maxTokens: 800,
    });
    return NextResponse.json(json);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
