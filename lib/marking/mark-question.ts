import { z } from "zod";
import { chatJson, type Usage } from "@/lib/ai/client";

// Per-question marking against explicit marking points. This is the marker
// the accuracy programme measures (R0), and the one Snap & Mark and the
// Mock Series will use. The AI only says which points were earned; the
// server adds up the marks, so arithmetic can't drift.

export interface MarkPoint {
  id: string;
  text: string;
  marks: number;
}

export interface QuestionToMark {
  questionText: string;
  maxMarks: number;
  markPoints: MarkPoint[];
  answer: string;
}

export interface QuestionMark {
  pointsAwarded: string[];
  marks: number;
  model: string;
  usage: Usage;
}

const Reply = z.object({
  awarded: z.array(z.object({ id: z.string(), evidence: z.string().max(400).catch("") })).max(30),
});

const SYSTEM = `You are a strict, fair IGCSE examiner. Mark ONE answer against the marking points given.
Award a marking point only if the answer clearly contains that idea, even if the wording differs.
Do not award a point for something vague, contradicted elsewhere in the answer, or merely implied.
Ignore spelling mistakes unless they change the meaning. Never invent marking points.
Reply as JSON: { "awarded": [ { "id": "<marking point id>", "evidence": "<short quote from the answer>" } ] }
Leave "awarded" empty if nothing earns a mark.`;

/** Marks earned = sum of the awarded points' marks, capped at the question's total. */
export function totalFor(points: MarkPoint[], awardedIds: string[], maxMarks: number): number {
  const ids = new Set(awardedIds);
  const sum = points.filter((p) => ids.has(p.id)).reduce((s, p) => s + p.marks, 0);
  return Math.min(sum, maxMarks);
}

export async function markQuestion(q: QuestionToMark): Promise<QuestionMark> {
  const points = q.markPoints.map((p) => `- ${p.id} (${p.marks} mark${p.marks === 1 ? "" : "s"}): ${p.text}`).join("\n");
  const user = `QUESTION (${q.maxMarks} marks):\n${q.questionText}\n\nMARKING POINTS:\n${points}\n\nSTUDENT ANSWER:\n"""\n${q.answer.slice(0, 6_000)}\n"""`;
  const { data, model, usage } = await chatJson(Reply, SYSTEM, user, { task: "marking", temperature: 0 });

  const known = new Set(q.markPoints.map((p) => p.id));
  const pointsAwarded = [...new Set(data.awarded.map((a) => a.id).filter((id) => known.has(id)))];
  return { pointsAwarded, marks: totalFor(q.markPoints, pointsAwarded, q.maxMarks), model, usage };
}
