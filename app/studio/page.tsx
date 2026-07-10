"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  ListChecks,
  Presentation,
  Layers,
  Network,
  Headphones,
  Loader2,
  Upload,
  Sparkles,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import AppLayout from "@/components/layout/AppLayout";
import { supabaseBrowser } from "@/lib/supabase";
import Flashcards from "@/components/studio/Flashcards";
import MindMap from "@/components/studio/MindMap";
import SlideDeck from "@/components/studio/SlideDeck";
import { useProfile } from "@/hooks/useProfile";
import { extractPdfText } from "@/lib/pdf";

type Kind = "summary" | "study_guide" | "slide_deck" | "flashcards" | "mind_map";

const BUTTONS: { kind: Kind; label: string; icon: React.ElementType }[] = [
  { kind: "slide_deck", label: "Slide deck", icon: Presentation },
  { kind: "summary", label: "Summary", icon: FileText },
  { kind: "study_guide", label: "Study guide", icon: ListChecks },
  { kind: "flashcards", label: "Flashcards", icon: Layers },
  { kind: "mind_map", label: "Mind map", icon: Network },
];

interface OutputState {
  kind: Kind;
  data: any;
}

export default function StudioPage() {
  const { isPro } = useProfile();
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
    const content =
      output.data.markdown ?? JSON.stringify(output.data);
    await sb.from("notes").insert({
      user_id: auth.user.id,
      title: `${output.kind} · ${fileName || "generated"}`,
      content,
      type: output.kind,
    });
    alert("Saved to your notes.");
  }

  return (
    <AppLayout title="StudyRaven Studio">
      <p className="text-graytext">
        Generate slide decks, summaries, study guides, flashcards, and mind maps from any topic or upload.
      </p>

      <section className="mt-8 space-y-4">
        <label className="block">
          <span className="text-sm text-graytext">What do you want to study?</span>
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Photosynthesis and the light-dependent reactions"
            className="mt-1 w-full rounded-lg border border-grayline px-4 py-3 outline-none focus:border-ink"
          />
        </label>
        <label className="block">
          <span className="text-sm text-graytext">Upload source (PDF or text — optional but recommended)</span>
          <label className="mt-1 rounded-lg border border-dashed border-grayline px-4 py-3 flex items-center gap-2 cursor-pointer hover:border-ink">
            <Upload className="w-4 h-4 text-graytext" />
            <span className="text-sm text-graytext truncate">
              {fileName ?? "Choose file — PDF, TXT, or MD"}
            </span>
            <input
              type="file"
              onChange={onFile}
              className="hidden"
              accept=".pdf,.txt,.md"
            />
          </label>
        </label>
      </section>

      <section className="mt-8">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-graytext">Generate</div>
          {usage && (
            <div className="text-xs text-graymute">
              Free plan: {Math.max(0, usage.limit - usage.used)}/{usage.limit} generations
              left today
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {BUTTONS.map(({ kind, label, icon: Icon }) => (
            <button
              key={kind}
              onClick={() => generate(kind)}
              disabled={loading !== null}
              className="inline-flex items-center gap-2 rounded-lg border border-grayline px-4 py-2.5 hover:border-ink disabled:opacity-50"
            >
              {loading === kind ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Icon className="w-4 h-4" />
              )}
              {label}
            </button>
          ))}
          <button
            disabled={!isPro}
            title={isPro ? "Generate audio overview" : "Upgrade to Pro"}
            className="inline-flex items-center gap-2 rounded-lg bg-ink text-paper px-4 py-2.5 hover:opacity-90 disabled:opacity-40"
          >
            <Headphones className="w-4 h-4" />
            Audio overview
            {!isPro && <Sparkles className="w-3 h-3" />}
          </button>
        </div>
        {error && (
          <div className="mt-4 text-sm text-red-600 border border-red-200 bg-red-50 rounded-lg p-3">
            {error}
          </div>
        )}
      </section>

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
              <button
                onClick={save}
                className="text-sm rounded-lg bg-ink text-paper px-3 py-1.5"
              >
                Save to notes
              </button>
            </div>
          </div>
          {output.kind === "summary" || output.kind === "study_guide" ? (
            <article className="prose max-w-none rounded-xl border border-grayline bg-paper p-6">
              <ReactMarkdown>{output.data.markdown}</ReactMarkdown>
            </article>
          ) : null}
          {output.kind === "slide_deck" && <SlideDeck slides={output.data.slides} />}
          {output.kind === "flashcards" && <Flashcards cards={output.data.cards} />}
          {output.kind === "mind_map" && <MindMap data={output.data} />}
        </section>
      )}
    </AppLayout>
  );
}
