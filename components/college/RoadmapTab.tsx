"use client";

import { GraduationCap, Flag, Target, Shield, Rocket } from "lucide-react";
import type { ActionPlanItem, UniversityMatch } from "@/types";
import { cn } from "@/lib/utils";

const STAGES = ["Grade 9", "Grade 10", "Grade 11", "Applications"];

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

  const reach = matches.filter((m) => m.fit === "reach");
  const target = matches.filter((m) => m.fit === "target");
  const safety = matches.filter((m) => m.fit === "safety");

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

      {/* Milestones from the action plan */}
      <h3 className="text-lg font-semibold mt-8 mb-3">
        Your next 6 months — milestones
      </h3>
      {actionPlan.length === 0 ? (
        <p className="text-sm text-graymute">
          No action plan yet — generate your readiness profile first.
        </p>
      ) : (
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-0 min-w-max">
            {actionPlan.map((p, i) => (
              <div key={i} className="flex items-start">
                <div className="w-[220px]">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-ink shrink-0" />
                    {i < actionPlan.length - 1 && (
                      <div className="h-0.5 flex-1 bg-grayline" />
                    )}
                  </div>
                  <div className="mt-3 mr-4 rounded-xl border border-grayline p-4 h-full">
                    <div className="text-xs text-graymute">{p.month}</div>
                    <div className="font-medium text-sm mt-1">{p.goal}</div>
                    <div className="text-xs text-graytext mt-1.5 line-clamp-4">
                      {p.details}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
