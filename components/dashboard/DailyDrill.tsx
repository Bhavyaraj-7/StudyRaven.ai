"use client";

import { useEffect, useState } from "react";
import { Flame, Loader2, Zap, Check, X as XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Question {
  q: string;
  answer_hint: string;
}

interface Feedback {
  correct: boolean;
  explanation: string;
}

type Phase = "loading" | "idle" | "starting" | "answering" | "grading" | "done" | "setup" | "error";

export default function DailyDrill() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [streak, setStreak] = useState(0);
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [results, setResults] = useState<Feedback[] | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/drill");
        const data = await res.json();
        if (cancelled) return;
        if (res.status === 503) {
          setPhase("setup");
          return;
        }
        if (!res.ok) throw new Error(data.error);
        setStreak(data.streak ?? 0);
        if (data.today?.score != null) {
          setScore(data.today.score);
          setSubject(data.today.subject ?? "");
          setTopic(data.today.topic ?? "");
          setPhase("done");
        } else if (data.today) {
          setSubject(data.today.subject ?? "");
          setTopic(data.today.topic ?? "");
          setQuestions(data.today.questions ?? []);
          setAnswers((data.today.questions ?? []).map(() => ""));
          setPhase("answering");
        } else {
          setPhase("idle");
        }
      } catch {
        if (!cancelled) setPhase("idle");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function start() {
    setPhase("starting");
    setError(null);
    try {
      const res = await fetch("/api/drill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not start the drill.");
      setSubject(data.subject);
      setTopic(data.topic);
      setQuestions(data.questions);
      setAnswers(data.questions.map(() => ""));
      setPhase("answering");
    } catch (e) {
      setError((e as Error).message);
      setPhase("error");
    }
  }

  async function submit() {
    setPhase("grading");
    setError(null);
    try {
      const res = await fetch("/api/drill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "submit", answers }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Marking failed.");
      setResults(data.results);
      setScore(data.score);
      setStreak((s) => (s === 0 ? 1 : s)); // streak includes today now
      setPhase("done");
    } catch (e) {
      setError((e as Error).message);
      setPhase("answering");
    }
  }

  return (
    <div className="rounded-2xl border border-grayline bg-paper p-5 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold">
          <Zap className="w-4 h-4" />
          Today&apos;s drill
        </div>
        <div
          className="inline-flex items-center gap-1 text-sm font-semibold"
          aria-label={`${streak} day streak`}
        >
          <Flame className="w-4 h-4" />
          {streak}
        </div>
      </div>

      {phase === "loading" && (
        <div className="mt-4 h-16 rounded-xl bg-graylite animate-pulse" aria-hidden="true" />
      )}

      {phase === "setup" && (
        <p className="mt-3 text-sm text-graymute">
          One-time database setup pending — drills unlock right after it.
        </p>
      )}

      {(phase === "idle" || phase === "error" || phase === "starting") && (
        <>
          <p className="mt-2 text-sm text-graymute flex-1">
            5 quick questions on your weakest topic. Keep the flame alive.
          </p>
          {error && (
            <p role="alert" className="mt-2 text-sm text-red-600">
              {error}
            </p>
          )}
          <button
            type="button"
            onClick={start}
            disabled={phase === "starting"}
            className="mt-3 inline-flex items-center justify-center gap-2 rounded-lg bg-ink text-paper px-4 py-2.5 text-sm font-medium disabled:opacity-40 min-h-[44px] active:scale-[0.98] transition"
          >
            {phase === "starting" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Picking your weakest topic...
              </>
            ) : (
              "Start today's drill"
            )}
          </button>
        </>
      )}

      {(phase === "answering" || phase === "grading") && (
        <div className="mt-3">
          <div className="text-xs text-graymute">
            {subject} · {topic}
          </div>
          <ol className="mt-2 space-y-3">
            {questions.map((q, i) => (
              <li key={i}>
                <label className="text-sm text-graytext block">
                  <span className="font-medium">{i + 1}.</span> {q.q}
                  <textarea
                    value={answers[i]}
                    onChange={(e) =>
                      setAnswers((a) => a.map((x, j) => (j === i ? e.target.value : x)))
                    }
                    rows={2}
                    disabled={phase === "grading"}
                    className="mt-1.5 w-full rounded-lg border border-grayline bg-paper px-3 py-2 text-sm outline-none focus:border-ink resize-y disabled:opacity-60"
                    placeholder="Your answer..."
                  />
                </label>
              </li>
            ))}
          </ol>
          {error && (
            <p role="alert" className="mt-2 text-sm text-red-600">
              {error}
            </p>
          )}
          <button
            type="button"
            onClick={submit}
            disabled={phase === "grading" || answers.every((a) => !a.trim())}
            className="mt-3 inline-flex items-center justify-center gap-2 rounded-lg bg-ink text-paper px-4 py-2.5 text-sm font-medium disabled:opacity-40 min-h-[44px] active:scale-[0.98] transition"
          >
            {phase === "grading" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Marking...
              </>
            ) : (
              "Submit answers"
            )}
          </button>
        </div>
      )}

      {phase === "done" && (
        <div className="mt-3" aria-live="polite">
          <div className="text-2xl font-semibold">
            {score}/{results?.length ?? (questions.length || 5)}
          </div>
          <div className="text-xs text-graymute mt-0.5">
            {subject} · {topic} — done for today. Come back tomorrow.
          </div>
          {results && (
            <ul className="mt-3 space-y-2">
              {results.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-graytext">
                  {r.correct ? (
                    <Check className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-label="Correct" />
                  ) : (
                    <XIcon className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-label="Incorrect" />
                  )}
                  <span className={cn(!r.correct && "font-medium")}>{r.explanation}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
