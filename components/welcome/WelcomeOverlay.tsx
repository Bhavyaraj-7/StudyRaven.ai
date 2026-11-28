"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Button from "@/components/ui/Button";
import Stroke from "@/components/ui/Stroke";
import { firstName, type WelcomeProps } from "./shared";

const WelcomePlayer = dynamic(() => import("./WelcomePlayer"), { ssr: false, loading: () => null });

export type WelcomeMode = "film" | "still";

/**
 * Plays the welcome film in a dialog. It never blocks: Skip, Esc, a tap on
 * the film or a tap outside all close it at once. "still" (reduced motion,
 * Save-Data, celebrations off) shows the same message as a calm card and
 * never downloads Remotion.
 */
export default function WelcomeOverlay({
  name,
  subjects,
  mode,
  onClose,
}: WelcomeProps & { mode: WelcomeMode; onClose: () => void }) {
  const [ended, setEnded] = useState(mode === "still");
  const first = firstName(name);

  const close = useCallback(() => onClose(), [onClose]);
  const onEnded = useCallback(() => setEnded(true), []);

  useEffect(() => {
    const before = document.activeElement as HTMLElement | null;
    const panel = document.getElementById("welcome-panel");
    panel?.querySelector<HTMLButtonElement>("button")?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      before?.focus?.();
    };
  }, [close]);

  return (
    <div className="fade-in fixed inset-0 z-[70] flex items-center justify-center bg-ink/50 p-4" onClick={close} role="presentation">
      <div
        id="welcome-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-title"
        aria-describedby="welcome-desc"
        className="rise-in w-full max-w-[520px] overflow-hidden rounded-object border border-grayline bg-paper shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="welcome-title" className="sr-only">
          {first ? `Welcome to StudyRaven, ${first}` : "Welcome to StudyRaven"}
        </h2>
        <p id="welcome-desc" className="sr-only">
          A short welcome: an answer is marked tick by tick against the mark scheme, then your subjects appear. Take your
          first mock when you are ready.
        </p>

        {mode === "film" ? (
          <div className="aspect-square w-full cursor-pointer" onClick={close} aria-hidden>
            <WelcomePlayer name={name} subjects={subjects} onEnded={onEnded} />
          </div>
        ) : (
          <div className="px-6 py-10 sm:px-10">
            <span className="text-accent">
              <Stroke variant="tick" width={36} />
            </span>
            <p className="mt-5 font-display text-h2 font-semibold">{first ? `Welcome, ${first}.` : "Welcome."}</p>
            <p className="mt-3 text-graytext">Every answer is marked against the mark scheme, tick by tick.</p>
            {subjects.length > 0 && (
              <ul className="mt-6 flex flex-wrap gap-2" aria-label="Your subjects">
                {subjects.slice(0, 6).map((s) => (
                  <li key={s} className="rounded-pill border border-accent/35 bg-study-tint px-4 py-1.5 text-sm font-semibold">
                    {s}
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-6 font-medium">Take your first mock when you&apos;re ready.</p>
          </div>
        )}

        <div className="flex items-center justify-between gap-4 border-t border-grayline px-5 py-4">
          <span className="text-sm text-graymute">{ended ? "You're all set." : "Nine seconds. Tap to skip."}</span>
          <Button onClick={close} variant={ended ? "primary" : "secondary"}>
            {ended ? "Let's begin" : "Skip"}
          </Button>
        </div>
      </div>
    </div>
  );
}
