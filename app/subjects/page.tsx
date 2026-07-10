"use client";

import { useEffect, useState } from "react";
import { Plus, X, Save, Loader2 } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { supabaseBrowser } from "@/lib/supabase";
import { IGCSE_SUBJECTS, codeForSubject } from "@/lib/igcse-subjects";

type Subject = {
  id?: string;
  name: string;
  code: string | null;
  exam_date: string | null;
  _isNew?: boolean;
  _dirty?: boolean;
};

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const sb = supabaseBrowser();
    (async () => {
      const { data: auth } = await sb.auth.getUser();
      if (!auth.user) {
        setLoading(false);
        return;
      }
      setUserId(auth.user.id);
      const { data } = await sb
        .from("subjects")
        .select("id, name, code, exam_date")
        .eq("user_id", auth.user.id)
        .order("name");
      setSubjects(
        (data ?? []).map((s) => ({
          id: s.id,
          name: s.name,
          code: s.code,
          exam_date: s.exam_date,
        })),
      );
      setLoading(false);
    })();
  }, []);

  function addSubject() {
    setSubjects((s) => [
      ...s,
      { name: "", code: "", exam_date: "", _isNew: true, _dirty: true },
    ]);
  }

  function updateSubject(i: number, patch: Partial<Subject>) {
    setSubjects((s) =>
      s.map((x, idx) => (idx === i ? { ...x, ...patch, _dirty: true } : x)),
    );
  }

  async function removeSubject(i: number) {
    const target = subjects[i];
    if (target.id) {
      if (!window.confirm(`Remove ${target.name || "this subject"}?`)) return;
      const sb = supabaseBrowser();
      await sb.from("subjects").delete().eq("id", target.id);
    }
    setSubjects((s) => s.filter((_, idx) => idx !== i));
  }

  async function saveAll() {
    if (!userId) return;
    setSaving(true);
    const sb = supabaseBrowser();

    const toInsert = subjects
      .filter((s) => s._isNew && s.name.trim())
      .map((s) => ({
        user_id: userId,
        name: s.name.trim(),
        code: s.code?.trim() || null,
        exam_date: s.exam_date || null,
      }));

    const toUpdate = subjects.filter(
      (s) => !s._isNew && s._dirty && s.id && s.name.trim(),
    );

    if (toInsert.length) {
      const { data } = await sb.from("subjects").insert(toInsert).select();
      // merge new IDs back
      if (data) {
        setSubjects((prev) => {
          const cleaned = prev.filter((s) => !s._isNew);
          return [
            ...cleaned,
            ...data.map((d) => ({
              id: d.id,
              name: d.name,
              code: d.code,
              exam_date: d.exam_date,
            })),
          ];
        });
      }
    }

    for (const s of toUpdate) {
      await sb
        .from("subjects")
        .update({
          name: s.name.trim(),
          code: s.code?.trim() || null,
          exam_date: s.exam_date || null,
        })
        .eq("id", s.id!);
    }

    setSubjects((prev) =>
      prev.map((s) => ({ ...s, _dirty: false, _isNew: false })),
    );
    setSavedAt(new Date().toLocaleTimeString());
    setSaving(false);
  }

  const hasChanges = subjects.some((s) => s._dirty);

  return (
    <AppLayout title="Subjects">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-h2">Your subjects</h1>
          <p className="mt-2 text-graytext">
            Add, edit, or remove the IGCSE subjects you&apos;re studying.
          </p>
        </div>
        <button
          onClick={saveAll}
          disabled={!hasChanges || saving}
          className="inline-flex items-center gap-2 rounded-lg bg-ink text-paper px-5 py-2.5 hover:opacity-90 disabled:opacity-40"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? "Saving..." : "Save changes"}
        </button>
      </div>

      {savedAt && !hasChanges && (
        <div className="mb-6 text-sm text-graytext">Saved at {savedAt}</div>
      )}

      {loading ? (
        <div className="text-graymute">Loading...</div>
      ) : (
        <div className="max-w-3xl">
          <div className="hidden md:grid grid-cols-12 gap-2 mb-2 text-xs text-graymute uppercase tracking-wide px-1">
            <div className="col-span-5">Subject</div>
            <div className="col-span-2">Code</div>
            <div className="col-span-4">Exam date</div>
            <div className="col-span-1" />
          </div>
          <div className="space-y-2">
            {subjects.length === 0 && (
              <div className="rounded-xl border border-dashed border-grayline p-8 text-center text-graytext">
                No subjects yet. Click &quot;Add subject&quot; to get started.
              </div>
            )}
            {subjects.map((s, i) => (
              <div
                key={s.id ?? `new-${i}`}
                className="grid grid-cols-12 gap-2 items-center rounded-lg border border-grayline bg-paper p-2"
              >
                <select
                  value={s.name}
                  onChange={(e) =>
                    updateSubject(i, {
                      name: e.target.value,
                      code: codeForSubject(e.target.value) || s.code,
                    })
                  }
                  className="col-span-5 rounded-md px-3 py-2 outline-none focus:bg-graylite bg-paper"
                >
                  <option value="">Select subject…</option>
                  {IGCSE_SUBJECTS.map((subj) => (
                    <option key={subj.code} value={subj.name}>
                      {subj.name}
                    </option>
                  ))}
                </select>
                <input
                  placeholder="0580"
                  value={s.code ?? ""}
                  onChange={(e) => updateSubject(i, { code: e.target.value })}
                  className="col-span-2 rounded-md px-3 py-2 outline-none focus:bg-graylite font-mono text-sm"
                />
                <input
                  type="date"
                  value={s.exam_date ?? ""}
                  onChange={(e) => updateSubject(i, { exam_date: e.target.value })}
                  className="col-span-4 rounded-md px-3 py-2 outline-none focus:bg-graylite text-sm"
                />
                <button
                  onClick={() => removeSubject(i)}
                  className="col-span-1 text-graymute hover:text-ink"
                  aria-label="Remove subject"
                >
                  <X className="w-4 h-4 mx-auto" />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={addSubject}
            className="mt-4 inline-flex items-center gap-2 text-sm text-graytext hover:text-ink"
          >
            <Plus className="w-4 h-4" /> Add subject
          </button>
        </div>
      )}
    </AppLayout>
  );
}
