"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface SegmentOption {
  value: string;
  label: string;
}

/**
 * M2: subject/board/filter switcher. One indicator slides to the choice.
 * A radio group: arrow keys move the selection.
 */
export default function Segmented({
  options,
  value,
  onChange,
  label,
}: {
  options: SegmentOption[];
  value: string;
  onChange: (value: string) => void;
  label: string;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const [box, setBox] = useState<{ x: number; w: number } | null>(null);
  const index = Math.max(0, options.findIndex((o) => o.value === value));

  useLayoutEffect(() => {
    const el = refs.current[index];
    if (el) setBox({ x: el.offsetLeft, w: el.offsetWidth });
  }, [index, options]);

  function onKey(e: React.KeyboardEvent) {
    const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = (index + step + options.length) % options.length;
    onChange(options[next].value);
    refs.current[next]?.focus();
  }

  return (
    <div
      role="radiogroup"
      aria-label={label}
      onKeyDown={onKey}
      className="relative inline-flex max-w-full gap-1 overflow-x-auto rounded-pill bg-paper-2 p-1"
    >
      {box && (
        <span
          aria-hidden
          className="absolute bottom-1 left-0 top-1 rounded-pill bg-area-bright shadow-card transition-[transform,width] duration-small ease-out"
          style={{ transform: `translateX(${box.x}px)`, width: box.w }}
        />
      )}
      {options.map((o, i) => {
        const selected = i === index;
        return (
          <button
            key={o.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(o.value)}
            className={cn(
              "press relative z-10 min-h-[44px] whitespace-nowrap rounded-pill px-4 text-sm font-medium transition-colors duration-small",
              selected ? "text-on-area" : "text-graytext hover:text-ink",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
