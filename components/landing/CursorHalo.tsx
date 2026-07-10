"use client";

import { useEffect, useState } from "react";

export default function CursorHalo() {
  const [pos, setPos] = useState({ x: -200, y: -200 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const isCoarse =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(pointer: coarse)").matches;
    if (isCoarse) return;

    function move(e: MouseEvent) {
      setPos({ x: e.clientX, y: e.clientY });
      setVisible(true);
    }
    function leave() {
      setVisible(false);
    }
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseleave", leave);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseleave", leave);
    };
  }, []);

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        left: pos.x,
        top: pos.y,
        width: 280,
        height: 280,
        transform: "translate(-50%, -50%)",
        borderRadius: "50%",
        pointerEvents: "none",
        zIndex: 60,
        background:
          "radial-gradient(circle, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 35%, transparent 70%)",
        mixBlendMode: "overlay",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.3s ease",
      }}
    />
  );
}
