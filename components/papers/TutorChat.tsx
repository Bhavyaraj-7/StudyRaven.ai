"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  Send,
  Loader2,
  Paperclip,
  X,
  GraduationCap,
  FileText,
} from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase";
import { extractPdfText } from "@/lib/pdf";
import type { UserPaper } from "@/types";

interface Turn {
  role: "user" | "assistant";
  content: string;
}

const PROMPTS = [
  "Explain this question step by step",
  "Why did I lose marks here?",
  "What does the mark scheme want for 6 marks?",
  "Give me a worked example",
];

export default function TutorChat() {
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);
  const [subject, setSubject] = useState("");
  const [papers, setPapers] = useState<UserPaper[]>([]);

  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Extracted text from the attached paper — sent as grounding context.
  const [context, setContext] = useState("");
  const [contextLabel, setContextLabel] = useState<string | null>(null);
  const [attaching, setAttaching] = useState(false);

  const endRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns, sending]);

  /** Pull a paper out of the private bucket and read its text client-side. */
  async function attachFromLibrary(id: string) {
    const p = papers.find((x) => x.id === id);
    if (!p) return;
    setAttaching(true);
    setError(null);
    try {
      let blob: Blob;
      if (p.pdf_url.startsWith("http")) {
        blob = await (await fetch(p.pdf_url)).blob();
      } else {
        const sb = supabaseBrowser();
        const { data, error: sErr } = await sb.storage
          .from("papers")
          .createSignedUrl(p.pdf_url, 3600);
        if (sErr || !data?.signedUrl) throw new Error("Couldn't open that file.");
        blob = await (await fetch(data.signedUrl)).blob();
      }
      const file = new File([blob], `${p.subject}.pdf`, { type: "application/pdf" });
      const text = await extractPdfText(file);
      if (!text.trim()) {
        throw new Error(
          "No text found in that PDF — it may be a scan. Try a searchable PDF.",
        );
      }
      setContext(text);
      setContextLabel(
        `${p.subject}${p.year ? ` · ${p.year}` : ""}${p.paper_number ? ` · ${p.paper_number}` : ""}`,
      );
      if (p.subject) setSubject(p.subject);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setAttaching(false);
    }
  }

  async function attachUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setAttaching(true);
    setError(null);
    try {
      let text = "";
      if (f.name.toLowerCase().endsWith(".pdf") || f.type === "application/pdf") {
        text = await extractPdfText(f);
        if (!text.trim()) {
          throw new Error(
            "No text found in that PDF — it may be a scan. Try a searchable PDF.",
          );
        }
      } else {
        text = (await f.text()).slice(0, 30000);
      }
      setContext(text);
      setContextLabel(f.name);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setAttaching(false);
    }
  }

  async function send(question: string) {
    const q = question.trim();
    if (!q || sending) return;
    setError(null);
    setInput("");
    const next = [...turns, { role: "user" as const, content: q }];
    setTurns(next);
    setSending(true);
    try {
      const res = await fetch("/api/tutor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, subject, context, history: turns }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "The tutor couldn't answer.");
      setTurns([...next, { role: "assistant", content: data.answer }]);
    } catch (e) {
      setError((e as Error).message);
      setTurns(turns); // roll back the unanswered question
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2">
          <span className="sr-only">Subject</span>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="rounded-lg border border-grayline bg-paper px-3 py-2 text-sm outline-none focus:border-accent min-h-[44px]"
          >
            {subjects.length === 0 && <option value="">No subjects yet</option>}
            {subjects.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </label>

        {papers.length > 0 && (
          <label className="flex items-center gap-2">
            <span className="sr-only">Attach a paper from your library</span>
            <select
              onChange={(e) => e.target.value && attachFromLibrary(e.target.value)}
              defaultValue=""
              className="rounded-lg border border-grayline bg-paper px-3 py-2 text-sm outline-none focus:border-accent min-h-[44px]"
            >
              <option value="">Attach from library…</option>
              {papers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.subject}
                  {p.year ? ` · ${p.year}` : ""}
                  {p.paper_number ? ` · ${p.paper_number}` : ""}
                </option>
              ))}
            </select>
          </label>
        )}

        <label className="rounded-lg border border-grayline px-3 py-2 text-sm cursor-pointer hover:border-ink inline-flex items-center gap-2 min-h-[44px]">
          <Paperclip className="w-4 h-4" aria-hidden="true" />
          Upload
          <input
            type="file"
            accept=".pdf,.txt,.md"
            onChange={attachUpload}
            className="hidden"
          />
        </label>

        {attaching && (
          <span className="text-sm text-graymute inline-flex items-center gap-1.5">
            <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
            Reading…
          </span>
        )}
      </div>

      {contextLabel && (
        <div className="mt-3 inline-flex items-center gap-2 self-start rounded-lg bg-graylite px-3 py-1.5 text-sm">
          <FileText className="w-3.5 h-3.5 text-graytext" aria-hidden="true" />
          <span className="truncate max-w-[220px]">{contextLabel}</span>
          <span className="text-graymute text-xs">
            {Math.round(context.length / 1000)}k chars
          </span>
          <button
            onClick={() => {
              setContext("");
              setContextLabel(null);
            }}
            aria-label="Remove attached paper"
            className="text-graymute hover:text-ink"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Transcript */}
      <div
        className="mt-5 min-h-[280px]"
        aria-live="polite"
        aria-busy={sending}
      >
        {turns.length === 0 && !sending && (
          <div className="rounded-2xl border border-dashed border-grayline p-8 text-center">
            <GraduationCap className="w-6 h-6 mx-auto text-graytext" aria-hidden="true" />
            <p className="mt-3 font-medium">Ask your tutor anything</p>
            <p className="text-sm text-graytext mt-1 max-w-sm mx-auto">
              Attach a paper from your library and it&apos;ll answer using that
              paper&apos;s own questions and mark scheme.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              {PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => send(p)}
                  className="rounded-full border border-grayline px-3 py-1.5 text-sm text-graytext hover:border-ink hover:text-ink"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        <ol className="space-y-4">
          {turns.map((t, i) => (
            <li
              key={i}
              className={t.role === "user" ? "flex justify-end" : "flex justify-start"}
            >
              {t.role === "user" ? (
                <div className="bg-ink text-paper rounded-2xl rounded-br-sm px-4 py-2.5 max-w-[85%]">
                  {t.content}
                </div>
              ) : (
                <div className="rounded-2xl rounded-bl-sm border border-grayline bg-paper px-4 py-3 max-w-[92%] prose prose-sm max-w-none prose-headings:font-semibold prose-p:my-2 prose-li:my-0.5">
                  <ReactMarkdown>{t.content}</ReactMarkdown>
                </div>
              )}
            </li>
          ))}
        </ol>

        {sending && (
          <div className="mt-4 inline-flex items-center gap-2 text-sm text-graymute">
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            Thinking…
          </div>
        )}
        <div ref={endRef} />
      </div>

      {error && (
        <div
          role="alert"
          className="mt-3 text-sm text-red-600 border border-red-200 bg-red-50 rounded-lg p-3"
        >
          {error}
        </div>
      )}

      {/* Composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="mt-4 flex items-end gap-2 sticky bottom-0 bg-paper pt-2"
      >
        <label className="flex-1">
          <span className="sr-only">Your question</span>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            rows={2}
            placeholder="Ask a doubt — paste a question, or attach a paper first…"
            className="w-full rounded-xl border border-grayline bg-paper px-4 py-3 outline-none focus:border-accent resize-none"
          />
        </label>
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="rounded-xl bg-ink text-paper px-4 py-3 disabled:opacity-50 min-h-[44px] min-w-[44px] inline-flex items-center justify-center"
          aria-label="Send question"
        >
          {sending ? (
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
          ) : (
            <Send className="w-4 h-4" aria-hidden="true" />
          )}
        </button>
      </form>
    </div>
  );
}
