"use client";

import { useState } from "react";
import {
  Loader2,
  Award,
  ExternalLink,
  CalendarClock,
  BadgeCheck,
  RefreshCw,
} from "lucide-react";

interface Scholarship {
  name: string;
  amount: string;
  eligibility: string;
  deadline: string;
  url: string;
  match_reason: string;
}

export default function ScholarshipsTab() {
  const [items, setItems] = useState<Scholarship[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function search() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/college/scholarships", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Search failed.");
      setItems(data.items ?? []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="rounded-2xl border border-grayline bg-paper p-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <div className="flex items-center gap-2 font-semibold">
            <Award className="w-4 h-4" />
            Scholarship finder
          </div>
          <p className="text-sm text-graymute mt-1 max-w-xl">
            Live web search for scholarships matched to your grade, country,
            target destination, and interests — with amounts, eligibility, and
            deadlines.
          </p>
        </div>
        <button
          type="button"
          onClick={search}
          disabled={loading}
          className="rounded-lg bg-ink text-paper px-5 py-2.5 text-sm font-medium disabled:opacity-40 inline-flex items-center gap-2 shrink-0"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Searching the web...
            </>
          ) : items ? (
            <>
              <RefreshCw className="w-4 h-4" />
              Search again
            </>
          ) : (
            "Find scholarships"
          )}
        </button>
      </div>

      {error && (
        <p role="alert" className="mt-4 text-sm text-red-600">
          {error}
        </p>
      )}

      {items && items.length === 0 && !loading && (
        <p className="mt-6 text-sm text-graymute">
          Nothing solid found this time — try again, results vary as new
          scholarships open.
        </p>
      )}

      {items && items.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {items.map((s, i) => (
            <div
              key={i}
              className="rounded-2xl border border-grayline bg-paper p-5 flex flex-col"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="font-medium text-sm">{s.name}</div>
                <span className="shrink-0 rounded-full border border-ink px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap">
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
              <p className="text-xs text-graymute mt-2 italic">{s.match_reason}</p>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto pt-3 inline-flex items-center gap-1.5 text-xs font-medium underline underline-offset-2 hover:text-graytext"
              >
                <ExternalLink className="w-3 h-3" />
                View details & apply
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
