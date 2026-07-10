"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, TimerReset } from "lucide-react";
import { SOURCES } from "@/lib/paper-sources";

export default function BrowseTab({ mode }: { mode: "papers" | "marks" }) {
  const [subject, setSubject] = useState("Mathematics");
  const [year, setYear] = useState("2024");
  const [paper, setPaper] = useState("Paper 2");

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Subject"
          className="rounded-lg border border-grayline px-4 py-2.5 outline-none focus:border-ink"
        />
        <input
          value={year}
          onChange={(e) => setYear(e.target.value)}
          placeholder="Year (e.g. 2024)"
          className="rounded-lg border border-grayline px-4 py-2.5 outline-none focus:border-ink"
        />
        <input
          value={paper}
          onChange={(e) => setPaper(e.target.value)}
          placeholder="Paper type (e.g. Paper 2)"
          className="rounded-lg border border-grayline px-4 py-2.5 outline-none focus:border-ink"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {SOURCES.map((s) => (
          <div
            key={s.name}
            className="rounded-xl border border-grayline bg-paper p-5 hover:border-ink transition"
          >
            <a
              href={s.buildBrowseUrl({ subject, year, paper })}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <div className="flex items-center justify-between">
                <div className="font-semibold">{s.name}</div>
                <ExternalLink className="w-4 h-4 text-graymute" />
              </div>
              <div className="text-sm text-graymute mt-1">{s.baseUrl}</div>
              <div className="text-xs text-graytext mt-3">
                {mode === "papers" ? "Browse past papers" : "Browse mark schemes"}
              </div>
            </a>
            <Link
              href={`/mocks?subject=${encodeURIComponent(subject)}`}
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium underline"
            >
              <TimerReset className="w-3.5 h-3.5" /> Take as mock instead
            </Link>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-graymute">
        StudyRaven does not host papers. All links open the original source in a new tab.
      </p>
      <p className="mt-2 text-xs text-graymute">
        Past papers and mark schemes are the copyright of their respective exam
        boards (Cambridge Assessment International Education, Pearson Edexcel).
        StudyRaven.ai is not affiliated with or endorsed by any exam board.
      </p>
    </div>
  );
}
