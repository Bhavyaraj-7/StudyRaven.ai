"use client";

import { useEffect, useState } from "react";
import { Loader2, RefreshCw, Clock, Upload, CalendarClock } from "lucide-react";
import type { DayPlan } from "@/types";
import { Skeleton } from "@/components/shared/Skeleton";

export default function WeekPlan() {
  const [plan, setPlan] = useState<DayPlan[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showSchedule, setShowSchedule] = useState(false);
  const [testSchedule, setTestSchedule] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/study-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ test_schedule: testSchedule }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPlan(data.plan);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileName(f.name);
    if (f.type.startsWith("text/") || f.name.endsWith(".md") || f.name.endsWith(".txt")) {
      const text = await f.text();
      setTestSchedule(text.slice(0, 10000));
    } else {
      setTestSchedule(`(uploaded: ${f.name})`);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="mt-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">This week&apos;s plan</h2>
        <button
          onClick={load}
          disabled={loading}
          className="text-sm text-graytext hover:text-ink inline-flex items-center gap-1"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          Regenerate
        </button>
      </div>

      <div className="rounded-xl border border-grayline bg-paper p-4 mb-4">
        <button
          onClick={() => setShowSchedule((s) => !s)}
          className="inline-flex items-center gap-2 text-sm font-medium text-graytext hover:text-ink"
        >
          <CalendarClock className="w-4 h-4" />
          {showSchedule ? "Hide" : "Add"} your test schedule
          <span className="text-graymute font-normal">
            (optional — helps us prioritize your plan)
          </span>
        </button>

        {showSchedule && (
          <div className="mt-4 space-y-3">
            <textarea
              value={testSchedule}
              onChange={(e) => setTestSchedule(e.target.value)}
              placeholder={"Type your test dates, e.g.\nMaths — 12 March\nPhysics — 18 March"}
              rows={3}
              className="w-full rounded-lg border border-grayline px-4 py-3 outline-none focus:border-ink resize-none text-sm"
            />
            <label className="block">
              <span className="text-xs text-graymute">
                Or upload your test schedule (PDF, image, txt)
              </span>
              <div className="mt-1 rounded-lg border border-dashed border-grayline px-4 py-2.5 flex items-center gap-2 cursor-pointer hover:border-ink">
                <Upload className="w-4 h-4 text-graytext" />
                <span className="text-sm text-graytext">
                  {fileName ?? "Choose file"}
                </span>
                <input
                  type="file"
                  onChange={onFile}
                  className="hidden"
                  accept=".pdf,.png,.jpg,.jpeg,.txt,.md"
                />
              </div>
            </label>
            <button
              onClick={load}
              disabled={loading}
              className="rounded-lg bg-ink text-paper px-4 py-2 text-sm disabled:opacity-50"
            >
              {loading ? "Generating..." : "Generate plan with this schedule"}
            </button>
            <p className="text-xs text-graymute">
              Don&apos;t have your schedule handy? Leave this empty — we&apos;ll
              build your plan from your subjects instead.
            </p>
          </div>
        )}
      </div>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-36" />
          ))}
        </div>
      )}

      {error && (
        <div className="text-sm text-red-600 border border-red-200 bg-red-50 rounded-lg p-3">
          {error}
        </div>
      )}

      {plan && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {plan.map((day) => (
            <div
              key={day.day}
              className="rounded-xl border border-grayline bg-paper p-4"
            >
              <div className="font-semibold mb-3">{day.day}</div>
              <ul className="space-y-2">
                {day.tasks?.map((t, i) => (
                  <li key={i} className="text-sm">
                    <div className="font-medium">{t.title}</div>
                    <div className="text-graymute text-xs mt-0.5 inline-flex items-center gap-2">
                      <span>{t.subject}</span>
                      <span className="inline-flex items-center gap-0.5">
                        <Clock className="w-3 h-3" /> {t.minutes}m
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
