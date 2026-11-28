import { describe, expect, it, vi } from "vitest";
import { pickNext, toReviewItem, type ReviewRow } from "@/lib/accuracy/review";
import { totalFor } from "@/lib/marking/mark-question";

const { chatJson } = vi.hoisted(() => ({ chatJson: vi.fn() }));
vi.mock("@/lib/ai/client", () => ({ chatJson }));

const POINTS = [
  { id: "M1", text: "Uses a = (v - u) / t", marks: 1 },
  { id: "A1", text: "a = 2.5 m/s²", marks: 1 },
  { id: "M2", text: "Uses F = ma", marks: 1 },
  { id: "A2", text: "F = 3000 N with unit", marks: 1 },
];

function row(over: Partial<ReviewRow>): ReviewRow {
  return {
    answerId: "a1",
    answerText: "a = 2.5, F = 3000",
    scriptLabel: "S-001",
    consentConfirmed: true,
    questionNumber: 1,
    questionText: "Calculate the force.",
    maxMarks: 4,
    markPoints: POINTS,
    marks: [],
    ...over,
  };
}

describe("blind review", () => {
  it("never shows a teacher any mark", () => {
    const item = toReviewItem(row({ marks: [{ markerType: "ai", markerId: null }, { markerType: "teacher", markerId: "t2" }] }));
    expect(Object.keys(item).sort()).toEqual(
      ["answerId", "answerText", "markPoints", "maxMarks", "questionNumber", "questionText", "scriptLabel"].sort(),
    );
    expect(JSON.stringify(item)).not.toMatch(/marks_awarded|markerType|"ai"/);
  });

  it("skips answers without consent and ones this teacher already marked", () => {
    const rows = [
      row({ answerId: "no-consent", consentConfirmed: false }),
      row({ answerId: "mine", marks: [{ markerType: "teacher", markerId: "t1" }] }),
      row({ answerId: "open", scriptLabel: "S-002" }),
    ];
    expect(pickNext(rows, "t1")?.answerId).toBe("open");
  });

  it("serves unmarked answers before second-marking", () => {
    const rows = [
      row({ answerId: "once", scriptLabel: "S-001", marks: [{ markerType: "teacher", markerId: "t2" }] }),
      row({ answerId: "never", scriptLabel: "S-009" }),
    ];
    expect(pickNext(rows, "t1")?.answerId).toBe("never");
  });

  it("an AI mark doesn't count as a teacher mark", () => {
    const rows = [
      row({ answerId: "ai-only", scriptLabel: "S-001", marks: [{ markerType: "ai", markerId: null }] }),
      row({ answerId: "teacher-once", scriptLabel: "S-000", marks: [{ markerType: "teacher", markerId: "t2" }] }),
    ];
    expect(pickNext(rows, "t1")?.answerId).toBe("ai-only");
  });

  it("returns null when everything is marked", () => {
    expect(pickNext([row({ marks: [{ markerType: "teacher", markerId: "t1" }] })], "t1")).toBeNull();
  });
});

describe("per-question marker", () => {
  it("adds up only the awarded points and caps at the total", () => {
    expect(totalFor(POINTS, ["M1", "A1", "M2"], 4)).toBe(3);
    expect(totalFor([...POINTS, { id: "B1", text: "extra", marks: 3 }], ["M1", "A1", "M2", "A2", "B1"], 4)).toBe(4);
    expect(totalFor(POINTS, [], 4)).toBe(0);
  });

  it("ignores marking points the AI invents or repeats", async () => {
    chatJson.mockResolvedValue({
      data: { awarded: [{ id: "M1", evidence: "a = 2.5" }, { id: "M1", evidence: "" }, { id: "Z9", evidence: "made up" }] },
      model: "test-model",
      usage: { promptTokens: 1, completionTokens: 1 },
    });
    const { markQuestion } = await import("@/lib/marking/mark-question");
    const r = await markQuestion({ questionText: "q", maxMarks: 4, markPoints: POINTS, answer: "a = 2.5" });
    expect(r.pointsAwarded).toEqual(["M1"]);
    expect(r.marks).toBe(1);
  });
});
