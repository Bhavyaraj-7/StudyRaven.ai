"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export default function StickyNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 100);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "py-2.5 backdrop-blur-md bg-paper/75 border-b border-grayline/60"
          : "py-3.5 bg-transparent",
      )}
    >
      <div
        className={cn(
          "mx-auto px-6 flex items-center justify-between transition-all duration-300",
          scrolled ? "max-w-5xl" : "max-w-7xl",
        )}
      >
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-[19px] tracking-tight"
        >
          <span className="w-[26px] h-[26px] rounded-[7px] bg-ink text-paper inline-flex items-center justify-center font-mono text-[14px]">
            S
          </span>
          StudyRaven<span className="text-graymute">.ai</span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-[14.5px] text-graytext">
          <a href="#features" className="hover:text-ink transition">
            Features
          </a>
          <a href="#how" className="hover:text-ink transition">
            How it works
          </a>
          <a href="#college" className="hover:text-ink transition">
            College guide
          </a>
          <a href="#pricing" className="hover:text-ink transition">
            Pricing
          </a>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden sm:inline-block text-[14.5px] font-medium text-ink px-3 py-2"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center gap-1.5 bg-ink text-paper rounded-[11px] px-4 py-2.5 text-[14px] font-medium shadow-[0_1px_2px_rgba(0,0,0,0.18)] hover:shadow-[0_6px_18px_rgba(0,0,0,0.18)] hover:-translate-y-px transition"
          >
            Start your journey <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
