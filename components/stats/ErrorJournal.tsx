"use client";

import { useEffect, useState } from "react";
import { NotebookPen, Check, RotateCcw, Loader2, Trash2 } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase";
import { cn } from "@/lib/utils";

interface Mistake {
  id: string;
  subject_name: string | null;
  question: string;
  your_answer: string | null;
  correct_answer: string | null;
  topic: string | null;
  marks_lost: number;
  why: string | null;
  fixed: boolean;
  created_at: string;
}

/**
 * Error journal — every dropped mark from a graded mock, kept until the student
 * can actually do it. Rows are written by /api/mocks/grade.
 */
export default function ErrorJournal() {
  const [items, setItems] = useState<Mistake[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFixed, setShowFixed] = useState(false);
  const [missing, setMissing] = useState(false);

  async function load() {
    const sb = supabaseBrowser();
    const { data, error } = await sb
      .from("mistakes")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    // Table absent until the migration is run — show a hint rather than crash.
    if (error) setMissing(true);
    setItems(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleFixed(m: Mistake) {
    const next = !m.fixed;
    setItems((xs) =>
      xs.map((x) => (x.id === m.id ? { ...x, fixed: next } : x)),
    );
    await supabaseBrowser()
      .from("mistakes")
      .update({ fixed: next, fixed_at: next ? new Date().toISOString() : null })
      .eq("id", m.id);
  }

  async function remove(id: string) {
    setItems((xs) => xs.filter((x) => x.id !== id));
    await supabaseBrowser().from("mistakes").delete().eq("id", id);
  }

  const open = items.filter((m) => !m.fixed);
  const fixed = items.filter((m) => m.fixed);
  const shown = showFixed ? fixed : open;

  return (
    <div className="rounded-xl border border-grayline p-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 font-semibold">
          <NotebookPen className="w-4 h-4" aria-hidden="true" />
          Error journal
        </div>
        {items.length > 0 && (
          <div className="flex items-center gap-1 bg-graylite rounded-lg p-1">
            <button
              onClick={() => setShowFixed(false)}
              aria-pressed={!showFixed}
              className={cn(
                "px-3 py-1 rounded-md text-xs font-medium",
                !showFixed ? "bg-paper shadow-sm" : "text-graytext",
              )}
            >
              To fix ({open.length})
            </button>
            <button
              onClick={() => setShowFixed(true)}
              aria-pressed={showFixed}
              className={cn(
                "px-3 py-1 rounded-md text-xs font-medium",
                showFixed ? "bg-paper shadow-sm" : "text-graytext",
              )}
            >
              Fixed ({fixed.length})
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-graymute mt-4" aria-hidden="true" />
      ) : missing ? (
        <p className="text-sm text-graymute mt-3">
          Run the <code className="font-mono text-xs">20260716_error_journal.sql</code>{" "}
          migration in Supabase to switch this on.
        </p>
      ) : items.length === 0 ? (
        <p className="text-sm text-graymute mt-3">
          Take a mock and every question you drop marks on lands here — with what
          the mark scheme wanted, and why you lost it.
        </p>
      ) : shown.length === 0 ? (
        <p className="text-sm text-graymute mt-3">
          {showFixed
            ? "Nothing fixed yet."
            : "Nothing left to fix. Every mistake is cleared. 🎉"}
        </p>
      ) : (
        <ul className="mt-4 space-y-2" aria-live="polite">
          {shown.map((m) => (
            <li key={m.id} className="rounded-xl border border-grayline">
              <details className="group">
                <summary className="cursor-pointer list-none px-4 py-3 flex items-start justify-between gap-3 min-h-[44px]">
                  <span className="flex-1">
                    <span className={cn("text-sm", m.fixed && "line-through text-graymute")}>
                      {m.question.length > 110
                        ? m.question.slice(0, 110) + "…"
                        : m.question}
                    </span>
                    <span className="flex items-center gap-2 mt-1 text-xs text-graymute">
                      {m.subject_name && <span>{m.subject_name}</span>}
                      {m.topic && <span>· {m.topic}</span>}
                      <span>· −{m.marks_lost} {m.marks_lost === 1 ? "mark" : "marks"}</span>
                    </span>
                  </span>
                </summary>

                <div className="px-4 pb-4 pt-1 border-t border-grayline space-y-3 text-sm">
                  {m.why && (
                    <p className="text-graytext">
                      <span className="text-graymute">Why you lost it: </span>
                      {m.why}
                    </p>
                  )}
                  <div>
                    <div className="text-graymute text-xs">You wrote</div>
                    <p className="mt-0.5">
                      {m.your_answer?.trim() ? m.your_answer : <em className="text-graymute">left blank</em>}
                    </p>
                  </div>
                  <div>
                    <div className="text-graymute text-xs">The mark scheme wanted</div>
                    <p className="mt-0.5">{m.correct_answer}</p>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => toggleFixed(m)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-grayline px-3 py-2 text-xs hover:border-ink min-h-[44px]"
                    >
                      {m.fixed ? (
                        <>
                          <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" /> Move back
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" aria-hidden="true" /> I can do this now
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => remove(m.id)}
                      aria-label="Delete this entry"
                      className="text-graymute hover:text-ink p-2 min-h-[44px]"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
