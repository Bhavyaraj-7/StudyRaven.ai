import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { groqJson } from "@/lib/groq";
import { sendLifecycleEmail } from "@/lib/resend";

export const maxDuration = 60;

interface Mistake {
  question?: string;
  your_answer?: string;
  correct_answer?: string;
  topic?: string;
  marks_lost?: number;
  why?: string;
}

const SYSTEM = `You are an IGCSE examiner grading a mock test. Given the questions, mark scheme, and student's answers, score the paper strictly but fairly.

Output JSON:
{
  "score": number,
  "max_score": number,
  "predicted_grade": "A*" | "A" | "B" | "C" | "D" | "E" | "U",
  "feedback": string,
  "topic_breakdown": [ { "topic": string, "correct": number, "total": number, "comment": string } ],
  "mistakes": [ { "question": string, "your_answer": string, "correct_answer": string, "topic": string, "marks_lost": number, "why": string } ]
}
Feedback should be 3-5 sentences: what they did well, weakest areas, one concrete next step.

"mistakes" must contain one entry for EVERY question where the student lost one or more marks — including questions left blank (your_answer: ""). Skip questions awarded full marks.
- "question": the question text, trimmed to its essentials.
- "correct_answer": what the mark scheme actually required.
- "why": one sentence on the specific reason the mark was lost (e.g. "described instead of explained — no causal link given").
Return an empty array only if the student scored full marks on everything.`;

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
      mistakes?: Mistake[];
    }>(SYSTEM, userMsg, { temperature: 0.3, maxTokens: 2500 });

    await sb.from("mock_tests").insert({
      user_id: user.id,
      subject_id: subject_id || null,
      score: result.score,
      max_score: result.max_score,
      feedback: result.feedback,
      predicted_grade: result.predicted_grade,
      topic_breakdown: result.topic_breakdown,
    });

    // Error journal: log every dropped mark so it can be reviewed later.
    // A failure here must not lose the student their grade, so it's non-fatal
    // (e.g. the mistakes table hasn't been migrated yet).
    if (result.mistakes?.length) {
      const { error: mErr } = await sb.from("mistakes").insert(
        result.mistakes.slice(0, 30).map((m) => ({
          user_id: user.id,
          subject_id: subject_id || null,
          subject_name: subject ?? null,
          question: String(m.question ?? "").slice(0, 2000),
          your_answer: String(m.your_answer ?? "").slice(0, 2000),
          correct_answer: String(m.correct_answer ?? "").slice(0, 2000),
          topic: m.topic ? String(m.topic).slice(0, 200) : null,
          marks_lost: Number(m.marks_lost) || 0,
          why: m.why ? String(m.why).slice(0, 500) : null,
        })),
      );
      if (mErr) console.error("error journal insert failed:", mErr.message);
    }

    // Results email — fire-and-forget, must never block the response the
    // student is waiting on for their grade.
    const journalUrl = `${process.env.NEXT_PUBLIC_APP_URL}/stats`;
    sendLifecycleEmail(user.id, {
      subject: `${subject ?? "Your mock"}: ${result.score}/${result.max_score} — predicted ${result.predicted_grade}`,
      title: "Your mock is graded",
      body: `
        <p><strong>${subject ?? "Mock test"}</strong></p>
        <p style="font-size:32px;font-weight:600;margin:12px 0">${result.score}<span style="color:#8A8A8A;font-size:18px">/${result.max_score}</span> &nbsp;·&nbsp; Predicted ${result.predicted_grade}</p>
        <p>${result.feedback}</p>
        ${result.mistakes?.length ? `<p style="margin-top:16px"><a href="${journalUrl}" style="color:#0A0A0A;text-decoration:underline">Review the ${result.mistakes.length} marks you dropped →</a></p>` : ""}
      `,
    }).catch((e) => console.error("mock results email failed:", e));

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
