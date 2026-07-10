"use client";

import { useState } from "react";
import BrowseTab from "./BrowseTab";
import LibraryTab from "./LibraryTab";
import AiPracticeTab from "./AiPracticeTab";
import { useProfile } from "@/hooks/useProfile";
import { Sparkles } from "lucide-react";

type Tab = "browse" | "library" | "ai";

export default function PapersPage({ mode }: { mode: "papers" | "marks" }) {
  const [tab, setTab] = useState<Tab>("browse");
  const { isPro } = useProfile();

  const tabs: { id: Tab; label: string; pro?: boolean }[] = [
    { id: "browse", label: "Browse" },
    { id: "library", label: "My library" },
    { id: "ai", label: "AI practice", pro: true },
  ];

  return (
    <div>
      <div className="flex gap-1 border-b border-grayline mb-6">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 -mb-px text-sm font-medium border-b-2 inline-flex items-center gap-1 ${
              tab === t.id
                ? "border-ink text-ink"
                : "border-transparent text-graytext hover:text-ink"
            }`}
          >
            {t.label}
            {t.pro && !isPro && <Sparkles className="w-3 h-3" />}
          </button>
        ))}
      </div>

      {tab === "browse" && <BrowseTab mode={mode} />}
      {tab === "library" && <LibraryTab mode={mode} />}
      {tab === "ai" && <AiPracticeTab mode={mode} isPro={isPro} />}
    </div>
  );
}
