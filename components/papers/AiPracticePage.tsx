"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  TimerReset,
  ScrollText,
  Target,
  FileCheck2,
  X,
} from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase";
import { extractPdfText } from "@/lib/pdf";
import CommandWordCoach from "@/components/papers/CommandWordCoach";
import type { UserPaper } from "@/types";

interface Question {
  text: string;
  marks: number;
}
interface MarkSchemeItem {
  answer: string;
  marks: number;
}

/**
 * AI practice. Pro gating lives in AiTutorPage — this panel assumes access.
 * Generation is grounded in the student's own mark scheme whenever the library
 * has one for the chosen subject, so questions and marking match their board.
 */
export default function AiPracticePanel() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);
  const [subject, setSubject] = useState("Mathematics");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    questions?: Question[];
    mark_scheme?: MarkSchemeItem[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Mark-scheme grounding, pulled from the student's library.
  const [papers, setPapers] = useState<UserPaper[]>([]);
  const [scheme, setScheme] = useState("");
  const [schemeLabel, setSchemeLabel] = useState<string | null>(null);
  const [reading, setReading] = useState(false);

  useEffect(() => {
    const sb = supabaseBrowser();
    sb.from("subjects")
      .select("id, name")
      .order("name")
      .then(({ data }) => {
        setSubjects(data ?? []);
        if (data?.[0]) setSubject(data[0].name);
      });
    sb.from("user_papers")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => setPapers(data ?? []));
  }, []);

  // Mark schemes the student uploaded for the currently selected subject.
  const schemesForSubject = papers.filter(
    (p) => p.mark_scheme_url && p.subject.toLowerCase() === subject.toLowerCase(),
  );

  async function useScheme(id: string) {
    const p = papers.find((x) => x.id === id);
    if (!p?.mark_scheme_url) return;
    setReading(true);
    setError(null);
    try {
      let blob: Blob;
      if (p.mark_scheme_url.startsWith("http")) {
        blob = await (await fetch(p.mark_scheme_url)).blob();
      } else {
        const sb = supabaseBrowser();
        const { data, error: sErr } = await sb.storage
          .from("papers")
          .createSignedUrl(p.mark_scheme_url, 3600);
        if (sErr || !data?.signedUrl) throw new Error("Couldn't open that mark scheme.");
        blob = await (await fetch(data.signedUrl)).blob();
      }
      const file = new File([blob], "scheme.pdf", { type: "application/pdf" });
      const text = await extractPdfText(file);
      if (!text.trim()) {
        throw new Error(
          "No text in that mark scheme — it may be a scan. Try a searchable PDF.",
        );
      }
      setScheme(text);
      setSchemeLabel(`${p.subject}${p.year ? ` · ${p.year}` : ""} mark scheme`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setReading(false);
    }
  }

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai-paper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, topic, difficulty, source: scheme }),
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

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-grayline bg-paper p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <label className="block">
            <span className="text-sm text-graytext">Subject</span>
            <select
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
                setScheme("");
                setSchemeLabel(null);
              }}
              className="mt-1 w-full rounded-lg border border-grayline bg-paper px-4 py-2.5 outline-none focus:border-accent min-h-[44px]"
            >
              {subjects.length === 0 && <option value="Mathematics">Mathematics</option>}
              {subjects.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm text-graytext">Difficulty</span>
            <select
              value={difficulty}
              onChange={(e) =>
                setDifficulty(e.target.value as "easy" | "medium" | "hard")
              }
              className="mt-1 w-full rounded-lg border border-grayline bg-paper px-4 py-2.5 outline-none focus:border-accent min-h-[44px]"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm text-graytext">Topic (optional)</span>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Trigonometry"
              className="mt-1 w-full rounded-lg border border-grayline bg-paper px-4 py-2.5 outline-none focus:border-accent min-h-[44px]"
            />
          </label>
        </div>

        {/* Mark-scheme grounding */}
        <div className="mt-4 rounded-xl border border-grayline bg-graylite/40 p-4">
          <div className="flex items-start gap-2">
            <FileCheck2 className="w-4 h-4 mt-0.5 shrink-0 text-graytext" aria-hidden="true" />
            <div className="flex-1">
              <div className="text-sm font-medium">Mark against your real scheme</div>
              {schemeLabel ? (
                <div className="mt-2 inline-flex items-center gap-2 rounded-lg bg-paper border border-grayline px-3 py-1.5 text-sm">
                  <span className="truncate max-w-[220px]">{schemeLabel}</span>
                  <span className="text-xs text-graymute">
                    {Math.round(scheme.length / 1000)}k chars
                  </span>
                  <button
                    onClick={() => {
                      setScheme("");
                      setSchemeLabel(null);
                    }}
                    aria-label="Remove mark scheme"
                    className="text-graymute hover:text-ink"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : schemesForSubject.length > 0 ? (
                <label className="block mt-2">
                  <span className="sr-only">Choose a mark scheme</span>
                  <select
                    defaultValue=""
                    onChange={(e) => e.target.value && useScheme(e.target.value)}
                    className="rounded-lg border border-grayline bg-paper px-3 py-2 text-sm outline-none focus:border-accent min-h-[44px]"
                  >
                    <option value="">Use a mark scheme from your library…</option>
                    {schemesForSubject.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.subject}
                        {p.year ? ` · ${p.year}` : ""}
                        {p.paper_number ? ` · ${p.paper_number}` : ""}
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <p className="text-sm text-graytext mt-1">
                  No mark scheme in your library for {subject} yet. Add one under{" "}
                  <strong>My library</strong> and practice will be marked against
                  it instead of generic marking.
                </p>
              )}
              {reading && (
                <span className="mt-2 text-sm text-graymute inline-flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                  Reading mark scheme…
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={generate}
          disabled={loading}
          className="mt-4 rounded-lg bg-ink text-paper px-5 py-2.5 text-sm inline-flex items-center gap-2 disabled:opacity-50 min-h-[44px]"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
          ) : (
            <Target className="w-4 h-4" aria-hidden="true" />
          )}
          {loading ? "Writing your paper…" : "Generate practice paper"}
        </button>
      </section>

      {error && (
        <div
          role="alert"
          className="text-sm text-red-600 border border-red-200 bg-red-50 rounded-lg p-3"
        >
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
                  questions: (result.questions ?? []).map((q, i) => ({
                    q: i + 1,
                    text: q.text,
                    marks: q.marks,
                  })),
                  mark_scheme: (result.mark_scheme ?? []).map((m, i) => ({
                    q: i + 1,
                    answer: m.answer,
                    marks: m.marks,
                  })),
                }),
              );
              router.push("/mocks?fromPaper=1");
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-ink text-paper px-4 py-2.5 text-sm min-h-[44px]"
          >
            <TimerReset className="w-4 h-4" aria-hidden="true" />
            Take this paper as a timed mock
          </button>

          <div>
            <h2 className="text-lg font-semibold mb-3">Questions</h2>
            <ol className="space-y-3">
              {result.questions?.map((q, i) => (
                <li key={i} className="rounded-xl border border-grayline bg-paper p-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-graymute text-sm">{i + 1}.</span>
                    <span className="flex-1">{q.text}</span>
                    <span className="text-xs text-graymute whitespace-nowrap">
                      [{q.marks} marks]
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <details className="rounded-xl border border-grayline bg-paper p-4">
            <summary className="cursor-pointer font-medium text-sm inline-flex items-center gap-2 min-h-[44px]">
              <ScrollText className="w-4 h-4" aria-hidden="true" />
              Show mark scheme
            </summary>
            <ol className="mt-3 space-y-3">
              {result.mark_scheme?.map((m, i) => (
                <li key={i} className="flex items-baseline gap-2 text-sm">
                  <span className="text-graymute">{i + 1}.</span>
                  <span className="flex-1">{m.answer}</span>
                  <span className="text-xs text-graymute whitespace-nowrap">
                    [{m.marks} marks]
                  </span>
                </li>
              ))}
            </ol>
          </details>
        </div>
      )}

      <CommandWordCoach />
    </div>
  );
}
