"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Circle, CircleDot, CircleCheck, ListChecks } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase";
import { topicsForCode } from "@/lib/igcse-topics";
import { cn } from "@/lib/utils";

type Rating = "unrated" | "red" | "amber" | "green";

interface TopicRow {
  id: string;
  subject_id: string;
  name: string;
  rating: Rating;
  sort_order: number;
}

interface SubjectRef {
  id: string;
  name: string;
  code: string | null;
}

// DB keeps red/amber/green; the UI never relies on color — labels + icons.
const RATING_META: {
  value: Rating;
  label: string;
  icon: typeof Circle;
}[] = [
  { value: "red", label: "Shaky", icon: Circle },
  { value: "amber", label: "Okay", icon: CircleDot },
  { value: "green", label: "Solid", icon: CircleCheck },
];

export default function TopicTracker({ subjects }: { subjects: SubjectRef[] }) {
  const [topics, setTopics] = useState<TopicRow[] | null>(null);
  const [setupNeeded, setSetupNeeded] = useState(false);

  useEffect(() => {
    if (!subjects.length) {
      setTopics([]);
      return;
    }
    let cancelled = false;
    (async () => {
      const sb = supabaseBrowser();
      const { data: auth } = await sb.auth.getUser();
      if (!auth.user || cancelled) return;

      const { data: existing, error } = await sb
        .from("topics")
        .select("id, subject_id, name, rating, sort_order")
        .eq("user_id", auth.user.id)
        .order("sort_order");
      if (error) {
        // Table missing → migration not applied yet.
        if (!cancelled) setSetupNeeded(true);
        return;
      }

      // Seed syllabus topics for subjects that have none yet.
      const bySubject = new Map<string, TopicRow[]>();
      for (const t of (existing ?? []) as TopicRow[]) {
        const list = bySubject.get(t.subject_id) ?? [];
        list.push(t);
        bySubject.set(t.subject_id, list);
      }
      const seeds = subjects
        .filter((s) => !bySubject.has(s.id))
        .flatMap((s) =>
          topicsForCode(s.code).map((name, i) => ({
            user_id: auth.user!.id,
            subject_id: s.id,
            name,
            sort_order: i,
          })),
        );
      let all = (existing ?? []) as TopicRow[];
      if (seeds.length) {
        const { data: inserted } = await sb
          .from("topics")
          .upsert(seeds, { onConflict: "user_id,subject_id,name" })
          .select("id, subject_id, name, rating, sort_order");
        all = [...all, ...((inserted ?? []) as TopicRow[])];
      }
      if (!cancelled) setTopics(all);
    })();
    return () => {
      cancelled = true;
    };
  }, [subjects]);

  async function rate(topicId: string, rating: Rating) {
    setTopics(
      (prev) =>
        prev?.map((t) => (t.id === topicId ? { ...t, rating } : t)) ?? prev,
    );
    const sb = supabaseBrowser();
    await sb
      .from("topics")
      .update({ rating, updated_at: new Date().toISOString() })
      .eq("id", topicId);
  }

  if (!subjects.length) return null;

  return (
    <section className="mt-12 max-w-3xl" aria-label="Topic tracker">
      <div className="flex items-center gap-2">
        <ListChecks className="w-5 h-5" />
        <h2 className="text-xl font-semibold">Topic tracker</h2>
      </div>
      <p className="mt-1 text-sm text-graytext">
        Rate every syllabus topic honestly — your study plan and daily drills
        target the shaky ones first.
      </p>

      {setupNeeded && (
        <div className="mt-4 rounded-xl border border-dashed border-grayline p-5 text-sm text-graytext">
          One-time setup needed: the topic tables haven&apos;t been created in
          your database yet. Run the migration file{" "}
          <code className="font-mono text-xs bg-graylite px-1.5 py-0.5 rounded">
            supabase/migrations/20260714_topics_drills_srs.sql
          </code>{" "}
          in the Supabase SQL editor, then reload this page.
        </div>
      )}

      {!setupNeeded && topics === null && (
        <div className="mt-4 space-y-2" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-14 rounded-xl bg-graylite animate-pulse" />
          ))}
        </div>
      )}

      {topics && (
        <div className="mt-4 space-y-3">
          {subjects.map((s) => {
            const list = topics
              .filter((t) => t.subject_id === s.id)
              .sort((a, b) => a.sort_order - b.sort_order);
            if (!list.length) return null;
            return <SubjectTopics key={s.id} subject={s} topics={list} onRate={rate} />;
          })}
        </div>
      )}
    </section>
  );
}

function SubjectTopics({
  subject,
  topics,
  onRate,
}: {
  subject: SubjectRef;
  topics: TopicRow[];
  onRate: (id: string, rating: Rating) => void;
}) {
  const [open, setOpen] = useState(false);
  const rated = topics.filter((t) => t.rating !== "unrated").length;
  const solid = topics.filter((t) => t.rating === "green").length;
  const pct = topics.length ? Math.round((solid / topics.length) * 100) : 0;

  return (
    <div className="rounded-2xl border border-grayline bg-paper overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center gap-4 p-4 text-left hover:bg-graylite/40 transition min-h-[56px]"
      >
        <div className="min-w-0 flex-1">
          <div className="font-medium text-sm">{subject.name}</div>
          <div className="text-xs text-graymute mt-0.5">
            {rated}/{topics.length} rated · {solid} solid
          </div>
        </div>
        <div
          className="w-24 h-1.5 rounded-full bg-graylite overflow-hidden shrink-0"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${subject.name}: ${pct}% of topics solid`}
        >
          <div
            className="h-full bg-ink rounded-full transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-graymute shrink-0 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <ul className="px-4 pb-4 divide-y divide-grayline/60">
          {topics.map((t) => (
            <li
              key={t.id}
              className="py-2.5 flex flex-col sm:flex-row sm:items-center gap-2 justify-between"
            >
              <span
                className={cn(
                  "text-sm min-w-0",
                  t.rating === "green" ? "text-graymute" : "text-graytext",
                )}
              >
                {t.name}
              </span>
              <div
                role="radiogroup"
                aria-label={`Confidence for ${t.name}`}
                className="flex rounded-lg border border-grayline overflow-hidden shrink-0 self-start sm:self-auto"
              >
                {RATING_META.map(({ value, label, icon: Icon }) => {
                  const active = t.rating === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => onRate(t.id, active ? "unrated" : value)}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-2 text-xs transition min-h-[36px]",
                        active
                          ? "bg-ink text-paper font-semibold"
                          : "text-graymute hover:bg-graylite active:bg-graylite",
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {label}
                    </button>
                  );
                })}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
