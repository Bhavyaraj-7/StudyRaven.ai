"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Maximize2, Minimize2 } from "lucide-react";

interface Slide {
  title: string;
  bullets: string[];
}

// Soft pastel palette that reads well on white and rotates so each slide
// gets a distinct tint. Ink text stays black for readability.
const PALETTE = [
  { bg: "#FEF3E7", accent: "#B45309", stripe: "#F59E0B" }, // amber
  { bg: "#EDF7F1", accent: "#047857", stripe: "#10B981" }, // emerald
  { bg: "#F0EFFA", accent: "#4338CA", stripe: "#6366F1" }, // indigo
  { bg: "#FCEEF1", accent: "#BE185D", stripe: "#EC4899" }, // rose
  { bg: "#E9F5FA", accent: "#0369A1", stripe: "#0EA5E9" }, // sky
  { bg: "#F5F0EA", accent: "#78350F", stripe: "#A16207" }, // ochre
];

export default function SlideDeck({ slides }: { slides: Slide[] }) {
  const [i, setI] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  // Keyboard nav — arrows to move, F to toggle fullscreen, Esc to exit.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Ignore when the user is typing in an input somewhere else on the page.
      const target = e.target as HTMLElement;
      if (target && ["INPUT", "TEXTAREA"].includes(target.tagName)) return;
      if (e.key === "ArrowRight") setI((x) => Math.min(slides.length - 1, x + 1));
      else if (e.key === "ArrowLeft") setI((x) => Math.max(0, x - 1));
      else if (e.key === "Home") setI(0);
      else if (e.key === "End") setI(slides.length - 1);
      else if (e.key === "f" || e.key === "F") setFullscreen((f) => !f);
      else if (e.key === "Escape") setFullscreen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [slides.length]);

  if (!slides?.length) return null;
  const s = slides[i];
  const colors = PALETTE[i % PALETTE.length];
  const progress = ((i + 1) / slides.length) * 100;

  const cardClass = fullscreen
    ? "fixed inset-0 z-50 flex flex-col rounded-none"
    : "relative rounded-2xl border border-grayline overflow-hidden";

  return (
    <div className={fullscreen ? "" : "select-none"}>
      <div
        className={cardClass}
        style={{
          background: colors.bg,
          minHeight: fullscreen ? undefined : 400,
        }}
      >
        {/* Coloured stripe down the left side. */}
        <div
          className="absolute top-0 left-0 bottom-0 w-1.5"
          style={{ background: colors.stripe }}
        />
        {/* Top bar: slide count + fullscreen toggle. */}
        <div className="flex items-center justify-between px-10 pt-6">
          <div
            className="text-xs font-mono tracking-wider uppercase"
            style={{ color: colors.accent }}
          >
            Slide {i + 1} of {slides.length}
          </div>
          <button
            onClick={() => setFullscreen((f) => !f)}
            className="text-graymute hover:text-ink"
            aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {fullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>

        <div
          className={`flex-1 px-10 pb-10 ${
            fullscreen ? "flex flex-col justify-center" : "pt-4"
          }`}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <h3
                className={`font-semibold leading-tight ${
                  fullscreen ? "text-5xl" : "text-3xl"
                }`}
              >
                {s.title}
              </h3>
              <ul
                className={`mt-6 space-y-3 ${
                  fullscreen ? "text-2xl" : "text-lg"
                }`}
              >
                {s.bullets.map((b, j) => (
                  <li key={j} className="flex gap-3">
                    <span
                      className="mt-2 h-2 w-2 rounded-full shrink-0"
                      style={{ background: colors.accent }}
                    />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress bar hugs the bottom edge. */}
        <div className="h-1 bg-black/5">
          <div
            className="h-full transition-all"
            style={{ width: `${progress}%`, background: colors.stripe }}
          />
        </div>
      </div>

      {/* Controls: prev / dots / next. */}
      <div className="flex items-center justify-between mt-4 gap-3">
        <button
          onClick={() => setI((x) => Math.max(0, x - 1))}
          disabled={i === 0}
          className="px-3 py-2 rounded-lg border border-grayline hover:bg-graylite disabled:opacity-40 inline-flex items-center gap-1 text-sm"
        >
          <ChevronLeft className="w-4 h-4" /> Prev
        </button>

        <div className="flex items-center gap-1.5 flex-wrap justify-center">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setI(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-2 rounded-full transition-all ${
                idx === i ? "w-6 bg-ink" : "w-2 bg-grayline hover:bg-graymute"
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => setI((x) => Math.min(slides.length - 1, x + 1))}
          disabled={i === slides.length - 1}
          className="px-3 py-2 rounded-lg border border-grayline hover:bg-graylite disabled:opacity-40 inline-flex items-center gap-1 text-sm"
        >
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div className="mt-2 text-xs text-graymute text-center">
        Use ← → to navigate, F for fullscreen
      </div>
    </div>
  );
}
