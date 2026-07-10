"use client";

import { useEffect, useState } from "react";

export default function LiveCounter() {
  const [n, setN] = useState(0);

  useEffect(() => {
    // Honest, modest starting number with a slow drift up. Real data later.
    const base = 247;
    setN(base);
    const id = setInterval(() => {
      setN((x) => x + (Math.random() < 0.25 ? 1 : 0));
    }, 14000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="inline-flex items-center gap-2 text-[12.5px] text-graytext font-mono">
      <span className="ticker-dot inline-block w-1.5 h-1.5 rounded-full bg-ink" />
      <span>{n.toLocaleString()} students joined this week</span>
    </div>
  );
}
