import { beforeEach, describe, expect, it, vi } from "vitest";
import { computeAccuracy, gradeIndex, type MarkedAnswer } from "@/lib/accuracy/metrics";

// vi.mock is hoisted above everything, so its spy must be hoisted too.
const { maybeSingle } = vi.hoisted(() => ({ maybeSingle: vi.fn() }));
vi.mock("@/lib/supabase-server", () => ({
  supabaseAdmin: () => ({
    from: () => ({ select: () => ({ eq: () => ({ eq: () => ({ order: () => ({ limit: () => ({ maybeSingle }) }) }) }) }) }),
  }),
}));

const BOUNDS = [
  { grade: "A*", min: 18 },
  { grade: "A", min: 15 },
  { grade: "B", min: 12 },
  { grade: "C", min: 9 },
];

/** n scripts, each with 4 questions worth 5 marks. */
function scripts(n: number, ai: (s: number, q: number) => number | null, teacher: (s: number, q: number) => number[]): MarkedAnswer[] {
  return Array.from({ length: n }, (_, s) =>
    Array.from({ length: 4 }, (_, q) => ({ scriptId: `S${s}`, questionId: `Q${q}`, maxMarks: 5, ai: ai(s, q), teachers: teacher(s, q) })),
  ).flat();
}

describe("gradeIndex()", () => {
  it("maps totals to bands from the top, with a band below the lowest", () => {
    expect(gradeIndex(19, BOUNDS)).toBe(0);
    expect(gradeIndex(15, BOUNDS)).toBe(1);
    expect(gradeIndex(9, BOUNDS)).toBe(3);
    expect(gradeIndex(3, BOUNDS)).toBe(4);
  });
});

describe("computeAccuracy()", () => {
  it("is perfect when the AI matches the teacher exactly", () => {
    const r = computeAccuracy(scripts(50, () => 4, () => [4]), BOUNDS);
    expect(r).toMatchObject({ scripts: 50, answers: 200, questionExact: 1, questionWithin1: 1, totalMae: 0, gradeExact: 1, passed: true });
  });

  it("counts within ±1 separately from exact", () => {
    const r = computeAccuracy(scripts(50, (_s, q) => (q === 0 ? 3 : 4), () => [4]), BOUNDS);
    expect(r.questionExact).toBe(0.75);
    expect(r.questionWithin1).toBe(1);
    expect(r.totalMae).toBe(1);
  });

  it("fails the bar with fewer than 50 scripts, and says why", () => {
    const r = computeAccuracy(scripts(20, () => 4, () => [4]), BOUNDS);
    expect(r.passed).toBe(false);
    expect(r.reasons[0]).toContain("Only 20 of 50 scripts");
  });

  it("fails when too many question marks are more than 1 out", () => {
    const r = computeAccuracy(scripts(50, (_s, q) => (q < 2 ? 1 : 4), () => [4]), BOUNDS);
    expect(r.questionWithin1).toBe(0.5);
    expect(r.passed).toBe(false);
  });

  it("ignores scripts that aren't fully marked yet", () => {
    const answers = scripts(50, () => 4, () => [4]);
    answers.push({ scriptId: "half", questionId: "Q0", maxMarks: 5, ai: 0, teachers: [] });
    const r = computeAccuracy(answers, BOUNDS);
    expect(r.scripts).toBe(50);
    expect(r.questionExact).toBe(1);
  });

  it("uses the mean of two teachers and reports their agreement", () => {
    const r = computeAccuracy(scripts(50, () => 4, (_s, q) => (q === 0 ? [3, 5] : [4, 4])), BOUNDS);
    expect(r.questionExact).toBe(1);
    expect(r.teacherAgreementWithin1).toBe(0.75);
  });

  it("can't pass without grade boundaries", () => {
    const r = computeAccuracy(scripts(50, () => 4, () => [4]));
    expect(r.gradeWithin1).toBeNull();
    expect(r.passed).toBe(false);
  });

  it("reports nothing measured when there are no marks", () => {
    expect(computeAccuracy([]).reasons).toEqual(["No fully marked scripts yet."]);
  });
});

describe("predictedGradeGate()", () => {
  beforeEach(() => {
    maybeSingle.mockReset();
    delete process.env.FLAG_GATE_PREDICTED_GRADES;
  });

  it("allows everything while the flag is off (today's behaviour)", async () => {
    const { predictedGradeGate } = await import("@/lib/accuracy/gate");
    expect(await predictedGradeGate("Physics")).toEqual({ allowed: true });
    expect(maybeSingle).not.toHaveBeenCalled();
  });

  it("with the flag on, hides grades for subjects never measured", async () => {
    process.env.FLAG_GATE_PREDICTED_GRADES = "1";
    maybeSingle.mockResolvedValue({ data: null, error: null });
    const { predictedGradeGate } = await import("@/lib/accuracy/gate");
    expect(await predictedGradeGate("Physics")).toEqual({ allowed: false, reason: "not_measured" });
  });

  it("with the flag on, follows the latest published run", async () => {
    process.env.FLAG_GATE_PREDICTED_GRADES = "true";
    const { predictedGradeGate } = await import("@/lib/accuracy/gate");
    maybeSingle.mockResolvedValue({ data: { passed: true }, error: null });
    expect(await predictedGradeGate("Physics")).toEqual({ allowed: true });
    maybeSingle.mockResolvedValue({ data: { passed: false }, error: null });
    expect(await predictedGradeGate("Physics")).toEqual({ allowed: false, reason: "below_bar" });
  });

  it("fails closed when the database can't be read", async () => {
    process.env.FLAG_GATE_PREDICTED_GRADES = "1";
    maybeSingle.mockResolvedValue({ data: null, error: { message: "relation does not exist" } });
    const { predictedGradeGate } = await import("@/lib/accuracy/gate");
    expect((await predictedGradeGate("Physics")).allowed).toBe(false);
  });
});
