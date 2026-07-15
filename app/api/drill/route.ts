import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { groqJson } from "@/lib/groq";
import { topicsForCode } from "@/lib/igcse-topics";

export const maxDuration = 60;

interface DrillQuestion {
  q: string;
  answer_hint: string;
}

interface DrillFeedback {
  correct: boolean;
  explanation: string;
}

const GENERATE_SYSTEM = `You write IGCSE exam-style quick-fire questions. Return JSON:
{ "questions": [ { "q": string, "answer_hint": string } ] }
Rules:
- Exactly 5 questions on the given subject and topic, IGCSE difficulty for the given grade.
- Each answerable in 1-3 sentences or a short calculation — no essays.
- Mix command words: state, calculate, explain, describe.
- "answer_hint" is the model answer (1-2 lines) used later for marking — precise, with the key mark points.`;

const GRADE_SYSTEM = `You are an IGCSE examiner marking quick-fire answers. You get questions, model answers, and the student's answers. Return JSON:
{ "results": [ { "correct": boolean, "explanation": string } ] }
Rules:
- One result per question, same order.
- "correct" = the student hit the key point(s) of the model answer. Minor wording differences are fine; missing the core point is not.
- Empty or "idk" answers are incorrect.
- "explanation": one sentence — if correct, reinforce the key point; if wrong, state the right answer plainly.`;

function streakFrom(dates: string[]): number {
  // dates: drill dates sorted descending, unique. Streak counts back from
  // today (or yesterday, so an unplayed today doesn't zero it out).
  const day = 86_400_000;
  const today = new Date(new Date().toISOString().slice(0, 10)).getTime();
  const set = new Set(dates);
  let cursor = set.has(new Date(today).toISOString().slice(0, 10))
    ? today
    : today - day;
  let n = 0;
  while (set.has(new Date(cursor).toISOString().slice(0, 10))) {
    n += 1;
    cursor -= day;
  }
  return n;
}

/** Today's drill state + streak. */
export async function GET() {
  const sb = supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const today = new Date().toISOString().slice(0, 10);
  const { data: rows, error } = await sb
    .from("drills")
    .select("drill_date, subject, topic, questions, score, total")
    .eq("user_id", user.id)
    .order("drill_date", { ascending: false })
    .limit(60);

  if (error) {
    // Table missing = migration not run yet. Tell the client explicitly.
    return NextResponse.json({ error: "setup_required" }, { status: 503 });
  }

  const todayRow = rows?.find((r) => r.drill_date === today) ?? null;
  const streak = streakFrom((rows ?? []).map((r) => r.drill_date as string));
  return NextResponse.json({ today: todayRow, streak });
}

/** Start today's drill or submit its answers. */
export async function POST(req: Request) {
  const sb = supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const today = new Date().toISOString().slice(0, 10);

  try {
    if (body.action === "start") {
      // Weakest topic first: red beats amber beats anything unrated.
      const { data: weak } = await sb
        .from("topics")
        .select("name, rating, subject_id, subjects(name, code)")
        .eq("user_id", user.id)
        .in("rating", ["red", "amber"])
        .order("rating") // 'amber' < 'red' alphabetically, so re-sort below
        .limit(20);

      const reds = (weak ?? []).filter((t) => t.rating === "red");
      const pick = (reds.length ? reds : (weak ?? []))[
        Math.floor(Math.random() * Math.max(1, (reds.length ? reds : (weak ?? [])).length))
      ];

      let subjectName: string;
      let topicName: string;
      if (pick) {
        const subj = pick.subjects as unknown as { name: string; code: string | null } | null;
        subjectName = subj?.name ?? "General";
        topicName = pick.name;
      } else {
        // No rated topics yet — fall back to a random syllabus topic.
        const { data: subjects } = await sb
          .from("subjects")
          .select("name, code")
          .eq("user_id", user.id);
        const withTopics = (subjects ?? [])
          .map((s) => ({ ...s, topics: topicsForCode(s.code) }))
          .filter((s) => s.topics.length);
        if (!withTopics.length) {
          return NextResponse.json(
            { error: "Add your subjects first so the drill knows what to ask." },
            { status: 400 },
          );
        }
        const s = withTopics[Math.floor(Math.random() * withTopics.length)];
        subjectName = s.name;
        topicName = s.topics[Math.floor(Math.random() * s.topics.length)];
      }

      const { data: profile } = await sb
        .from("profiles")
        .select("grade")
        .eq("id", user.id)
        .maybeSingle();

      const gen = await groqJson<{ questions: DrillQuestion[] }>(
        GENERATE_SYSTEM,
        `Subject: ${subjectName}. Topic: ${topicName}. Grade ${profile?.grade ?? 10} IGCSE. Generate the 5 questions now.`,
        { temperature: 0.7, maxTokens: 1200 },
      );
      const questions = (gen.questions ?? []).slice(0, 5);
      if (questions.length < 3) {
        return NextResponse.json(
          { error: "Question generation came back empty — try again." },
          { status: 502 },
        );
      }

      const { error: upErr } = await sb.from("drills").upsert(
        {
          user_id: user.id,
          drill_date: today,
          subject: subjectName,
          topic: topicName,
          questions,
        },
        { onConflict: "user_id,drill_date" },
      );
      if (upErr) return NextResponse.json({ error: "setup_required" }, { status: 503 });

      return NextResponse.json({ subject: subjectName, topic: topicName, questions });
    }

    if (body.action === "submit") {
      const answers: string[] = Array.isArray(body.answers) ? body.answers : [];
      const { data: row } = await sb
        .from("drills")
        .select("questions, subject, topic")
        .eq("user_id", user.id)
        .eq("drill_date", today)
        .maybeSingle();
      if (!row) {
        return NextResponse.json({ error: "No drill started today." }, { status: 400 });
      }

      const questions = row.questions as DrillQuestion[];
      const block = questions
        .map(
          (q, i) =>
            `Q${i + 1}: ${q.q}\nModel answer: ${q.answer_hint}\nStudent answer: ${answers[i]?.slice(0, 500) || "(blank)"}`,
        )
        .join("\n\n");

      const graded = await groqJson<{ results: DrillFeedback[] }>(
        GRADE_SYSTEM,
        `Subject: ${row.subject}. Topic: ${row.topic}.\n\n${block}\n\nMark now.`,
        { temperature: 0.2, maxTokens: 1200 },
      );

      const results = (graded.results ?? []).slice(0, questions.length);
      const score = results.filter((r) => r.correct).length;

      await sb
        .from("drills")
        .update({ score, total: questions.length })
        .eq("user_id", user.id)
        .eq("drill_date", today);

      return NextResponse.json({ results, score, total: questions.length });
    }

    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
