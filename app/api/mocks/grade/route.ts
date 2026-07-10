import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { groqJson } from "@/lib/groq";

export const maxDuration = 60;

const SYSTEM = `You are an IGCSE examiner grading a mock test. Given the questions, mark scheme, and student's answers, score the paper strictly but fairly.

Output JSON:
{
  "score": number,
  "max_score": number,
  "predicted_grade": "A*" | "A" | "B" | "C" | "D" | "E" | "U",
  "feedback": string,
  "topic_breakdown": [ { "topic": string, "correct": number, "total": number, "comment": string } ]
}
Feedback should be 3-5 sentences: what they did well, weakest areas, one concrete next step.`;

export async function POST(req: Request) {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { subject_id, subject, questions, mark_scheme, answers, attempt_id } = await req.json();

  const userMsg = `Subject: ${subject}

QUESTIONS:
${JSON.stringify(questions, null, 2)}

MARK SCHEME:
${JSON.stringify(mark_scheme, null, 2)}

STUDENT ANSWERS:
${JSON.stringify(answers, null, 2)}

Grade now.`;

  try {
    const result = await groqJson<{
      score: number;
      max_score: number;
      predicted_grade: string;
      feedback: string;
      topic_breakdown: any[];
    }>(SYSTEM, userMsg, { temperature: 0.3, maxTokens: 1500 });

    await sb.from("mock_tests").insert({
      user_id: user.id,
      subject_id: subject_id || null,
      score: result.score,
      max_score: result.max_score,
      feedback: result.feedback,
      predicted_grade: result.predicted_grade,
      topic_breakdown: result.topic_breakdown,
    });

    // Mark the attempt completed so the abandoned-mock reminder skips it.
    if (attempt_id) {
      await sb
        .from("mock_attempts")
        .update({ completed_at: new Date().toISOString() })
        .eq("id", attempt_id)
        .eq("user_id", user.id);
    }

    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
