"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Save, Calculator } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import type { Subject } from "@/types";

type Scale = "letter" | "number";

const LETTER_GRADES = ["A*", "A", "B", "C", "D", "E", "F", "G"] as const;
const NUMBER_GRADES = ["9", "8", "7", "6", "5", "4", "3", "2", "1"] as const;

// Approximate IGCSE → US 4.0 GPA conversion. Universities differ — we show
// the mapping openly so students know what they're looking at.
const LETTER_POINTS: Record<string, number> = {
  "A*": 4.0, A: 3.7, B: 3.0, C: 2.0, D: 1.0, E: 0.7, F: 0.3, G: 0.0,
};
const NUMBER_POINTS: Record<string, number> = {
  "9": 4.0, "8": 3.9, "7": 3.7, "6": 3.0, "5": 2.5, "4": 2.0, "3": 1.0, "2": 0.5, "1": 0.0,
};

function pointsFor(grade: string): number | null {
  if (grade in LETTER_POINTS) return LETTER_POINTS[grade];
  if (grade in NUMBER_POINTS) return NUMBER_POINTS[grade];
  return null;
}

export default function GpaTab() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [grades, setGrades] = useState<Record<string, string>>({});
  const [scale, setScale] = useState<Scale>("letter");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [targetGpa, setTargetGpa] = useState("3.7");

  useEffect(() => {
    supabaseBrowser()
      .from("subjects")
      .select("*")
      .order("name")
      .then(({ data }) => {
        const subs = (data ?? []) as Subject[];
        setSubjects(subs);
        const initial: Record<string, string> = {};
        for (const s of subs) {
          if (s.predicted_grade) initial[s.id] = s.predicted_grade;
        }
        setGrades(initial);
        // If saved grades are numeric, open in the 9-1 scale.
        if (Object.values(initial).some((g) => g in NUMBER_POINTS)) {
          setScale("number");
        }
        setLoading(false);
      });
  }, []);

  const gradeOptions = scale === "letter" ? LETTER_GRADES : NUMBER_GRADES;

  const { gpa, gradedCount } = useMemo(() => {
    const pts = subjects
      .map((s) => (grades[s.id] ? pointsFor(grades[s.id]) : null))
      .filter((p): p is number => p !== null);
    if (!pts.length) return { gpa: null as number | null, gradedCount: 0 };
    return {
      gpa: pts.reduce((a, b) => a + b, 0) / pts.length,
      gradedCount: pts.length,
    };
  }, [subjects, grades]);

  const targetAnalysis = useMemo(() => {
    const target = parseFloat(targetGpa);
    if (isNaN(target) || target <= 0 || target > 4 || !subjects.length) return null;
    const gradedPts = subjects
      .map((s) => (grades[s.id] ? pointsFor(grades[s.id]) : null))
      .filter((p): p is number => p !== null);
    const remaining = subjects.length - gradedPts.length;
    const sum = gradedPts.reduce((a, b) => a + b, 0);

    if (remaining === 0) {
      if (gpa !== null && gpa >= target) return { met: true as const };
      return { met: false as const, impossible: true as const };
    }
    const neededAvg = (target * subjects.length - sum) / remaining;
    if (neededAvg > 4.0) return { met: false as const, impossible: true as const };
    if (neededAvg <= 0) return { met: true as const };

    // Map required average points back to the nearest achievable grade.
    const table = scale === "letter" ? LETTER_POINTS : NUMBER_POINTS;
    const entries = Object.entries(table).sort((a, b) => a[1] - b[1]);
    const needGrade =
      entries.find(([, p]) => p >= neededAvg)?.[0] ?? entries[entries.length - 1][0];
    return { met: false as const, impossible: false as const, neededAvg, needGrade, remaining };
  }, [targetGpa, subjects, grades, gpa, scale]);

  async function save() {
    setSaving(true);
    setSaved(false);
    const sb = supabaseBrowser();
    await Promise.all(
      subjects
        .filter((s) => grades[s.id] && grades[s.id] !== s.predicted_grade)
        .map((s) =>
          sb.from("subjects").update({ predicted_grade: grades[s.id] }).eq("id", s.id),
        ),
    );
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (loading) {
    return <div className="text-graymute">Loading subjects...</div>;
  }

  if (!subjects.length) {
    return (
      <div className="rounded-2xl border border-grayline p-8 text-center max-w-xl">
        <p className="text-graytext">
          Add your subjects first (via onboarding or the Subjects page) to
          calculate your GPA.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Grade inputs */}
      <div className="lg:col-span-3">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-graytext">
            Predicted grade per subject
          </div>
          <div className="inline-flex rounded-lg border border-grayline p-0.5">
            {(["letter", "number"] as Scale[]).map((s) => (
              <button
                key={s}
                onClick={() => {
                  setScale(s);
                  setGrades({});
                }}
                className={cn(
                  "px-3 py-1.5 text-xs rounded-md",
                  scale === s ? "bg-ink text-paper" : "text-graytext",
                )}
              >
                {s === "letter" ? "A*–G" : "9–1"}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          {subjects.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between rounded-xl border border-grayline px-4 py-3"
            >
              <div className="font-medium text-sm">{s.name}</div>
              <div className="flex gap-1">
                {gradeOptions.map((g) => (
                  <button
                    key={g}
                    onClick={() =>
                      setGrades((prev) => ({ ...prev, [s.id]: g }))
                    }
                    className={cn(
                      "w-8 h-8 rounded-md text-xs border",
                      grades[s.id] === g
                        ? "bg-ink text-paper border-ink"
                        : "border-grayline text-graytext hover:border-ink",
                    )}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-ink text-paper px-5 py-2.5 text-sm disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saved ? "Saved!" : "Save predicted grades"}
        </button>
      </div>

      {/* GPA result + target calculator */}
      <div className="lg:col-span-2 space-y-4">
        <div className="rounded-2xl border border-grayline bg-paper p-6">
          <div className="text-sm text-graymute">Predicted GPA (4.0 scale)</div>
          <div className="text-6xl font-semibold mt-2">
            {gpa === null ? "—" : gpa.toFixed(2)}
          </div>
          <div className="text-xs text-graymute mt-2">
            Based on {gradedCount}/{subjects.length} subjects graded
          </div>
          <div className="h-2 bg-graylite rounded mt-4">
            <div
              className="h-full bg-ink rounded"
              style={{ width: `${((gpa ?? 0) / 4) * 100}%` }}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-grayline bg-paper p-6">
          <div className="flex items-center gap-2 font-semibold text-sm">
            <Calculator className="w-4 h-4" />
            Target GPA calculator
          </div>
          <label className="block mt-3">
            <span className="text-xs text-graymute">Target GPA</span>
            <input
              value={targetGpa}
              onChange={(e) => setTargetGpa(e.target.value)}
              inputMode="decimal"
              className="mt-1 w-full rounded-lg border border-grayline px-3 py-2 text-sm outline-none focus:border-ink"
              placeholder="e.g. 3.7"
            />
          </label>
          <div className="mt-3 text-sm text-graytext">
            {!targetAnalysis && "Enter a target between 0 and 4.0."}
            {targetAnalysis && "met" in targetAnalysis && targetAnalysis.met && (
              <span>You&apos;re already on track for this target. Keep it up!</span>
            )}
            {targetAnalysis &&
              !targetAnalysis.met &&
              targetAnalysis.impossible && (
                <span>
                  This target isn&apos;t reachable with the current predictions —
                  you&apos;d need to raise some existing grades.
                </span>
              )}
            {targetAnalysis &&
              !targetAnalysis.met &&
              !targetAnalysis.impossible && (
                <span>
                  You need to average{" "}
                  <strong className="text-ink">
                    {targetAnalysis.neededAvg.toFixed(2)} points
                  </strong>{" "}
                  (about a <strong className="text-ink">{targetAnalysis.needGrade}</strong>)
                  across your {targetAnalysis.remaining} ungraded subject
                  {targetAnalysis.remaining > 1 ? "s" : ""}.
                </span>
              )}
          </div>
        </div>

        <p className="text-xs text-graymute">
          Conversion is approximate (A* = 4.0, A = 3.7, B = 3.0, C = 2.0 ·
          9 = 4.0, 8 = 3.9, 7 = 3.7, 6 = 3.0, 5 = 2.5, 4 = 2.0). Different
          universities convert IGCSE grades differently — always check theirs.
        </p>
      </div>
    </div>
  );
}
