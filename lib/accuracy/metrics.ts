// Marking accuracy maths (master prompt §10A.3). Pure functions, no I/O,
// so every number on /accuracy can be traced and unit-tested.

export interface MarkedAnswer {
  scriptId: string;
  questionId: string;
  maxMarks: number;
  ai: number | null;
  /** One entry per teacher who marked it blind. */
  teachers: number[];
}

export interface GradeBoundary {
  grade: string;
  /** Minimum total for this grade. */
  min: number;
}

export interface Bar {
  minScripts: number;
  /** Share of question marks within ±1 of the teacher. */
  questionWithin1: number;
  /** Share of predicted grades within one grade of the teacher's. */
  gradeWithin1: number;
}

/** Suggested bar from §10A.3. The founder sets the real one. */
export const DEFAULT_BAR: Bar = { minScripts: 50, questionWithin1: 0.85, gradeWithin1: 0.9 };

export interface AccuracyResult {
  scripts: number;
  answers: number;
  questionExact: number;
  questionWithin1: number;
  totalMae: number;
  gradeExact: number | null;
  gradeWithin1: number | null;
  teacherAgreementWithin1: number | null;
  passed: boolean;
  reasons: string[];
}

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

/** Teacher reference mark: the mean when two or more teachers marked. */
export function teacherMark(marks: number[]): number {
  return mean(marks);
}

/** Index into boundaries sorted high to low; the lowest band catches the rest. */
export function gradeIndex(total: number, boundaries: GradeBoundary[]): number {
  const sorted = [...boundaries].sort((a, b) => b.min - a.min);
  const i = sorted.findIndex((b) => total >= b.min);
  return i === -1 ? sorted.length : i;
}

/**
 * Compares AI and teacher marks. Only scripts where every answer has an AI
 * mark and at least one teacher mark count, so a half-marked script can't
 * flatter the numbers.
 */
export function computeAccuracy(
  answers: MarkedAnswer[],
  boundaries: GradeBoundary[] = [],
  bar: Bar = DEFAULT_BAR,
): AccuracyResult {
  const byScript = new Map<string, MarkedAnswer[]>();
  for (const a of answers) byScript.set(a.scriptId, [...(byScript.get(a.scriptId) ?? []), a]);

  const complete = [...byScript.values()].filter((list) =>
    list.every((a) => a.ai !== null && a.teachers.length > 0),
  );
  const used = complete.flat();
  const reasons: string[] = [];

  if (used.length === 0) {
    return {
      scripts: 0, answers: 0, questionExact: 0, questionWithin1: 0, totalMae: 0,
      gradeExact: null, gradeWithin1: null, teacherAgreementWithin1: null,
      passed: false, reasons: ["No fully marked scripts yet."],
    };
  }

  const diffs = used.map((a) => Math.abs((a.ai as number) - teacherMark(a.teachers)));
  const questionExact = diffs.filter((d) => d < 0.5).length / diffs.length;
  const questionWithin1 = diffs.filter((d) => d <= 1).length / diffs.length;

  const totals = complete.map((list) => ({
    ai: list.reduce((s, a) => s + (a.ai as number), 0),
    teacher: list.reduce((s, a) => s + teacherMark(a.teachers), 0),
  }));
  const totalMae = mean(totals.map((t) => Math.abs(t.ai - t.teacher)));

  let gradeExact: number | null = null;
  let gradeWithin1: number | null = null;
  if (boundaries.length > 0) {
    const gaps = totals.map((t) => Math.abs(gradeIndex(t.ai, boundaries) - gradeIndex(t.teacher, boundaries)));
    gradeExact = gaps.filter((g) => g === 0).length / gaps.length;
    gradeWithin1 = gaps.filter((g) => g <= 1).length / gaps.length;
  }

  // How much two teachers agree is the honest ceiling for the AI.
  const doubled = used.filter((a) => a.teachers.length >= 2);
  const teacherAgreementWithin1 = doubled.length
    ? doubled.filter((a) => Math.abs(a.teachers[0] - a.teachers[1]) <= 1).length / doubled.length
    : null;

  if (complete.length < bar.minScripts) reasons.push(`Only ${complete.length} of ${bar.minScripts} scripts needed.`);
  if (questionWithin1 < bar.questionWithin1) {
    reasons.push(`${pct(questionWithin1)} of question marks within ±1 (needs ${pct(bar.questionWithin1)}).`);
  }
  if (gradeWithin1 === null) reasons.push("No grade boundaries set for this paper.");
  else if (gradeWithin1 < bar.gradeWithin1) {
    reasons.push(`${pct(gradeWithin1)} of grades within one grade (needs ${pct(bar.gradeWithin1)}).`);
  }

  return {
    scripts: complete.length,
    answers: used.length,
    questionExact,
    questionWithin1,
    totalMae,
    gradeExact,
    gradeWithin1,
    teacherAgreementWithin1,
    passed: reasons.length === 0,
    reasons,
  };
}

export function pct(x: number): string {
  return `${Math.round(x * 100)}%`;
}
