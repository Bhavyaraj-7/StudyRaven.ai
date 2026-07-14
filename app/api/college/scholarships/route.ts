import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { groqJson } from "@/lib/groq";
import { tavilySearch, type TavilyResult } from "@/lib/tavily";

export const maxDuration = 60;

const SYSTEM = `You are a scholarship research assistant. You are given raw web search results about scholarships. Structure them as JSON:
{
  "scholarships": [
    {
      "name": string,
      "amount": string,
      "eligibility": string,
      "deadline": string,
      "url": string,
      "match_reason": string
    }
  ]
}
Rules:
- Only include real scholarships present in the provided results. Use the EXACT url given — never invent or modify URLs.
- "amount": the award value if stated, otherwise "Varies".
- "eligibility": one line — who can apply (grade level, nationality, field).
- "deadline": if stated, otherwise "Check website".
- "match_reason": one line on why it fits THIS student's profile.
- 5-10 scholarships. Skip listicle pages that aren't actual scholarships only if better options exist; aggregator pages that list many scholarships are acceptable entries.
- Order by best fit for the student.`;

export async function POST() {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    const [{ data: college }, { data: profile }] = await Promise.all([
      sb
        .from("college_profiles")
        .select("interests, target_country")
        .eq("user_id", user.id)
        .maybeSingle(),
      sb.from("profiles").select("grade, country").eq("id", user.id).maybeSingle(),
    ]);

    const interests: string[] = (college?.interests ?? []).filter(Boolean);
    const targetCountry = college?.target_country || "";
    const homeCountry = profile?.country || "";

    const queries = [
      `scholarships for high school students${targetCountry ? ` study in ${targetCountry}` : ""} international 2026`,
      interests.length
        ? `${interests[0]} scholarships competitions with cash awards for teenagers`
        : "merit scholarships for grade 9 10 students",
    ];
    if (homeCountry) {
      queries.push(`scholarships for students from ${homeCountry} to study abroad`);
    }

    let results: TavilyResult[] = [];
    const settled = await Promise.all(
      queries.map((q) => tavilySearch(q, { maxResults: 5 }).catch(() => [])),
    );
    const seen = new Set<string>();
    results = settled.flat().filter((r) => {
      if (seen.has(r.url)) return false;
      seen.add(r.url);
      return true;
    });

    if (!results.length) {
      return NextResponse.json(
        { error: "Live scholarship search is unavailable right now — try again in a minute." },
        { status: 503 },
      );
    }

    const studentBlock = `Student: Grade ${profile?.grade ?? 10}, from ${homeCountry || "India"}, wants to study in ${targetCountry || "abroad"}, interests: ${interests.join(", ") || "general"}`;
    const resultsBlock = results
      .slice(0, 14)
      .map((r) => `- ${r.title} | ${r.url} | ${r.content?.slice(0, 200) ?? ""}`)
      .join("\n");

    const structured = await groqJson<{
      scholarships: {
        name: string;
        amount: string;
        eligibility: string;
        deadline: string;
        url: string;
        match_reason: string;
      }[];
    }>(SYSTEM, `${studentBlock}\n\nSearch results:\n${resultsBlock}\n\nStructure now.`, {
      temperature: 0.3,
      maxTokens: 2500,
    });

    return NextResponse.json({ items: structured.scholarships ?? [] });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
