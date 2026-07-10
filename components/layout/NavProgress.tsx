"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Top-of-page progress bar during route transitions. Shows immediately on any
 * <a> or <Link> click (so navigation never feels dead), holds during compile,
 * completes when the URL actually changes.
 *
 * Two signals cooperate:
 *   - "loading" flips on when the user clicks any internal link.
 *   - It flips off when either pathname or search params change (real nav).
 */
export default function NavProgress() {
  const pathname = usePathname();
  const params = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Any click on an internal link starts the bar.
  useEffect(() => {
    function onDocumentClick(e: MouseEvent) {
      // Ignore modified clicks — user wants to open in new tab, not navigate.
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      const target = (e.target as HTMLElement | null)?.closest?.("a");
      if (!target) return;
      const href = target.getAttribute("href");
      if (!href) return;
      // Only intercept in-app navigation. External links, hashes, and mailto/tel
      // don't trigger a Next.js transition and shouldn't spin the bar forever.
      if (
        href.startsWith("http") ||
        href.startsWith("//") ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        target.getAttribute("target") === "_blank" ||
        target.hasAttribute("download")
      ) {
        return;
      }
      setLoading(true);
      setProgress(20);
    }
    document.addEventListener("click", onDocumentClick, { capture: true });
    return () =>
      document.removeEventListener("click", onDocumentClick, { capture: true });
  }, []);

  // While loading, walk the bar forward slowly toward 90% but never reach 100.
  useEffect(() => {
    if (!loading) return;
    const id = setInterval(() => {
      setProgress((p) => (p < 90 ? p + Math.max(0.5, (95 - p) / 15) : p));
    }, 120);
    return () => clearInterval(id);
  }, [loading]);

  // The URL changed → navigation actually landed. Complete the bar, then hide.
  useEffect(() => {
    if (!loading) return;
    setProgress(100);
    const t = setTimeout(() => {
      setLoading(false);
      setProgress(0);
    }, 220);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, params]);

  return (
    <div
      aria-hidden
      className="fixed top-0 left-0 right-0 h-[3px] z-[100] pointer-events-none"
      style={{
        opacity: loading ? 1 : 0,
        transition: "opacity 200ms",
      }}
    >
      <div
        className="h-full bg-ink"
        style={{
          width: `${progress}%`,
          transition: "width 200ms ease-out",
          boxShadow: "0 0 8px rgba(10,10,10,0.4)",
        }}
      />
    </div>
  );
}
