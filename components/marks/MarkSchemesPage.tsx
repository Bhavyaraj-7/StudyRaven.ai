"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { ScrollText, ChevronDown, Loader2 } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase";
import { cn } from "@/lib/utils";

interface Subject {
  id: string;
  name: string;
  code: string | null;
}

export default function MarkSchemesPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabaseBrowser()
      .from("subjects")
      .select("id, name, code")
      .order("name")
      .then(({ data }) => {
        setSubjects(data ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold">Mark schemes</h1>
      <p className="text-graytext mt-1 max-w-xl">
        For each of your subjects, an examiner&apos;s breakdown of exactly how
        marks are awarded — the mark types, the command words, and where students
        lose marks. Write to the mark scheme, not around it.
      </p>

      {loading ? (
        <div className="mt-8 space-y-2 max-w-3xl" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 rounded-2xl bg-graylite animate-pulse" />
          ))}
        </div>
      ) : subjects.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-grayline p-10 text-center text-graymute max-w-3xl">
          Add your subjects first — mark scheme guides are generated per subject.
        </div>
      ) : (
        <div className="mt-8 space-y-3 max-w-3xl">
          {subjects.map((s) => (
            <SubjectGuide key={s.id} subject={s} />
          ))}
        </div>
      )}
    </div>
  );
}

function SubjectGuide({ subject }: { subject: Subject }) {
  const [open, setOpen] = useState(false);
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    const next = !open;
    setOpen(next);
    if (next && !markdown && !loading) {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/mark-scheme-guide", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subject: subject.name, code: subject.code }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Could not load the guide.");
        setMarkdown(data.markdown);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <div className="rounded-2xl border border-grayline bg-paper overflow-hidden">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className="w-full flex items-center gap-3 p-5 text-left hover:bg-graylite/40 transition min-h-[56px]"
      >
        <ScrollText className="w-4 h-4 shrink-0 text-graymute" />
        <div className="min-w-0 flex-1">
          <div className="font-medium text-sm">{subject.name}</div>
          {subject.code && (
            <div className="text-xs text-graymute font-mono mt-0.5">
              {subject.code}
            </div>
          )}
        </div>
        {loading && <Loader2 className="w-4 h-4 animate-spin text-graymute" />}
        <ChevronDown
          className={cn(
            "w-4 h-4 text-graymute shrink-0 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      {open && (
        <div className="px-5 pb-5">
          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}
          {markdown && (
            <article className="prose max-w-none">
              <ReactMarkdown>{markdown}</ReactMarkdown>
            </article>
          )}
          {!markdown && !error && loading && (
            <p className="text-sm text-graymute">
              Generating the examiner&apos;s guide for {subject.name}...
            </p>
          )}
        </div>
      )}
    </div>
  );
}
