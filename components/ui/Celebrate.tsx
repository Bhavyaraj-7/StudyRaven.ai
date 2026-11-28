"use client";

import { useEffect, useRef, useState } from "react";

const COLOURS = ["--accent", "--area-study-bright", "--area-profile-bright", "--area-compete-bright", "--ink"];
const PIECES = 70;
const LIFE_MS = 900;

/**
 * M22: a short burst of paper confetti for big milestones only (first mock,
 * streak milestones…). Canvas, no library, ≤ 70 pieces, under a second,
 * blues and ink. Skipped under reduced motion or Settings › Celebrations off.
 */
export default function Celebrate({ fire }: { fire: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!fire) return;
    let off = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    try {
      off ||= window.localStorage.getItem("sr-celebrations") === "off";
    } catch {
      // storage blocked: celebrate anyway
    }
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (off || !canvas || !ctx) {
      setDone(true);
      return;
    }

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    const css = getComputedStyle(document.documentElement);
    const colours = COLOURS.map((v) => `rgb(${css.getPropertyValue(v).trim().split(/\s+/).join(",")})`);
    const parts = Array.from({ length: PIECES }, (_, i) => ({
      x: w / 2 + (Math.random() - 0.5) * 160,
      y: h * 0.38,
      vx: (Math.random() - 0.5) * 10,
      vy: -4 - Math.random() * 9,
      r: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.35,
      pw: 6 + Math.random() * 6,
      ph: 3 + Math.random() * 4,
      c: colours[i % colours.length],
    }));

    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const age = t - start;
      ctx.clearRect(0, 0, w, h);
      ctx.globalAlpha = Math.max(0, 1 - age / LIFE_MS);
      for (const p of parts) {
        p.vy += 0.38;
        p.x += p.vx;
        p.y += p.vy;
        p.r += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.r);
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.pw / 2, -p.ph / 2, p.pw, p.ph);
        ctx.restore();
      }
      if (age < LIFE_MS) raf = requestAnimationFrame(tick);
      else setDone(true);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [fire]);

  if (!fire || done) return null;
  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-[80] h-full w-full" />;
}
