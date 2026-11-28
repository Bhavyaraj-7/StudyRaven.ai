"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

/** Copies the support address; a tick confirms it (and is announced). */
export default function CopyEmail({ email, className }: { email: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        "press inline-flex h-11 items-center gap-2 rounded-pill border-[1.5px] border-control-line px-5 text-[15px] font-semibold text-ink transition-colors duration-small hover:bg-paper-2",
        className,
      )}
    >
      {copied ? <Check className="pop-in h-4 w-4 text-accent" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
      <span aria-live="polite">{copied ? "Copied" : "Copy email"}</span>
    </button>
  );
}
