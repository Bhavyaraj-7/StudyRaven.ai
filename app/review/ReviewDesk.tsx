"use client";

import { useCallback, useEffect, useState } from "react";
import type { ReviewItem } from "@/lib/accuracy/review";

type State =
  | { kind: "loading" }
  | { kind: "item"; item: ReviewItem; markedByYou: number }
  | { kind: "done"; markedByYou: number }
  | { kind: "error"; message: string };

export default function ReviewDesk() {
  const [state, setState] = useState<State>({ kind: "loading" });
  const [awarded, setAwarded] = useState<string[]>([]);
  const [marks, setMarks] = useState(0);
  const [touchedMarks, setTouchedMarks] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setState({ kind: "loading" });
    setAwarded([]);
    setMarks(0);
    setTouchedMarks(false);
    setError(null);
    try {
      const res = await fetch("/api/accuracy/review", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't load the next answer.");
      setState(data.item ? { kind: "item", item: data.item, markedByYou: data.markedByYou } : { kind: "done", markedByYou: data.markedByYou });
    } catch (e) {
      setState({ kind: "error", message: (e as Error).message });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (state.kind === "loading") return <div className="mt-10 h-64 rounded-object bg-paper-2" aria-busy="true" />;
  if (state.kind === "error") return <p role="alert" className="mt-10 text-danger">{state.message}</p>;
  if (state.kind === "done") {
    return (
      <div className="mt-10 rounded-object border border-grayline p-8">
        <h2 className="text-title font-semibold">Nothing left to mark</h2>
        <p className="mt-2 text-graytext">You&apos;ve marked {state.markedByYou} answers. Thank you.</p>
      </div>
    );
  }

  const { item, markedByYou } = state;
  const pointsSum = Math.min(
    item.markPoints.filter((p) => awarded.includes(p.id)).reduce((s, p) => s + p.marks, 0),
    item.maxMarks,
  );
  const shown = touchedMarks ? marks : pointsSum;

  function toggle(id: string) {
    setAwarded((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));
  }

  async function submit() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/accuracy/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer_id: item.answerId, points_awarded: awarded, marks_awarded: shown }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't save that mark.");
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between text-sm text-graymute">
        <span>
          Script {item.scriptLabel} · Question {item.questionNumber}
        </span>
        <span className="tabular-nums">{markedByYou} marked by you</span>
      </div>

      <div className="mt-3 rounded-object border border-grayline">
        <div className="border-b border-grayline p-5">
          <p className="font-medium">
            {item.questionText} <span className="tabular-nums text-graymute">[{item.maxMarks}]</span>
          </p>
        </div>
        <div className="border-b border-grayline bg-paper-2 p-5">
          <div className="text-sm font-medium text-graytext">Student answer</div>
          <p className="mt-2 whitespace-pre-wrap">{item.answerText}</p>
        </div>
        <fieldset className="p-5">
          <legend className="text-sm font-medium text-graytext">Marking points earned</legend>
          <ul className="mt-3 divide-y divide-grayline">
            {item.markPoints.map((p) => (
              <li key={p.id}>
                <label className="flex min-h-[44px] cursor-pointer items-start gap-3 py-3">
                  <input
                    type="checkbox"
                    checked={awarded.includes(p.id)}
                    onChange={() => toggle(p.id)}
                    className="mt-1 h-4 w-4 accent-[rgb(var(--accent))]"
                  />
                  <span className="flex-1">
                    <span className="font-medium">{p.id}</span> {p.text}
                  </span>
                  <span className="tabular-nums text-graymute">{p.marks}</span>
                </label>
              </li>
            ))}
          </ul>
        </fieldset>
      </div>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <label className="text-sm">
          <span className="block font-medium text-graytext">Marks awarded</span>
          <input
            type="number"
            min={0}
            max={item.maxMarks}
            step={1}
            value={shown}
            onChange={(e) => {
              setTouchedMarks(true);
              setMarks(Math.max(0, Math.min(item.maxMarks, Number(e.target.value) || 0)));
            }}
            className="mt-1 h-11 w-24 rounded-input border border-control-line bg-paper-2 px-3 tabular-nums"
          />
          <span className="ml-2 text-graymute">/ {item.maxMarks}</span>
        </label>
        <button
          type="button"
          onClick={submit}
          disabled={saving}
          className="press h-12 rounded-pill bg-accent px-6 font-semibold text-on-accent hover:bg-accent/90 disabled:opacity-50"
        >
          {saving ? "Saving" : "Save and next"}
        </button>
      </div>
      {error && <p role="alert" className="mt-3 text-sm text-danger">{error}</p>}
    </div>
  );
}
