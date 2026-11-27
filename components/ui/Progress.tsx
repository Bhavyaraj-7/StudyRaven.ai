"use client";

import { useEffect, useState } from "react";

/** M20: the bar fills from 0 to its value with a spring, in the area colour. */
export default function Progress({ value, label }: { value: number; label: string }) {
  const clamped = Math.max(0, Math.min(100, value));
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(clamped));
    return () => cancelAnimationFrame(id);
  }, [clamped]);

  return (
    <div>
      <div className="mb-1.5 flex justify-between text-sm">
        <span className="font-medium text-ink">{label}</span>
        <span className="tabular-nums text-graytext">{Math.round(clamped)}%</span>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(clamped)}
        className="h-2.5 overflow-hidden rounded-pill bg-area-tint"
      >
        <div
          className="h-full origin-left rounded-pill bg-area-bright transition-transform duration-large ease-spring"
          style={{ transform: `scaleX(${shown / 100})` }}
        />
      </div>
    </div>
  );
}
