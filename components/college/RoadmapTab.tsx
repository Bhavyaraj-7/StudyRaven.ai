"use client";

import { useMemo, useState } from "react";
import {
  GraduationCap,
  Flag,
  Target,
  Shield,
  Rocket,
  ChevronDown,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import type { ActionPlanItem, UniversityMatch } from "@/types";
import { supabaseBrowser } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const STAGES = ["Grade 9", "Grade 10", "Grade 11", "Applications"];

function countTasks(plan: ActionPlanItem[]): { done: number; total: number } {
  let done = 0;
  let total = 0;
  for (const month of plan) {
    for (const week of month.weeks ?? []) {
      for (const task of week.tasks ?? []) {
        total += 1;
        if (task.done) done += 1;
      }
    }
  }
  return { done, total };
}

export default function RoadmapTab({
  actionPlan,
  matches,
  currentGrade,
}: {
  actionPlan: ActionPlanItem[];
  matches: UniversityMatch[];
  currentGrade: number | null;
}) {
  const stageIndex = currentGrade === 9 ? 0 : currentGrade === 11 ? 2 : 1;
  const [plan, setPlan] = useState<ActionPlanItem[]>(actionPlan);

  const reach = matches.filter((m) => m.fit === "reach");
  const target = matches.filter((m) => m.fit === "target");
  const safety = matches.filter((m) => m.fit === "safety");

  const progress = useMemo(() => countTasks(plan), [plan]);
  const pct = progress.total
    ? Math.round((progress.done / progress.total) * 100)
    : 0;

  async function toggleTask(mi: number, wi: number, ti: number) {
    const next = plan.map((m, i) =>
      i !== mi
        ? m
        : {
            ...m,
            weeks: (m.weeks ?? []).map((w, j) =>
              j !== wi
                ? w
                : {
                    ...w,
                    tasks: (w.tasks ?? []).map((t, k) =>
                      k !== ti ? t : { ...t, done: !t.done },
                    ),
                  },
            ),
          },
    );
    const prev = plan;
    setPlan(next); // optimistic
    const sb = supabaseBrowser();
    const { data: auth } = await sb.auth.getUser();
    if (!auth.user) return;
    const { error } = await sb
      .from("college_profiles")
      .update({ action_plan: next, updated_at: new Date().toISOString() })
      .eq("user_id", auth.user.id);
    if (error) setPlan(prev); // revert on failure
  }

  return (
    <div>
      {/* Stage timeline */}
      <div className="rounded-2xl border border-grayline bg-paper p-6 overflow-x-auto">
        <div className="text-sm text-graymute mb-6">Your path to university</div>
        <div className="flex items-center min-w-[560px]">
          {STAGES.map((stage, i) => (
            <div key={stage} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center shrink-0">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full border-2 flex items-center justify-center",
                    i < stageIndex
                      ? "bg-ink border-ink text-paper"
                      : i === stageIndex
                        ? "border-ink text-ink"
                        : "border-grayline text-graymute",
                  )}
                >
                  {i === 3 ? <GraduationCap className="w-4 h-4" /> : <Flag className="w-4 h-4" />}
                </div>
                <div
                  className={cn(
                    "mt-2 text-xs whitespace-nowrap",
                    i === stageIndex ? "font-semibold text-ink" : "text-graymute",
                  )}
                >
                  {stage}
                </div>
                {i === stageIndex && (
                  <div className="text-[10px] uppercase tracking-wide text-graymute mt-0.5">
                    you are here
                  </div>
                )}
              </div>
              {i < STAGES.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 flex-1 mx-3 mb-9",
                    i < stageIndex ? "bg-ink" : "bg-grayline",
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Week-by-week action plan */}
      <div className="flex flex-wrap items-end justify-between gap-3 mt-8 mb-1">
        <div>
          <h3 className="text-lg font-semibold">
            Your next 6 months — week by week
          </h3>
          <p className="text-sm text-graymute mt-1">
            Tick tasks off as you finish them — progress saves automatically.
          </p>
        </div>
        {progress.total > 0 && (
          <div className="min-w-[180px]">
            <div className="flex items-baseline justify-between text-xs">
              <span className="text-graymute">
                {progress.done}/{progress.total} tasks
              </span>
              <span className="font-semibold">{pct}%</span>
            </div>
            <div
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Overall plan progress"
              className="mt-1 h-2 rounded-full bg-graylite overflow-hidden"
            >
              <div
                className="h-full bg-ink rounded-full transition-all duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )}
      </div>
      {plan.length === 0 ? (
        <p className="text-sm text-graymute mt-3">
          No action plan yet — generate your readiness profile first.
        </p>
      ) : (
        <div className="space-y-3 mt-4">
          {plan.map((p, i) => (
            <MonthCard
              key={i}
              plan={p}
              defaultOpen={i === 0}
              index={i}
              onToggleTask={(wi, ti) => toggleTask(i, wi, ti)}
            />
          ))}
        </div>
      )}

      {/* Reach / target / safety */}
      <h3 className="text-lg font-semibold mt-10 mb-3">University shortlist</h3>
      {matches.length === 0 ? (
        <p className="text-sm text-graymute">
          No university matches yet — generate your readiness profile first.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FitColumn
            icon={<Rocket className="w-4 h-4" />}
            title="Reach"
            subtitle="Ambitious — aim high"
            unis={reach}
          />
          <FitColumn
            icon={<Target className="w-4 h-4" />}
            title="Target"
            subtitle="Realistic matches"
            unis={target}
          />
          <FitColumn
            icon={<Shield className="w-4 h-4" />}
            title="Safety"
            subtitle="Strong likelihood"
            unis={safety}
          />
        </div>
      )}
    </div>
  );
}

function MonthCard({
  plan,
  defaultOpen,
  index,
  onToggleTask,
}: {
  plan: ActionPlanItem;
  defaultOpen: boolean;
  index: number;
  onToggleTask: (weekIndex: number, taskIndex: number) => void;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const weeks = plan.weeks ?? [];

  const monthProgress = useMemo(() => {
    let done = 0;
    let total = 0;
    for (const w of weeks) {
      for (const t of w.tasks ?? []) {
        total += 1;
        if (t.done) done += 1;
      }
    }
    return { done, total };
  }, [weeks]);
  const monthPct = monthProgress.total
    ? Math.round((monthProgress.done / monthProgress.total) * 100)
    : 0;

  return (
    <div className="rounded-2xl border border-grayline bg-paper overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-start gap-4 p-5 text-left hover:bg-graylite/40 transition"
      >
        <div className="w-8 h-8 rounded-full bg-ink text-paper flex items-center justify-center text-sm font-semibold shrink-0">
          {index + 1}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-graymute">{plan.month}</span>
            {monthProgress.total > 0 && (
              <span className="text-[10px] text-graymute rounded-full border border-grayline px-1.5 py-0.5">
                {monthProgress.done}/{monthProgress.total}
              </span>
            )}
          </div>
          <div className="font-medium text-sm mt-0.5">{plan.goal}</div>
          {plan.milestone && (
            <div className="flex items-center gap-1.5 text-xs text-graytext mt-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>Milestone: {plan.milestone}</span>
            </div>
          )}
          {monthProgress.total > 0 && (
            <div className="mt-2 h-1 rounded-full bg-graylite overflow-hidden max-w-[240px]">
              <div
                className="h-full bg-ink rounded-full transition-all duration-300"
                style={{ width: `${monthPct}%` }}
              />
            </div>
          )}
        </div>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-graymute shrink-0 mt-1 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="px-5 pb-5">
          {plan.details && (
            <p className="text-sm text-graytext mb-4">{plan.details}</p>
          )}
          {weeks.length === 0 ? (
            <p className="text-xs text-graymute">
              Regenerate your profile to get the detailed weekly plan for this
              month.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {weeks.map((w, wi) => (
                <div
                  key={wi}
                  className="rounded-xl border border-grayline bg-graylite/40 p-4"
                >
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wide">
                      {w.week}
                    </span>
                    <span className="text-xs text-graymute truncate">
                      {w.focus}
                    </span>
                  </div>
                  {w.outcome && (
                    <div className="mt-1.5 flex items-start gap-1.5 text-xs text-graytext">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-graymute" />
                      <span>
                        <span className="font-medium">By Sunday:</span>{" "}
                        {w.outcome}
                      </span>
                    </div>
                  )}
                  <ul className="mt-2 -mx-1">
                    {(w.tasks ?? []).map((t, ti) => (
                      <li key={ti}>
                        <label className="flex items-start gap-2.5 rounded-lg px-1 py-1.5 cursor-pointer hover:bg-paper/70 transition">
                          <input
                            type="checkbox"
                            checked={Boolean(t.done)}
                            onChange={() => onToggleTask(wi, ti)}
                            className="mt-0.5 h-4 w-4 shrink-0 rounded border-grayline accent-ink cursor-pointer"
                            aria-label={`Mark task done: ${t.task}`}
                          />
                          <span className="min-w-0">
                            <span className="mr-1.5 rounded bg-paper border border-grayline px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-graymute whitespace-nowrap">
                              {t.days}
                            </span>
                            <span
                              className={cn(
                                "text-xs",
                                t.done
                                  ? "text-graymute line-through"
                                  : "text-graytext",
                              )}
                            >
                              {t.task}
                            </span>
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                  {w.resource?.url && (
                    <a
                      href={w.resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium underline underline-offset-2 hover:text-graytext"
                    >
                      <ExternalLink className="w-3 h-3" />
                      {w.resource.title}
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FitColumn({
  icon,
  title,
  subtitle,
  unis,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  unis: UniversityMatch[];
}) {
  return (
    <div className="rounded-2xl border border-grayline bg-paper p-5">
      <div className="flex items-center gap-2 font-semibold">
        {icon}
        {title}
        <span className="ml-auto text-xs text-graymute font-normal">
          {unis.length}
        </span>
      </div>
      <div className="text-xs text-graymute mt-0.5">{subtitle}</div>
      <div className="mt-4 space-y-3">
        {unis.length === 0 && (
          <div className="text-xs text-graymute">None in this bucket yet.</div>
        )}
        {unis.map((u, i) => (
          <div key={i} className="rounded-xl bg-graylite/60 p-3">
            <div className="font-medium text-sm">{u.name}</div>
            <div className="text-xs text-graymute">{u.country}</div>
            <div className="text-xs text-graytext mt-1.5">{u.why}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
