"use client";

import { useEffect, useRef } from "react";

/**
 * M17: content pops in once (12px rise + fade, spring) when 30% of it
 * scrolls into view. Anything already on screen, or under reduced motion,
 * is never hidden, and without JavaScript everything simply shows.
 *
 * One shared IntersectionObserver for every <Reveal> on the page, and no
 * getBoundingClientRect: reading layout in each instance forced the browser
 * to re-layout once per section during start-up (layout thrashing).
 */
let observer: IntersectionObserver | null = null;
const seen = new WeakSet<Element>();

function getObserver(): IntersectionObserver {
  if (observer) return observer;
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const el = entry.target as HTMLElement;
        if (!seen.has(el)) {
          // First report: on screen now? Leave it alone. Off screen? Hide it
          // (invisible change) until it scrolls in.
          seen.add(el);
          if (entry.isIntersecting) {
            observer?.unobserve(el);
            continue;
          }
          el.dataset.reveal = "pending";
          continue;
        }
        if (entry.isIntersecting && entry.intersectionRatio >= 0.3) {
          el.dataset.reveal = "shown";
          observer?.unobserve(el);
        }
      }
    },
    { threshold: [0, 0.3] },
  );
  return observer;
}

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
    const io = getObserver();
    io.observe(el);
    return () => io.unobserve(el);
  }, []);

  return (
    <div ref={ref} className={className} style={delayMs ? { transitionDelay: `${delayMs}ms` } : undefined}>
      {children}
    </div>
  );
}
