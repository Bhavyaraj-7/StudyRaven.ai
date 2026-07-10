"use client";

import { useRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function MagneticButton({
  href,
  onClick,
  children,
  variant = "primary",
  className,
}: {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  variant?: "primary" | "ghost";
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  function onMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;
    el.style.transform = `translate(${x * 0.18}px, ${y * 0.18}px)`;
  }
  function onLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "translate(0, 0)";
  }

  const base =
    variant === "primary"
      ? "bg-ink text-paper hover:shadow-[0_14px_40px_rgba(0,0,0,0.28)]"
      : "bg-paper/80 text-ink border border-grayline backdrop-blur hover:bg-paper";

  const inner = (
    <span
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={cn(
        "magnet inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-base font-medium shadow-[0_8px_30px_rgba(0,0,0,0.22)]",
        base,
        className,
      )}
    >
      {children}
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block">
        {inner}
      </Link>
    );
  }
  return (
    <button onClick={onClick} className="inline-block">
      {inner}
    </button>
  );
}
