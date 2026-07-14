"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  Award,
  ExternalLink,
  CalendarClock,
  BadgeCheck,
  RefreshCw,
  Globe,
  Landmark,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CuratedItem {
  name: string;
  provider: string;
  amount: string;
  eligibility: string;
  deadlineWindow: string;
  url: string;
  actNow: string;
}

interface CuratedGroup {
  category: string;
  title: string;
  subtitle: string;
  items: CuratedItem[];
}

interface LiveScholarship {
  name: string;
  amount: string;
  eligibility: string;
  deadline: string;
  url: string;
  match_reason: string;
}

export default function ScholarshipsTab() {
  const [groups, setGroups] = useState<CuratedGroup[] | null>(null);
  const [curatedError, setCuratedError] = useState<string | null>(null);
  const [live, setLive] = useState<LiveScholarship[] | null>(null);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/college/scholarships");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Could not load scholarships.");
        if (!cancelled) setGroups(data.groups ?? []);
      } catch (e) {
        if (!cancelled) setCuratedError((e as Error).message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function searchLive() {
    setLiveLoading(true);
    setLiveError(null);
    try {
      const res = await fetch("/api/college/scholarships", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Search failed.");
      setLive(data.items ?? []);
    } catch (e) {
      setLiveError((e as Error).message);
    } finally {
      setLiveLoading(false);
    }
  }

  return (
    <div>
      {/* Intro */}
      <div className="rounded-2xl border border-grayline bg-paper p-6">
        <div className="flex items-center gap-2 font-semibold">
          <Award className="w-4 h-4" />
          Scholarship directory
        </div>
        <p className="text-sm text-graymute mt-1 max-w-2xl">
          A hand-picked directory of real scholarships and award competitions,
          ordered for your grade, country, and interests — plus a live web
          search for brand-new openings.
        </p>
      </div>

      {curatedError && (
        <p role="alert" className="mt-4 text-sm text-red-600">
          {curatedError}
        </p>
      )}

      {/* Curated skeleton */}
      {!groups && !curatedError && (
        <div className="mt-6 space-y-4" aria-hidden="true">
          {[0, 1].map((i) => (
            <div key={i} className="rounded-2xl border border-grayline bg-paper p-5">
              <div className="h-4 w-52 rounded bg-graylite animate-pulse" />
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-28 rounded-xl bg-graylite animate-pulse" />
                <div className="h-28 rounded-xl bg-graylite animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Curated categories */}
      {groups?.map((g) => (
        <section key={g.category} className="mt-8" aria-label={g.title}>
          <div className="flex items-center gap-2">
            <Landmark className="w-4 h-4 shrink-0" />
            <h3 className="text-lg font-semibold">{g.title}</h3>
            <span className="text-xs text-graymute rounded-full border border-grayline px-2 py-0.5">
              {g.items.length}
            </span>
          </div>
          <p className="text-sm text-graymute mt-1 max-w-2xl">{g.subtitle}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {g.items.map((s) => (
              <article
                key={s.name}
                className="rounded-2xl border border-grayline bg-paper p-5 flex flex-col transition hover:border-graymute"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium text-sm">{s.name}</div>
                    <div className="text-xs text-graymute mt-0.5">{s.provider}</div>
                  </div>
                  {s.actNow !== "plan-ahead" && (
                    <span className="shrink-0 rounded-full bg-ink text-paper px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap">
                      Apply now
                    </span>
                  )}
                </div>
                <div className="mt-3 text-sm font-semibold">{s.amount}</div>
                <div className="flex items-start gap-1.5 text-xs text-graytext mt-2">
                  <BadgeCheck className="w-3.5 h-3.5 shrink-0 mt-0.5 text-graymute" />
                  {s.eligibility}
                </div>
                <div className="flex items-start gap-1.5 text-xs text-graytext mt-1.5">
                  <CalendarClock className="w-3.5 h-3.5 shrink-0 mt-0.5 text-graymute" />
                  {s.deadlineWindow}
                </div>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto pt-3 inline-flex items-center gap-1.5 text-xs font-medium underline underline-offset-2 hover:text-graytext"
                >
                  <ExternalLink className="w-3 h-3" />
                  Official site
                </a>
              </article>
            ))}
          </div>
        </section>
      ))}

      {/* Live search extension */}
      {groups && (
        <section className="mt-10" aria-label="Live scholarship search">
          <div className="rounded-2xl border border-grayline bg-graylite/40 p-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
            <div>
              <div className="flex items-center gap-2 font-semibold">
                <Globe className="w-4 h-4" />
                Fresh from the web
              </div>
              <p className="text-sm text-graymute mt-1 max-w-xl">
                New scholarships open all the time. Run a live search matched to
                your profile to catch ones this directory doesn&apos;t list yet.
              </p>
            </div>
            <button
              type="button"
              onClick={searchLive}
              disabled={liveLoading}
              className="rounded-lg bg-ink text-paper px-5 py-2.5 text-sm font-medium disabled:opacity-40 inline-flex items-center gap-2 shrink-0 min-h-[44px]"
            >
              {liveLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Searching the web...
                </>
              ) : live ? (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Search again
                </>
              ) : (
                "Search the web"
              )}
            </button>
          </div>

          {liveError && (
            <p role="alert" className="mt-4 text-sm text-red-600">
              {liveError}
            </p>
          )}

          <div aria-live="polite">
            {live && live.length === 0 && !liveLoading && (
              <p className="mt-4 text-sm text-graymute">
                Nothing new found this time — the directory above already covers
                the strongest options.
              </p>
            )}

            {live && live.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {live.map((s, i) => (
                  <article
                    key={i}
                    className="rounded-2xl border border-grayline bg-paper p-5 flex flex-col"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="font-medium text-sm">{s.name}</div>
                      <span
                        className={cn(
                          "shrink-0 rounded-full border border-ink px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap",
                        )}
                      >
                        {s.amount}
                      </span>
                    </div>
                    <div className="flex items-start gap-1.5 text-xs text-graytext mt-3">
                      <BadgeCheck className="w-3.5 h-3.5 shrink-0 mt-0.5 text-graymute" />
                      {s.eligibility}
                    </div>
                    <div className="flex items-start gap-1.5 text-xs text-graytext mt-1.5">
                      <CalendarClock className="w-3.5 h-3.5 shrink-0 mt-0.5 text-graymute" />
                      {s.deadline}
                    </div>
                    <p className="text-xs text-graymute mt-2 italic">
                      {s.match_reason}
                    </p>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-auto pt-3 inline-flex items-center gap-1.5 text-xs font-medium underline underline-offset-2 hover:text-graytext"
                    >
                      <ExternalLink className="w-3 h-3" />
                      View details &amp; apply
                    </a>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
