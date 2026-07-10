"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, CalendarClock, CheckCircle2, Circle } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import type { ApplicationStatus, CollegeApplication } from "@/types";

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  submitted: "Submitted",
};

const CHECKLIST: { key: keyof CollegeApplication; label: string }[] = [
  { key: "essay_done", label: "Essay" },
  { key: "recommendations_done", label: "Recommendations" },
  { key: "test_scores_done", label: "Test scores" },
];

export default function ApplicationsTab({
  targetUniversities,
}: {
  targetUniversities: string[];
}) {
  const [apps, setApps] = useState<CollegeApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabaseBrowser()
      .from("college_applications")
      .select("*")
      .order("created_at", { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          setError(
            error.message.includes("does not exist") ||
              error.message.includes("schema cache")
              ? "The applications table isn't set up yet — run migration 005 in your Supabase SQL editor."
              : error.message,
          );
        }
        setApps((data as CollegeApplication[]) ?? []);
        setLoading(false);
      });
  }, []);

  const trackedNames = new Set(apps.map((a) => a.university_name.toLowerCase()));
  const untracked = targetUniversities.filter(
    (u) => !trackedNames.has(u.toLowerCase()),
  );

  async function add(name: string) {
    const clean = name.trim();
    if (!clean || adding) return;
    setAdding(true);
    setError(null);
    const sb = supabaseBrowser();
    const { data: auth } = await sb.auth.getUser();
    if (!auth.user) return;
    const { data, error } = await sb
      .from("college_applications")
      .insert({ user_id: auth.user.id, university_name: clean })
      .select("*")
      .single();
    if (error) setError(error.message);
    else if (data) setApps((a) => [...a, data as CollegeApplication]);
    setNewName("");
    setAdding(false);
  }

  async function update(id: string, patch: Partial<CollegeApplication>) {
    setApps((a) => a.map((x) => (x.id === id ? { ...x, ...patch } : x)));
    await supabaseBrowser().from("college_applications").update(patch).eq("id", id);
  }

  async function remove(id: string) {
    setApps((a) => a.filter((x) => x.id !== id));
    await supabaseBrowser().from("college_applications").delete().eq("id", id);
  }

  if (loading) return <div className="text-graymute">Loading applications...</div>;

  return (
    <div>
      {error && (
        <div className="mb-4 text-sm text-red-600 border border-red-200 bg-red-50 rounded-lg p-3">
          {error}
        </div>
      )}

      {/* Quick-add from onboarding targets */}
      {untracked.length > 0 && (
        <div className="mb-6">
          <div className="text-sm text-graytext mb-2">
            From your target list — click to track:
          </div>
          <div className="flex flex-wrap gap-2">
            {untracked.map((u) => (
              <button
                key={u}
                onClick={() => add(u)}
                className="inline-flex items-center gap-1.5 rounded-full border border-grayline px-3 py-1.5 text-sm text-graytext hover:border-ink hover:text-ink"
              >
                <Plus className="w-3 h-3" />
                {u}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {apps.map((app) => (
          <ApplicationCard
            key={app.id}
            app={app}
            onUpdate={(patch) => update(app.id, patch)}
            onDelete={() => remove(app.id)}
          />
        ))}
      </div>

      {apps.length === 0 && (
        <div className="rounded-2xl border border-grayline p-8 text-center text-sm text-graymute mb-4">
          Nothing tracked yet. Add a university below or click one of your
          targets above.
        </div>
      )}

      {/* Add custom */}
      <div className="mt-6 flex gap-2 max-w-md">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add(newName)}
          placeholder="Add a university to track"
          className="flex-1 rounded-lg border border-grayline px-4 py-2.5 text-sm outline-none focus:border-ink"
        />
        <button
          onClick={() => add(newName)}
          disabled={adding || !newName.trim()}
          className="inline-flex items-center gap-2 rounded-lg bg-ink text-paper px-4 py-2.5 text-sm disabled:opacity-40"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>
    </div>
  );
}

function daysUntil(date: string): number {
  const d = new Date(date + "T23:59:59");
  return Math.ceil((d.getTime() - Date.now()) / 86400000);
}

function ApplicationCard({
  app,
  onUpdate,
  onDelete,
}: {
  app: CollegeApplication;
  onUpdate: (patch: Partial<CollegeApplication>) => void;
  onDelete: () => void;
}) {
  const [notes, setNotes] = useState(app.notes ?? "");
  const days = app.deadline ? daysUntil(app.deadline) : null;
  const doneCount = CHECKLIST.filter((c) => app[c.key]).length;

  return (
    <div className="rounded-2xl border border-grayline bg-paper p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="font-semibold">{app.university_name}</div>
        <button
          onClick={onDelete}
          className="text-graymute hover:text-ink shrink-0"
          aria-label="Remove"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Deadline + countdown */}
      <div className="mt-3 flex items-center gap-3 flex-wrap">
        <input
          type="date"
          value={app.deadline ?? ""}
          onChange={(e) => onUpdate({ deadline: e.target.value || null })}
          className="rounded-lg border border-grayline px-3 py-1.5 text-sm outline-none focus:border-ink bg-paper"
        />
        {days !== null && (
          <span
            className={cn(
              "inline-flex items-center gap-1 text-xs rounded-full px-2.5 py-1",
              days < 0
                ? "bg-ink text-paper"
                : days <= 14
                  ? "bg-graylite text-ink font-semibold"
                  : "bg-graylite text-graytext",
            )}
          >
            <CalendarClock className="w-3 h-3" />
            {days < 0
              ? `${Math.abs(days)}d overdue`
              : days === 0
                ? "Due today"
                : `${days} days left`}
          </span>
        )}
      </div>

      {/* Status */}
      <div className="mt-3 flex gap-1.5">
        {(Object.keys(STATUS_LABELS) as ApplicationStatus[]).map((s) => (
          <button
            key={s}
            onClick={() => onUpdate({ status: s })}
            className={cn(
              "rounded-full px-3 py-1 text-xs border",
              app.status === s
                ? "bg-ink text-paper border-ink"
                : "border-grayline text-graytext hover:border-ink",
            )}
          >
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {/* Checklist */}
      <div className="mt-4 space-y-1.5">
        {CHECKLIST.map(({ key, label }) => {
          const done = Boolean(app[key]);
          return (
            <button
              key={key}
              onClick={() => onUpdate({ [key]: !done } as Partial<CollegeApplication>)}
              className="flex items-center gap-2 text-sm w-full text-left"
            >
              {done ? (
                <CheckCircle2 className="w-4 h-4 text-ink" />
              ) : (
                <Circle className="w-4 h-4 text-grayline" />
              )}
              <span className={cn(done ? "text-ink line-through" : "text-graytext")}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
      <div className="mt-2 h-1.5 bg-graylite rounded">
        <div
          className="h-full bg-ink rounded transition-all"
          style={{ width: `${(doneCount / CHECKLIST.length) * 100}%` }}
        />
      </div>

      {/* Notes */}
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        onBlur={() => notes !== (app.notes ?? "") && onUpdate({ notes })}
        rows={2}
        placeholder="Notes (saved automatically)"
        className="mt-3 w-full rounded-lg border border-grayline px-3 py-2 text-xs outline-none focus:border-ink resize-none"
      />
    </div>
  );
}
