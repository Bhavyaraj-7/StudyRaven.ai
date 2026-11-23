"use client";

import { useEffect, useState } from "react";

const COLUMNS = Array.from({ length: 12 }, (_, i) => i);

/**
 * Review aid (master prompt §5.7 B4): add ?grid=1 to any URL to see the
 * column grid (4 / 8 / 12 columns, 20px mobile margins, 1200px max) and the
 * 4px baseline. Renders nothing otherwise.
 */
export default function GridOverlay() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    setOn(new URLSearchParams(window.location.search).get("grid") === "1");
  }, []);
  if (!on) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[9999]">
      <div className="mx-auto grid h-full max-w-[1200px] grid-cols-4 gap-4 px-5 md:grid-cols-8 lg:grid-cols-12 lg:gap-6">
        {COLUMNS.map((i) => (
          <div
            key={i}
            className={`bg-examiner/10 ${i >= 4 ? "hidden md:block" : ""} ${i >= 8 ? "md:hidden lg:block" : ""}`}
          />
        ))}
      </div>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, rgb(var(--accent) / 0.12) 0 1px, transparent 1px 4px)",
        }}
      />
    </div>
  );
}
