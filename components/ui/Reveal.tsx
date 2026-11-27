"use client";

import { useEffect, useRef } from "react";

/**
 * M17: content pops in once (12px rise + fade, spring) when 30% of it
 * scrolls into view. Anything already on screen, or under reduced motion,
 * is never hidden, and without JavaScript everything simply shows.
 */
export default function Reveal({
  children,
  className,
  delayMs = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;
    el.dataset.reveal = "pending";
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.dataset.reveal = "shown";
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={className} style={delayMs ? { transitionDelay: `${delayMs}ms` } : undefined}>
      {children}
    </div>
  );
}
