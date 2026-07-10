"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, TimerReset } from "lucide-react";

export default function AiPracticeTab({
  mode,
  isPro,
}: {
  mode: "papers" | "marks";
  isPro: boolean;
}) {
  const router = useRouter();
  const [subject, setSubject] = useState("Mathematics");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ questions?: any[]; mark_scheme?: any[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai-paper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, difficulty }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  if (!isPro) {
    return (
      <div className="rounded-2xl border border-grayline p-10 text-center bg-graylite/50">
        <Sparkles className="w-6 h-6 mx-auto" />
        <h3 className="text-lg font-semibold mt-3">AI practice is a Pro feature</h3>
        <p className="text-sm text-graytext mt-1">
          Generate original {mode === "papers" ? "practice papers" : "mark schemes"} on demand.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Subject"
          className="rounded-lg border border-grayline px-4 py-2.5 outline-none focus:border-ink"
        />
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as any)}
          className="rounded-lg border border-grayline px-4 py-2.5 outline-none focus:border-ink bg-paper"
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        <button
          onClick={generate}
          disabled={loading}
          className="rounded-lg bg-ink text-paper px-4 py-2.5 inline-flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Generate
        </button>
      </div>

      {error && (
        <div className="text-sm text-red-600 border border-red-200 bg-red-50 rounded-lg p-3 mb-4">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-6">
          <button
            onClick={() => {
              sessionStorage.setItem(
                "sr-mock-paper",
                JSON.stringify({
                  subject,
                  questions: result.questions ?? [],
                  mark_scheme: result.mark_scheme ?? [],
                }),
              );
              router.push("/mocks?fromPaper=1");
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-ink text-paper px-4 py-2.5 text-sm"
          >
            <TimerReset className="w-4 h-4" />
            Take this paper as a timed mock
          </button>
          {mode === "papers" && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Questions</h3>
              <ol className="space-y-3 list-decimal pl-6">
                {result.questions?.map((q: any, i: number) => (
                  <li key={i}>
                    <div>{q.text}</div>
                    <div className="text-xs text-graymute">[{q.marks} marks]</div>
                  </li>
                ))}
              </ol>
            </div>
          )}
          {(mode === "marks" || mode === "papers") && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Mark scheme</h3>
              <ol className="space-y-3 list-decimal pl-6">
                {result.mark_scheme?.map((m: any, i: number) => (
                  <li key={i}>
                    <div>{m.answer}</div>
                    <div className="text-xs text-graymute">[{m.marks} marks]</div>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
