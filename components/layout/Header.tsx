"use client";

import { Sparkles } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useState } from "react";
import PricingModal from "@/components/shared/PricingModal";

export default function Header({ title }: { title: string }) {
  const { isPro } = useProfile();
  const [open, setOpen] = useState(false);

  return (
    <header className="flex items-center justify-between px-8 py-5 border-b border-grayline bg-paper sticky top-0 z-10">
      <h1 className="text-xl font-semibold">{title}</h1>
      <div className="flex items-center gap-3">
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
