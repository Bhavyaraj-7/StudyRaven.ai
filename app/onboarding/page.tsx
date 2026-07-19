"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase";
import { IGCSE_SUBJECTS, codeForSubject } from "@/lib/igcse-subjects";
import { ChevronRight, Plus, X } from "lucide-react";

type SubjectDraft = { name: string; code: string; exam_date: string };

const IGCSE_BOARDS = ["Cambridge (CIE)", "Edexcel (Pearson)"] as const;
type Board = (typeof IGCSE_BOARDS)[number];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1 — personal
  const [name, setName] = useState("");
  const [grade, setGrade] = useState<number>(10);
  const [country, setCountry] = useState("");

  // Step 2 — IGCSE exam board (curriculum is locked to IGCSE)
  const [board, setBoard] = useState<Board>("Cambridge (CIE)");

  // Step 3 — subjects
  const [subjects, setSubjects] = useState<SubjectDraft[]>([
    { name: "Mathematics", code: "0580", exam_date: "" },
  ]);

  // Step 4 — goals
  const [goal, setGoal] = useState("");
  const [targetGrade, setTargetGrade] = useState("A*");

  function addSubject() {
    setSubjects((s) => [...s, { name: "", code: "", exam_date: "" }]);
  }
  function removeSubject(i: number) {
    setSubjects((s) => s.filter((_, idx) => idx !== i));
  }
  function updateSubject(i: number, patch: Partial<SubjectDraft>) {
    setSubjects((s) => s.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
  }

  async function finish() {
    setLoading(true);
    const sb = supabaseBrowser();
    const { data: auth } = await sb.auth.getUser();
    if (!auth.user) {
      router.push("/login");
      return;
    }
    const uid = auth.user.id;

    await sb
      .from("profiles")
      .update({ name, grade, curriculum: "IGCSE", country })
      .eq("id", uid);

    const valid = subjects.filter((s) => s.name.trim());
    if (valid.length) {
      await sb.from("subjects").insert(
        valid.map((s) => ({
          user_id: uid,
          name: s.name,
          code: s.code || null,
          exam_date: s.exam_date || null,
        })),
      );
    }

    if (goal.trim()) {
      await sb.from("notes").insert({
        user_id: uid,
        title: `Goal: target grade ${targetGrade} · ${board}`,
        content: goal,
        type: "summary",
      });
    }

    // Fire-and-forget — must never block the redirect the student is waiting on.
    fetch("/api/welcome-email", { method: "POST" }).catch(() => {});

    router.push("/studio");
    router.refresh();
  }

  return (
    <main className="min-h-screen flex flex-col bg-paper">
      <header className="px-8 py-6 border-b border-grayline flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold text-[19px] tracking-tight">
          <span className="w-[26px] h-[26px] rounded-[7px] bg-ink text-paper inline-flex items-center justify-center font-mono text-[14px]">
            S
          </span>
          StudyRaven<span className="text-graymute">.ai</span>
        </div>
        <div className="text-sm text-graytext">Step {step} of 4</div>
      </header>

      <div className="flex-1 px-8 py-12 max-w-2xl mx-auto w-full">
        <Progress step={step} />

        {step === 1 && (
          <Step title="Tell us about you" subtitle="So we can personalize everything.">
            <Input label="Full name" value={name} onChange={setName} placeholder="Your full name" />
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Grade"
                value={String(grade)}
                onChange={(v) => setGrade(Number(v))}
                options={["9", "10"]}
              />
              <Input label="Country" value={country} onChange={setCountry} placeholder="India" />
            </div>
            <p className="text-xs text-graymute">
              StudyRaven.ai is built only for IGCSE Grade 9–10. Other curricula
              aren&apos;t supported yet.
            </p>
          </Step>
        )}

        {step === 2 && (
          <Step
            title="Which IGCSE board are you on?"
            subtitle="We'll match papers, mark schemes, and grade boundaries to your board."
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {IGCSE_BOARDS.map((b) => (
                <button
                  key={b}
                  onClick={() => setBoard(b)}
                  className={`rounded-xl border px-6 py-5 text-left transition ${
                    board === b
                      ? "border-ink bg-ink text-paper"
                      : "border-grayline hover:border-graytext"
                  }`}
                >
                  <div className="font-medium">{b}</div>
                  <div className="text-sm opacity-70 mt-1">
                    {b === "Cambridge (CIE)"
                      ? "0580, 0625, 0620, 0455…"
                      : "4MA1, 4PH1, 4CH1…"}
                  </div>
                </button>
              ))}
            </div>
          </Step>
        )}

        {step === 3 && (
          <Step
            title="Your subjects and exam dates"
            subtitle="Add the subjects you're studying. You can edit these later."
          >
            <div className="space-y-3">
              {subjects.map((s, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                  <select
                    value={s.name}
                    onChange={(e) =>
                      updateSubject(i, {
                        name: e.target.value,
                        code: codeForSubject(e.target.value),
                      })
                    }
                    className="col-span-5 rounded-lg border border-grayline px-3 py-2 outline-none focus:border-ink bg-paper"
                  >
                    <option value="">Select subject…</option>
                    {IGCSE_SUBJECTS.map((subj) => (
                      <option key={subj.code} value={subj.name}>
                        {subj.name}
                      </option>
                    ))}
                  </select>
                  <input
                    placeholder="Code"
                    value={s.code}
                    onChange={(e) => updateSubject(i, { code: e.target.value })}
                    className="col-span-2 rounded-lg border border-grayline px-3 py-2 outline-none focus:border-ink"
                  />
                  <input
                    type="date"
                    value={s.exam_date}
                    onChange={(e) =>
                      updateSubject(i, { exam_date: e.target.value })
                    }
                    className="col-span-4 rounded-lg border border-grayline px-3 py-2 outline-none focus:border-ink"
                  />
                  <button
                    onClick={() => removeSubject(i)}
                    className="col-span-1 text-graymute hover:text-ink"
                  >
                    <X className="w-4 h-4 mx-auto" />
                  </button>
                </div>
              ))}
              <button
                onClick={addSubject}
                className="flex items-center gap-2 text-sm text-graytext hover:text-ink"
              >
                <Plus className="w-4 h-4" /> Add subject
              </button>
            </div>
          </Step>
        )}

        {step === 4 && (
          <Step title="What's your goal?" subtitle="Tell us what you're aiming for.">
            <Select
              label="Target grade"
              value={targetGrade}
              onChange={setTargetGrade}
              options={["A*", "A", "B", "C"]}
            />
            <label className="block">
              <span className="text-sm text-graytext">In your own words</span>
              <textarea
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="I want to maintain A* in maths and physics for top engineering programs..."
                rows={4}
                className="mt-1 w-full rounded-lg border border-grayline px-4 py-3 outline-none focus:border-ink resize-none"
              />
            </label>
          </Step>
        )}

        <div className="mt-10 flex items-center justify-between">
          <button
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1}
            className="text-graytext hover:text-ink disabled:opacity-30"
          >
            ← Back
          </button>
          {step < 4 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="inline-flex items-center gap-2 rounded-lg bg-ink text-paper px-6 py-3 hover:opacity-90"
            >
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={finish}
              disabled={loading}
              className="rounded-lg bg-ink text-paper px-6 py-3 hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Finish setup"}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

function Progress({ step }: { step: number }) {
  return (
    <div className="flex gap-2 mb-12">
      {[1, 2, 3, 4].map((n) => (
        <div
          key={n}
          className={`h-1 flex-1 rounded ${n <= step ? "bg-ink" : "bg-grayline"}`}
        />
      ))}
    </div>
  );
}

function Step({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h1 className="text-h2">{title}</h1>
      <p className="mt-2 text-graytext">{subtitle}</p>
      <div className="mt-8 space-y-4">{children}</div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm text-graytext">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg border border-grayline px-4 py-3 outline-none focus:border-ink"
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="text-sm text-graytext">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-grayline px-4 py-3 outline-none focus:border-ink bg-paper"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
