import { supabaseAdmin } from "@/lib/supabase-server";
import type { ReviewRow } from "./review";

interface Raw {
  id: string;
  answer_text: string;
  script: { label: string; consent_confirmed: boolean } | null;
  question: { number: number; question_text: string; max_marks: number; mark_points: unknown; paper_id: string } | null;
  marks: { marker_type: "ai" | "teacher"; marker_id: string | null }[] | null;
}

/** Every answer (optionally for one paper) with its question and who has marked it. */
export async function loadReviewRows(paperId?: string): Promise<ReviewRow[]> {
  let query = supabaseAdmin()
    .from("accuracy_answers")
    .select(
      "id, answer_text, script:accuracy_scripts!inner(label, consent_confirmed), question:accuracy_questions!inner(number, question_text, max_marks, mark_points, paper_id), marks:accuracy_marks(marker_type, marker_id)",
    )
    .limit(5_000);
  if (paperId) query = query.eq("question.paper_id", paperId);
  const { data, error } = await query;
  if (error) throw new Error(`accuracy rows: ${error.message}`);

  return ((data ?? []) as unknown as Raw[])
    .filter((r) => r.script && r.question)
    .map((r) => ({
      answerId: r.id,
      answerText: r.answer_text,
      scriptLabel: r.script!.label,
      consentConfirmed: r.script!.consent_confirmed,
      questionNumber: r.question!.number,
      questionText: r.question!.question_text,
      maxMarks: r.question!.max_marks,
      markPoints: Array.isArray(r.question!.mark_points) ? (r.question!.mark_points as ReviewRow["markPoints"]) : [],
      marks: (r.marks ?? []).map((m) => ({ markerType: m.marker_type, markerId: m.marker_id })),
    }));
}
