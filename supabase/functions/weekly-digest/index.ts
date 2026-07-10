// Runs Sundays 6PM IST (12:30 UTC). Sends every user a progress recap.
// Pro users additionally get a college-opportunities section (fresh Tavily
// results matched to their interests) appended to the same email.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { groqText } from "../_shared/groq.ts";
import { emailShell, sendResend } from "../_shared/email.ts";

const APP_URL = Deno.env.get("APP_URL") ?? "https://studyraven.ai";

const SYSTEM = `You are an IGCSE study coach writing a weekly progress digest for a Grade 9-10 student. Write an HTML email body (under 250 words) with these sections:
1. Progress this week — mocks taken, tasks completed, scores.
2. One focus for next week — a single specific, actionable suggestion.
${"{{PRO_SECTION}}"}
Tone: warm, specific, encouraging. Output only HTML body content with <p>, <ul>, <a>.`;

const PRO_SECTION_INSTRUCTION = `3. New opportunities — list the provided opportunities as links.`;

interface TavilyResult {
  title: string;
  url: string;
  content: string;
}

async function tavilySearch(query: string, maxResults = 3): Promise<TavilyResult[]> {
  const r = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: Deno.env.get("TAVILY_API_KEY"),
      query,
      max_results: maxResults,
      search_depth: "basic",
    }),
  });
  if (!r.ok) return [];
  const data = await r.json();
  return data.results ?? [];
}

Deno.serve(async () => {
  const sb = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const since = new Date(Date.now() - 7 * 86400_000).toISOString();

  const { data: users } = await sb.from("profiles").select("id, name, email");
  if (!users?.length) return new Response("no users");

  const { data: subs } = await sb
    .from("subscriptions")
    .select("user_id, plan, status");
  const proIds = new Set(
    (subs ?? []).filter((s) => s.plan === "pro" && s.status === "active").map((s) => s.user_id),
  );

  let sent = 0;
  for (const u of users) {
    if (!u.email) continue;
    const isPro = proIds.has(u.id);

    try {
      const [{ data: mocks }, { data: tasks }, { data: college }] = await Promise.all([
        sb.from("mock_tests").select("score, max_score, predicted_grade").eq("user_id", u.id).gte("taken_at", since),
        sb.from("tasks").select("id, status").eq("user_id", u.id).gte("created_at", since),
        isPro
          ? sb.from("college_profiles").select("interests, target_country").eq("user_id", u.id).maybeSingle()
          : Promise.resolve({ data: null }),
      ]);

      const mocksDone = mocks?.length ?? 0;
      const tasksDone = (tasks ?? []).filter((t) => t.status === "done").length;

      let oppsLine = "";
      if (isPro) {
        const interests = (college?.interests as string[] | null) ?? [];
        const country = (college?.target_country as string | null) ?? "";
        const query = interests.length
          ? `${interests.slice(0, 2).join(" ")} competitions summer programs high school students 2026 ${country}`
          : "competitions and summer programs for high school students 2026";
        const fresh = await tavilySearch(query, 3);
        oppsLine = fresh.map((o) => `- ${o.title}: ${o.url}`).join("\n");
      }

      const system = SYSTEM.replace(
        "{{PRO_SECTION}}",
        isPro ? PRO_SECTION_INSTRUCTION : "",
      );
      const userMsg = `Student: ${u.name || "there"}
Mocks taken this week: ${mocksDone}
Tasks completed: ${tasksDone}
Latest mock scores: ${(mocks ?? []).map((m) => `${m.score}/${m.max_score}`).join(", ") || "none"}
${
  isPro
    ? `New opportunities to include as links:\n${oppsLine || "(none found this week)"}`
    : ""
}`;

      const body = await groqText(system, userMsg);

      await sendResend(
        u.email,
        `Your week at StudyRaven`,
        emailShell(`Your week, ${u.name?.split(" ")[0] || "there"}`, body, APP_URL),
      );
      sent++;
    } catch (e) {
      console.error(`weekly-digest failed for ${u.email}:`, e);
    }
  }

  return new Response(`Sent ${sent} weekly digests`);
});
