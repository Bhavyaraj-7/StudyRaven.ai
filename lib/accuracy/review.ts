// Picks what a teacher reviews next and shapes what they see. Pure, so the
// "blind" guarantee is unit-tested: the payload never carries any marks.

export interface ReviewRow {
  answerId: string;
  answerText: string;
  scriptLabel: string;
  consentConfirmed: boolean;
  questionNumber: number;
  questionText: string;
  maxMarks: number;
  markPoints: { id: string; text: string; marks: number }[];
  marks: { markerType: "ai" | "teacher"; markerId: string | null }[];
}

export interface ReviewItem {
  answerId: string;
  scriptLabel: string;
  questionNumber: number;
  questionText: string;
  maxMarks: number;
  markPoints: { id: string; text: string; marks: number }[];
  answerText: string;
}

/**
 * Next answer for this reviewer: consented scripts only, never one they've
 * already marked. Unmarked answers first, then ones with a single teacher
 * mark (second marking measures teacher agreement). Stable order.
 */
export function pickNext(rows: ReviewRow[], reviewerId: string): ReviewRow | null {
  const open = rows.filter(
    (r) => r.consentConfirmed && !r.marks.some((m) => m.markerType === "teacher" && m.markerId === reviewerId),
  );
  const teacherCount = (r: ReviewRow) => r.marks.filter((m) => m.markerType === "teacher").length;
  open.sort(
    (a, b) =>
      teacherCount(a) - teacherCount(b) ||
      a.scriptLabel.localeCompare(b.scriptLabel) ||
      a.questionNumber - b.questionNumber,
  );
  return open[0] ?? null;
}

/** What the teacher sees. Deliberately no marks of any kind. */
export function toReviewItem(r: ReviewRow): ReviewItem {
  return {
    answerId: r.answerId,
    scriptLabel: r.scriptLabel,
    questionNumber: r.questionNumber,
    questionText: r.questionText,
    maxMarks: r.maxMarks,
    markPoints: r.markPoints,
    answerText: r.answerText,
  };
}
