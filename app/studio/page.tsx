"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  ListChecks,
  Presentation,
  Layers,
  Network,
  CircleHelp,
  Loader2,
  Upload,
  Check,
  Sparkles,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import AppLayout from "@/components/layout/AppLayout";
import { supabaseBrowser } from "@/lib/supabase";
import Flashcards from "@/components/studio/Flashcards";
import MindMap from "@/components/studio/MindMap";
import SlideDeck from "@/components/studio/SlideDeck";
import Quiz from "@/components/studio/Quiz";
import { extractPdfText } from "@/lib/pdf";
import { cn } from "@/lib/utils";

type Kind =
  | "summary"
  | "study_guide"
  | "slide_deck"
  | "flashcards"
  | "mind_map"
  | "quiz";

const KITS: {
  kind: Kind;
  label: string;
  desc: string;
  icon: React.ElementType;
}[] = [
  { kind: "study_guide", label: "Study guide", desc: "Full guide with worked examples & common mistakes", icon: ListChecks },
  { kind: "summary", label: "Summary", desc: "The topic condensed to the essentials", icon: FileText },
  { kind: "slide_deck", label: "Slide deck", desc: "The topic laid out in 8–12 slides", icon: Presentation },
  { kind: "flashcards", label: "Flashcards", desc: "Active-recall cards you can save for review", icon: Layers },
  { kind: "mind_map", label: "Mind map", desc: "See how the ideas connect", icon: Network },
  { kind: "quiz", label: "Quiz", desc: "8 exam-style questions, marked instantly", icon: CircleHelp },
];

interface OutputState {
  kind: Kind;
  // Output shape varies per kind (markdown / slides / cards / mind map / quiz).
  data: {
    markdown?: string;
    slides?: unknown[];
    cards?: { front: string; back: string }[];
    root?: string;
    questions?: unknown[];
    [k: string]: unknown;
  };
}

const PROGRESS_KEY = "sr-studio-progress";

function loadProgress(topic: string): Kind[] {
  if (typeof window === "undefined" || !topic.trim()) return [];
  try {
    const all = JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? "{}");
    return Array.isArray(all[topic]) ? all[topic] : [];
  } catch {
    return [];
  }
}

function saveProgress(topic: string, kinds: Kind[]) {
  if (typeof window === "undefined" || !topic.trim()) return;
  try {
    const all = JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? "{}");
    all[topic] = kinds;
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(all));
  } catch {
    /* ignore quota errors */
  }
}

