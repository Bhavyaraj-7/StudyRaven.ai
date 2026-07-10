import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { tavilySearch } from "@/lib/tavily";

// Fallbacks when the student hasn't filled a college profile yet.
const GENERIC_QUERIES = [
  "international competitions for high school students 2026",
  "summer programs for high schoolers 2026",
  "free online bootcamps for teenagers STEM",
];

function buildQueries(profile: {
  interests?: string[] | null;
  target_country?: string | null;
} | null): string[] {
  const interests = (profile?.interests ?? []).filter(Boolean);
  const country = profile?.target_country || "";
  if (!interests.length) return GENERIC_QUERIES;

  const queries = interests.slice(0, 3).map(
    (i) =>
      `${i} competitions summer programs for high school students 2026${country ? ` ${country}` : ""}`,
  );
  queries.push(
    `olympiads and bootcamps for grade 9 10 students ${interests.join(" ")}`,
  );
  return queries;
}

export async function POST() {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    const { data: profile } = await sb
      .from("college_profiles")
      .select("interests, target_country")
      .eq("user_id", user.id)
      .maybeSingle();

    const results = await Promise.all(
      buildQueries(profile).map((q) => tavilySearch(q, { maxResults: 4 })),
    );
    const flat = results.flat();

    // De-dupe by URL.
    const seen = new Set<string>();
    const uniq = flat.filter((r) => {
      if (seen.has(r.url)) return false;
      seen.add(r.url);
      return true;
    });

    // Save top 12 to competitions table.
    const rows = uniq.slice(0, 12).map((r) => ({
      user_id: user.id,
      title: r.title,
      description: r.content?.slice(0, 280) ?? "",
      url: r.url,
      category: null,
    }));
    if (rows.length) {
      await sb.from("competitions").delete().eq("user_id", user.id);
      await sb.from("competitions").insert(rows);
    }

    return NextResponse.json({ items: rows });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
