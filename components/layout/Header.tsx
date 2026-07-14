"use client";

import { Sparkles, CalendarClock, Command } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase";
import PricingModal from "@/components/shared/PricingModal";

interface NextExam {
  name: string;
  daysLeft: number;
}

export default function Header({ title }: { title: string }) {
  const { isPro } = useProfile();
  const [open, setOpen] = useState(false);
  const [nextExam, setNextExam] = useState<NextExam | null>(null);

  useEffect(() => {
    const sb = supabaseBrowser();
    (async () => {
      const { data: auth } = await sb.auth.getUser();
      if (!auth.user) return;
      const today = new Date().toISOString().slice(0, 10);
      const { data } = await sb
        .from("subjects")
        .select("name, exam_date")
        .eq("user_id", auth.user.id)
        .gte("exam_date", today)
        .order("exam_date", { ascending: true })
        .limit(1);
      const soonest = data?.[0];
      if (!soonest?.exam_date) return;
      const ms = new Date(soonest.exam_date).getTime() - Date.now();
      const daysLeft = Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)));
      setNextExam({ name: soonest.name, daysLeft });
    })();
  }, []);

  return (
    <header className="flex items-center justify-between px-8 py-5 border-b border-grayline bg-paper sticky top-0 z-10 gap-3">
      <h1 className="text-xl font-semibold truncate">{title}</h1>
      <div className="flex items-center gap-3 shrink-0">
        {nextExam && (
          <span
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-grayline px-3 py-1.5 text-xs text-graytext"
            title={`Next exam: ${nextExam.name}`}
          >
            <CalendarClock className="w-3.5 h-3.5 text-graymute" />
            {nextExam.name}{" "}
            <span className="font-semibold text-ink">
              {nextExam.daysLeft === 0
                ? "today"
                : `in ${nextExam.daysLeft}d`}
            </span>
          </span>
        )}
        <span
          className="hidden lg:inline-flex items-center gap-1 rounded-lg border border-grayline px-2 py-1.5 text-[10px] text-graymute"
          title="Press Ctrl+K to jump anywhere"
        >
          <Command className="w-3 h-3" />
          Ctrl K
        </span>
        {!isPro && (
          <button
            onClick={() => setOpen(true)}
            className="relative overflow-hidden shimmer-pro text-paper rounded-lg px-4 py-2 text-sm font-medium animate-shimmer inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Unlock Pro
          </button>
        )}
        {isPro && (
          <span className="rounded-lg border border-ink px-3 py-1 text-xs font-medium">
            PRO
          </span>
        )}
      </div>
      <PricingModal open={open} onClose={() => setOpen(false)} />
    </header>
  );
}
