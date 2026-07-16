"use client";

import { useState } from "react";
import { Sparkles, MessagesSquare, Library, Target } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import PricingModal from "@/components/shared/PricingModal";
import TutorChat from "@/components/papers/TutorChat";
import LibraryTab from "@/components/papers/LibraryTab";
import AiPracticePanel from "@/components/papers/AiPracticePage";
import { cn } from "@/lib/utils";

type Tab = "chat" | "library" | "practice";

const TABS: { id: Tab; label: string; icon: typeof MessagesSquare }[] = [
  { id: "chat", label: "Chat", icon: MessagesSquare },
  { id: "library", label: "My library", icon: Library },
  { id: "practice", label: "AI practice", icon: Target },
];

export default function AiTutorPage() {
  const { isPro, loading } = useProfile();
  const [tab, setTab] = useState<Tab>("chat");
  const [pricingOpen, setPricingOpen] = useState(false);

  if (loading) {
    return (
      <div className="space-y-3 max-w-2xl" aria-hidden="true">
        <div className="h-8 w-48 bg-graylite rounded animate-pulse" />
        <div className="h-4 w-full bg-graylite rounded animate-pulse" />
        <div className="h-4 w-2/3 bg-graylite rounded animate-pulse" />
        <div className="h-64 w-full bg-graylite rounded-2xl animate-pulse mt-6" />
      </div>
    );
  }

  if (!isPro) {
    return (
      <div>
        <h1 className="text-2xl font-semibold">AI tutor</h1>
        <p className="text-graytext mt-1 max-w-xl">
          Your own IGCSE tutor — ask doubts, upload your papers, and practise
          against real mark schemes.
        </p>
        <div className="mt-8 rounded-2xl border border-grayline bg-graylite/50 p-10 text-center max-w-2xl">
          <Sparkles className="w-6 h-6 mx-auto text-gold" aria-hidden="true" />
          <h2 className="text-lg font-semibold mt-3">
            The AI tutor is a Pro feature
          </h2>
          <p className="text-sm text-graytext mt-1 max-w-md mx-auto">
            Chat through any doubt, keep your papers in one library, and generate
            unlimited original practice marked to the real scheme — the
            replacement for hunting down past papers.
          </p>
          <button
            onClick={() => setPricingOpen(true)}
            className="mt-5 rounded-lg bg-ink text-paper px-6 py-3 text-sm min-h-[44px]"
          >
            Unlock Pro
          </button>
        </div>
        <PricingModal open={pricingOpen} onClose={() => setPricingOpen(false)} />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">AI tutor</h1>
      <p className="text-graytext mt-1 max-w-xl">
        Ask any doubt, keep your papers in one place, and practise against real
        mark schemes.
      </p>

      <div
        role="tablist"
        aria-label="AI tutor sections"
        className="mt-6 flex items-center gap-1 border-b border-grayline"
      >
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            role="tab"
            id={`tab-${id}`}
            aria-selected={tab === id}
            aria-controls={`panel-${id}`}
            onClick={() => setTab(id)}
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2.5 text-sm border-b-2 -mb-px min-h-[44px] transition",
              tab === id
                ? "border-ink text-ink font-medium"
                : "border-transparent text-graytext hover:text-ink",
            )}
          >
            <Icon className="w-4 h-4" aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "chat" && (
          <div role="tabpanel" id="panel-chat" aria-labelledby="tab-chat">
            <TutorChat />
          </div>
        )}

        {tab === "library" && (
          <div role="tabpanel" id="panel-library" aria-labelledby="tab-library">
            <div className="rounded-2xl border border-grayline bg-graylite/40 p-5 mb-5 max-w-3xl">
              <h2 className="font-semibold">Upload anything we can mark you against</h2>
              <p className="text-sm text-graytext mt-1">
                Past papers, <strong>mark schemes</strong>, your teacher&apos;s
                notes, a photo-free PDF of your syllabus — anything that shows how
                your board awards marks. The tutor reads these when you attach
                them in chat, and{" "}
                <strong>AI practice marks your answers against them</strong>{" "}
                instead of guessing.
              </p>
              <p className="text-xs text-graymute mt-2">
                Mark schemes matter most — they&apos;re what turns vague feedback
                into “this line earns the method mark”. Searchable PDFs only;
                scans have no text to read.
              </p>
            </div>
            <LibraryTab mode="papers" />
          </div>
        )}

        {tab === "practice" && (
          <div role="tabpanel" id="panel-practice" aria-labelledby="tab-practice">
            <AiPracticePanel />
          </div>
        )}
      </div>
    </div>
  );
}
