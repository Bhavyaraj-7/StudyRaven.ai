import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { isProUser } from "@/lib/subscription";
import { tavilySearch } from "@/lib/tavily";
import { MODEL } from "@/lib/groq";

export const maxDuration = 60;

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

// Questions about live facts (deadlines, requirements, fees) get a Tavily
// search injected as context so the model answers from real sources.
const LIVE_FACT_RE =
  /deadline|requirement|admission|acceptance rate|apply by|application date|tuition|fee|cost|scholarship|cutoff|sat|act|ielts|toefl|when (is|are|do)|open(s|ing) date/i;

interface ChatBody {
  message?: string;
}

export async function POST(req: Request) {
  const sb = supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const pro = await isProUser(user.id);
  if (!pro) {
    return NextResponse.json(
      { error: "Ask StudyRaven is a Pro feature." },
      { status: 403 },
    );
  }

  const { message } = (await req.json()) as ChatBody;
  if (!message?.trim()) {
    return NextResponse.json({ error: "Empty message." }, { status: 400 });
  }

  // Pull the student's context: college profile, subjects, recent chat turns.
  const [{ data: profile }, { data: subjects }, { data: history }] =
    await Promise.all([
      sb.from("college_profiles").select("*").eq("user_id", user.id).maybeSingle(),
      sb.from("subjects").select("name, predicted_grade").eq("user_id", user.id),
      sb
        .from("college_chats")
        .select("role, content")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(12),
    ]);

  // Live-fact questions: search the web first and feed sources to the model.
  let webContext = "";
  if (LIVE_FACT_RE.test(message)) {
    try {
      const results = await tavilySearch(message, { maxResults: 5 });
      if (results.length) {
        webContext =
          "\n\nLIVE WEB SEARCH RESULTS (use these for factual claims, cite the source name):\n" +
          results
            .map((r) => `- ${r.title} (${r.url}): ${r.content?.slice(0, 400)}`)
            .join("\n");
      }
    } catch {
      // Search failing shouldn't kill the chat — model will hedge instead.
    }
  }

  const system = `You are an expert IGCSE college admissions counselor called StudyRaven.
You have access to this student's profile:
- Grade: IGCSE student (Grade 9-10)
- Readiness score: ${profile?.readiness_score ?? "not generated yet"}/100
- Target country: ${profile?.target_country ?? "unknown"}
- Target universities: ${profile?.target_universities?.join(", ") || "none listed"}
- Interests: ${profile?.interests?.join(", ") || "none listed"}
- Extracurriculars: ${profile?.extracurriculars?.join(", ") || "none listed"}
- Strengths: ${profile?.strengths?.join("; ") || "—"}
- Gaps: ${profile?.gaps?.join("; ") || "—"}
- Subjects: ${subjects?.map((s) => s.name + (s.predicted_grade ? ` (predicted ${s.predicted_grade})` : "")).join(", ") || "none listed"}

Give specific, honest, actionable advice tailored to this student. Never invent specific deadlines, admission rates, or requirements you are not certain about — say you're not certain and suggest they verify on the official site. Keep answers concise: short paragraphs or bullet points, sentence case.${webContext}`;

  // Save the user turn first so history is never lost mid-stream.
  await sb.from("college_chats").insert({
    user_id: user.id,
    role: "user",
    content: message.trim(),
  });

  const messages = [
    { role: "system", content: system },
    ...(history ?? []).reverse(),
    { role: "user", content: message.trim() },
  ];

  const upstream = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.5,
      max_tokens: 1200,
      stream: true,
      messages,
    }),
  });

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => "");
    return NextResponse.json(
      { error: `AI service error (${upstream.status}). ${detail.slice(0, 200)}` },
      { status: 502 },
    );
  }

  // Re-stream OpenRouter's SSE as plain text chunks, collecting the full
  // reply so we can persist it when the stream ends.
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  let full = "";
  let buffer = "";

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = upstream.body!.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const payload = trimmed.slice(5).trim();
            if (payload === "[DONE]") continue;
            try {
              const json = JSON.parse(payload);
              const delta: string = json.choices?.[0]?.delta?.content ?? "";
              if (delta) {
                full += delta;
                controller.enqueue(encoder.encode(delta));
              }
            } catch {
              // Partial/keep-alive line — skip.
            }
          }
        }
      } finally {
        controller.close();
        if (full.trim()) {
          await sb.from("college_chats").insert({
            user_id: user.id,
            role: "assistant",
            content: full,
          });
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}

/** Clear chat history. */
export async function DELETE() {
  const sb = supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  await sb.from("college_chats").delete().eq("user_id", user.id);
  return NextResponse.json({ ok: true });
}