export default function StudioPage() {
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);
  const [subject, setSubject] = useState<string>("");
  const [topic, setTopic] = useState("");
  const [source, setSource] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState<Kind | null>(null);
  const [output, setOutput] = useState<OutputState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [usage, setUsage] = useState<{ used: number; limit: number } | null>(null);
  const [deckSaved, setDeckSaved] = useState(false);
  const [done, setDone] = useState<Kind[]>([]);

  useEffect(() => {
    const sb = supabaseBrowser();
    sb.from("subjects")
      .select("id, name")
      .then(({ data }) => {
        setSubjects(data ?? []);
        if (data && data[0]) setSubject(data[0].name);
      });
    fetch("/api/studio/generate")
      .then((r) => r.json())
      .then((d) => {
        if (d && d.isPro === false) setUsage({ used: d.used, limit: d.limit });
      })
      .catch(() => {});
  }, []);

  // Progress is per-topic; reload the completion set whenever the topic changes.
  useEffect(() => {
    setDone(loadProgress(topic));
  }, [topic]);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileName(f.name);
    setError(null);
    try {
      if (f.name.toLowerCase().endsWith(".pdf") || f.type === "application/pdf") {
        setFileName(`${f.name} (reading...)`);
        const text = await extractPdfText(f);
        if (!text.trim()) {
          setError("Could not extract text from this PDF — it may be a scanned image. Try a searchable PDF or paste the topic as text.");
          setSource("");
          setFileName(f.name);
          return;
        }
        setSource(text);
        setFileName(f.name);
      } else if (
        f.type.startsWith("text/") ||
        f.name.endsWith(".md") ||
        f.name.endsWith(".txt")
      ) {
        const text = await f.text();
        setSource(text.slice(0, 30000));
      } else {
        setError("Unsupported file type. Please upload a PDF, TXT, or MD file.");
        setFileName(null);
      }
    } catch (err) {
      setError(`Could not read file: ${(err as Error).message}`);
      setFileName(f.name);
    }
  }

  async function generate(kind: Kind) {
    if (!source && !topic.trim()) {
      setError("Type a topic or upload source material first.");
      return;
    }
    setLoading(kind);
    setError(null);
    try {
      const res = await fetch("/api/studio/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, subject, topic, source }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setOutput({ kind: data.kind, data: data.data });
      setDeckSaved(false);
      // Mark this kit item complete for the current topic.
      if (topic.trim()) {
        setDone((prev) => {
          const next = prev.includes(kind) ? prev : [...prev, kind];
          saveProgress(topic, next);
          return next;
        });
      }
      if (typeof data.remaining === "number" && data.remaining >= 0 && usage) {
        setUsage({ used: usage.limit - data.remaining, limit: usage.limit });
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(null);
    }
  }

  async function saveDeck() {
    if (!output || output.kind !== "flashcards" || deckSaved) return;
    const cards = output.data.cards as { front: string; back: string }[];
    if (!cards?.length) return;
    const sb = supabaseBrowser();
    const { data: auth } = await sb.auth.getUser();
    if (!auth.user) return;
    const subjectId = subjects.find((s) => s.name === subject)?.id ?? null;
    const { error: err } = await sb.from("flashcards").insert(
      cards.map((c) => ({
        user_id: auth.user!.id,
        subject_id: subjectId,
        front: c.front,
        back: c.back,
      })),
    );
    if (err) {
      setError(err.message);
      return;
    }
    setDeckSaved(true);
  }

  async function save() {
    if (!output) return;
    const sb = supabaseBrowser();
    const { data: auth } = await sb.auth.getUser();
    if (!auth.user) return;
    const content = output.data.markdown ?? JSON.stringify(output.data);
    await sb.from("notes").insert({
      user_id: auth.user.id,
      title: `${output.kind} · ${topic || fileName || "generated"}`,
      content,
      type: output.kind,
    });
    alert("Saved to your notes.");
  }

  const pct = Math.round((done.length / KITS.length) * 100);
  const ready = Boolean(source || topic.trim());

  return (
    <AppLayout title="Studio">
      {/* Header row: intro + progress ring */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Build your study kit</h1>
          <p className="text-graytext mt-1 max-w-xl">
            Give a topic or upload your notes, then generate every way to learn
            it — guide, slides, flashcards, mind map, and a quiz to test yourself.
          </p>
        </div>
        <ProgressRing pct={pct} count={done.length} total={KITS.length} />
      </div>

      {/* Input card */}
      <section className="mt-8 rounded-2xl border border-grayline bg-paper p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <label className="block sm:col-span-2">
            <span className="text-sm text-graytext">What do you want to study?</span>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Photosynthesis — light-dependent reactions"
              className="mt-1 w-full rounded-lg border border-grayline bg-paper px-4 py-3 outline-none focus:border-accent"
            />
          </label>
          <label className="block">
            <span className="text-sm text-graytext">Subject</span>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-1 w-full rounded-lg border border-grayline bg-paper px-4 py-3 outline-none focus:border-accent"
            >
              {subjects.length === 0 && <option value="">General</option>}
              {subjects.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="block">
          <label className="rounded-lg border border-dashed border-grayline px-4 py-3 flex items-center gap-2 cursor-pointer hover:border-ink transition">
            <Upload className="w-4 h-4 text-graytext" />
            <span className="text-sm text-graytext truncate">
              {fileName ?? "Upload source — PDF, TXT, or MD (optional, improves results)"}
            </span>
            <input type="file" onChange={onFile} className="hidden" accept=".pdf,.txt,.md" />
          </label>
        </label>
        {usage && (
          <div className="text-xs text-graymute">
            Free plan: {Math.max(0, usage.limit - usage.used)}/{usage.limit} generations left today
          </div>
        )}
      </section>

      {error && (
        <div
          role="alert"
          className="mt-4 text-sm text-red-600 border border-red-200 bg-red-50 rounded-lg p-3"
        >
          {error}
        </div>
      )}

      {/* Study-kit grid */}
      <section className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {KITS.map(({ kind, label, desc, icon: Icon }) => {
          const isDone = done.includes(kind);
          const isLoading = loading === kind;
          return (
            <button
              key={kind}
              onClick={() => generate(kind)}
              disabled={loading !== null || !ready}
              className={cn(
                "text-left rounded-2xl border bg-paper p-5 transition min-h-[128px] flex flex-col active:scale-[0.99] disabled:opacity-50",
                isDone ? "border-ink" : "border-grayline hover:border-ink",
              )}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "inline-flex w-9 h-9 items-center justify-center rounded-lg",
                    isDone ? "bg-ink text-paper" : "bg-graylite text-ink",
                  )}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isDone ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </span>
                {isDone && (
                  <span className="text-[10px] uppercase tracking-wide text-graymute">
                    Done
                  </span>
                )}
              </div>
              <div className="mt-3 font-medium text-sm">{label}</div>
              <div className="text-xs text-graymute mt-1 flex-1">{desc}</div>
            </button>
          );
        })}
      </section>

      {pct === 100 && (
        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-gold/40 text-gold px-4 py-2 text-sm">
          <Sparkles className="w-4 h-4" />
          Full kit complete for “{topic}” — you&apos;ve covered this topic every way.
        </div>
      )}

      {/* Output */}
      {output && (
        <section className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold capitalize">
              {output.kind.replace("_", " ")}
            </h2>
            <div className="flex items-center gap-2">
              {output.kind === "flashcards" && (
                <button
                  onClick={saveDeck}
                  disabled={deckSaved}
                  className="text-sm rounded-lg border border-grayline px-3 py-1.5 hover:border-ink disabled:opacity-60"
                >
                  {deckSaved ? "Deck saved ✓" : "Save deck for review"}
                </button>
              )}
              {output.kind !== "quiz" && (
                <button
                  onClick={save}
                  className="text-sm rounded-lg bg-ink text-paper px-3 py-1.5"
                >
                  Save to notes
                </button>
              )}
            </div>
          </div>
          {(output.kind === "summary" || output.kind === "study_guide") && (
            <article className="prose max-w-none rounded-xl border border-grayline bg-paper p-6">
              <ReactMarkdown>{output.data.markdown ?? ""}</ReactMarkdown>
            </article>
          )}
          {output.kind === "slide_deck" && (
            <SlideDeck slides={output.data.slides as never} />
          )}
          {output.kind === "flashcards" && (
            <Flashcards cards={output.data.cards as never} />
          )}
          {output.kind === "mind_map" && <MindMap data={output.data as never} />}
          {output.kind === "quiz" && (
            <Quiz questions={output.data.questions as never} />
          )}
        </section>
      )}
    </AppLayout>
  );
}

function ProgressRing({
  pct,
  count,
  total,
}: {
  pct: number;
  count: number;
  total: number;
}) {
  return (
    <div className="flex items-center gap-3 shrink-0">
      <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
        <circle
          cx="18"
          cy="18"
          r="15.9155"
          fill="none"
          className="stroke-graylite"
          strokeWidth="3"
        />
        <circle
          cx="18"
          cy="18"
          r="15.9155"
          fill="none"
          className="stroke-accent transition-all duration-500"
          strokeWidth="3"
          strokeDasharray={`${pct}, 100`}
          strokeLinecap="round"
        />
      </svg>
      <div className="leading-tight">
        <div className="text-lg font-semibold tabular-nums">
          {count}/{total}
        </div>
        <div className="text-xs text-graymute">kit built</div>
      </div>
    </div>
  );
}
