"use client";

import { useEffect, useState } from "react";

/**
 * M21: a real score counts up quickly (≤ 600 ms) as the marks land. The
 * only count-up allowed, because it's the student's own result. Screen
 * readers get the final value once; reduced motion shows it at once.
 */
export default function CountUp({ value, durationMs = 600, delayMs = 0 }: { value: number; durationMs?: number; delayMs?: number }) {
  const [shown, setShown] = useState(0);
  const decimals = Number.isInteger(value) ? 0 : 1;

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(value);
      return;
    }
    let raf = 0;
    let start = 0;
    const step = (t: number) => {
      start ||= t;
      const p = Math.min(1, (t - start) / durationMs);
      setShown(value * (1 - (1 - p) ** 3));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    const timer = setTimeout(() => (raf = requestAnimationFrame(step)), delayMs);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [value, durationMs, delayMs]);

  return (
    <>
      <span aria-hidden>{shown.toFixed(decimals)}</span>
      <span className="sr-only">{value.toFixed(decimals)}</span>
    </>
  );
}
