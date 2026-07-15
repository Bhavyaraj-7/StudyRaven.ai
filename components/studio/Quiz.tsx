"use client";

import { useState } from "react";
import { Check, X, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface Question {
  q: string;
  options: string[];
  answer: number;
  explanation: string;
}

export default function Quiz({ questions }: { questions: Question[] }) {
  const [picks, setPicks] = useState<(number | null)[]>(
    questions.map(() => null),
  );
  const [submitted, setSubmitted] = useState(false);

  const score = picks.filter((p, i) => p === questions[i].answer).length;
  const answeredAll = picks.every((p) => p !== null);

  function pick(qi: number, oi: number) {
    if (submitted) return;
    setPicks((p) => p.map((x, i) => (i === qi ? oi : x)));
  }

  function reset() {
    setPicks(questions.map(() => null));
    setSubmitted(false);
  }

  return (
    <div>
      {submitted && (
        <div
          className="rounded-2xl border border-grayline bg-paper p-5 mb-4 flex items-center justify-between"
          aria-live="polite"
        >
          <div>
            <div className="text-3xl font-semibold tabular-nums">
              {score}/{questions.length}
            </div>
            <div className="text-sm text-graymute mt-0.5">
              {score === questions.length
                ? "Perfect — you've got this topic."
                : score >= questions.length * 0.6
                  ? "Solid. Review the ones you missed below."
                  : "Worth another pass — check the explanations."}
            </div>
          </div>
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-lg border border-grayline px-4 py-2 text-sm hover:border-ink min-h-[44px]"
          >
            <RotateCcw className="w-4 h-4" />
            Retry
          </button>
        </div>
      )}

      <ol className="space-y-4">
        {questions.map((question, qi) => (
          <li
            key={qi}
            className="rounded-2xl border border-grayline bg-paper p-5"
          >
            <div className="font-medium text-sm">
              <span className="text-graymute mr-1.5">{qi + 1}.</span>
              {question.q}
            </div>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {question.options.map((opt, oi) => {
                const chosen = picks[qi] === oi;
                const correct = question.answer === oi;
                const showState = submitted;
                return (
                  <button
                    key={oi}
                    type="button"
                    onClick={() => pick(qi, oi)}
                    aria-pressed={chosen}
                    className={cn(
                      "text-left text-sm rounded-xl border px-4 py-3 transition min-h-[44px] flex items-center gap-2",
                      !showState &&
                        (chosen
                          ? "border-accent ring-1 ring-accent"
                          : "border-grayline hover:border-ink"),
                      showState &&
                        correct &&
                        "border-ink bg-graylite font-medium",
                      showState &&
                        chosen &&
                        !correct &&
                        "border-grayline text-graymute line-through",
                      showState && !correct && !chosen && "border-grayline text-graymute",
                    )}
                  >
                    {showState && correct && (
                      <Check className="w-4 h-4 shrink-0" />
                    )}
                    {showState && chosen && !correct && (
                      <X className="w-4 h-4 shrink-0" />
                    )}
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>
            {submitted && (
              <p className="mt-3 text-xs text-graytext border-l-2 border-grayline pl-3">
                {question.explanation}
              </p>
            )}
          </li>
        ))}
      </ol>

      {!submitted && (
        <button
          onClick={() => setSubmitted(true)}
          disabled={!answeredAll}
          className="mt-4 rounded-lg bg-ink text-paper px-6 py-3 text-sm font-medium disabled:opacity-40 min-h-[44px]"
        >
          {answeredAll
            ? "Submit quiz"
            : `Answer all ${questions.length} to submit`}
        </button>
      )}
    </div>
  );
}
