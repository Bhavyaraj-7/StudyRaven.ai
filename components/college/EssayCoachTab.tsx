"use client";

import { useState } from "react";
import { Loader2, PenLine, Quote, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface EssayFeedback {
  overall_score: number;
  scores: { hook: number; structure: number; specificity: number; voice: number };
  verdict: string;
  strengths: string[];
  improvements: string[];
  rewrites: { original: string; suggestion: string; why: string }[];
}

const SCORE_LABELS: { key: keyof EssayFeedback["scores"]; label: string }[] = [
  { key: "hook", label: "Hook" },
  { key: "structure", label: "Structure" },
  { key: "specificity", label: "Specificity" },
  { key: "voice", label: "Voice" },
];

export default function EssayCoachTab() {
  const [prompt, setPrompt] = useState("");
  const [essay, setEssay] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<EssayFeedback | null>(null);

  async function getFeedback() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/college/essay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ essay, prompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not get feedback.");
      setFeedback(data as EssayFeedback);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input side */}
      <div>
        <div className="rounded-2xl border border-grayline bg-paper p-5">
          <div className="flex items-center gap-2 font-semibold">
            <PenLine className="w-4 h-4" />
            Your draft
          </div>
          <p className="text-xs text-graymute mt-1">
            Personal statement, activity description, or scholarship essay —
            paste it and get admissions-reader feedback in seconds.
          </p>
          <label className="block mt-4 text-xs font-medium" htmlFor="essay-prompt">
            Essay prompt <span className="text-graymute font-normal">(optional)</span>
          </label>
          <input
            id="essay-prompt"
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Describe a challenge you overcame"
            className="mt-1.5 w-full rounded-lg border border-grayline bg-paper px-3 py-2.5 text-sm placeholder:text-graymute focus:outline-none focus:ring-2 focus:ring-ink/20"
          />
          <label className="block mt-4 text-xs font-medium" htmlFor="essay-draft">
            Draft <span className="text-red-600" aria-hidden>*</span>
          </label>
          <textarea
            id="essay-draft"
            value={essay}
            onChange={(e) => setEssay(e.target.value)}
            rows={14}
            placeholder="Paste your draft here (at least a full paragraph)..."
            className="mt-1.5 w-full rounded-lg border border-grayline bg-paper px-3 py-2.5 text-sm placeholder:text-graymute focus:outline-none focus:ring-2 focus:ring-ink/20 resize-y"
          />
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-graymute">
              {essay.length.toLocaleString()} characters
            </span>
            <button
              type="button"
              onClick={getFeedback}
              disabled={loading || essay.trim().length < 100}
              className="rounded-lg bg-ink text-paper px-5 py-2.5 text-sm font-medium disabled:opacity-40 inline-flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Reading your essay...
                </>
              ) : (
                "Get feedback"
              )}
            </button>
          </div>
          {error && (
            <p role="alert" className="mt-3 text-xs text-red-600">
              {error}
            </p>
          )}
        </div>
      </div>

      {/* Feedback side */}
      <div>
        {!feedback ? (
          <div className="rounded-2xl border border-dashed border-grayline p-10 text-center text-sm text-graymute h-full flex items-center justify-center">
            Feedback appears here — scores, strengths, fixes, and sentence-level
            rewrites.
          </div>
        ) : (
          <div className="space-y-4">
            {/* Scores */}
            <div className="rounded-2xl border border-grayline bg-paper p-5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm">Overall</span>
                <span className="text-2xl font-semibold">
                  {feedback.overall_score}
                  <span className="text-sm text-graymute font-normal">/100</span>
                </span>
              </div>
              <p className="text-sm text-graytext mt-2">{feedback.verdict}</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                {SCORE_LABELS.map(({ key, label }) => (
                  <div key={key} className="rounded-xl bg-graylite/50 p-3">
                    <div className="text-xs text-graymute">{label}</div>
                    <div className="text-lg font-semibold mt-0.5">
                      {feedback.scores?.[key] ?? "—"}
                      <span className="text-xs text-graymute font-normal">/10</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Strengths & improvements */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-grayline bg-paper p-5">
                <div className="font-semibold text-sm">What works</div>
                <ul className="mt-3 space-y-2">
                  {feedback.strengths?.map((s, i) => (
                    <li key={i} className="text-xs text-graytext flex gap-2">
                      <span className="text-ink shrink-0">+</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-grayline bg-paper p-5">
                <div className="font-semibold text-sm">Fix these</div>
                <ul className="mt-3 space-y-2">
                  {feedback.improvements?.map((s, i) => (
                    <li key={i} className="text-xs text-graytext flex gap-2">
                      <span className="text-graymute shrink-0">{i + 1}.</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Rewrites */}
            {(feedback.rewrites?.length ?? 0) > 0 && (
              <div className="rounded-2xl border border-grayline bg-paper p-5">
                <div className="font-semibold text-sm">Sentence rewrites</div>
                <div className="mt-3 space-y-4">
                  {feedback.rewrites.map((r, i) => (
                    <div key={i} className="rounded-xl bg-graylite/50 p-4">
                      <div className="flex gap-2 text-xs text-graymute">
                        <Quote className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span className="line-through">{r.original}</span>
                      </div>
                      <div className="flex gap-2 text-xs text-ink mt-2">
                        <ArrowRight className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span className="font-medium">{r.suggestion}</span>
                      </div>
                      <p className={cn("text-[11px] text-graymute mt-2 pl-5")}>
                        {r.why}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
