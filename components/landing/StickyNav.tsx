"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import SpectrumRibbon from "@/components/ui/SpectrumRibbon";

const LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how" },
  { label: "College guide", href: "#college" },
  { label: "Pricing", href: "#pricing" },
];

export default function StickyNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const firstLink = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 100);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Mobile sheet: focus the first link on open, close on Escape and return
  // focus to the menu button.
  useEffect(() => {
    if (!open) return;
    firstLink.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function close() {
    setOpen(false);
    menuButton.current?.focus();
  }

  return (
    <>
      <nav
        aria-label="Main"
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "py-2.5 backdrop-blur-md bg-paper/75 border-b border-grayline/60"
            : "py-3.5 bg-transparent",
        )}
      >
        <div className="absolute inset-x-0 top-0">
          <SpectrumRibbon className="h-1" />
        </div>
        <div
          className={cn(
            "mx-auto px-4 sm:px-6 flex items-center justify-between gap-3 transition-all duration-300",
            scrolled ? "max-w-5xl" : "max-w-7xl",
          )}
        >
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold text-[19px] tracking-tight whitespace-nowrap min-w-0"
          >
            <span className="w-[26px] h-[26px] shrink-0 rounded-[7px] bg-ink text-paper inline-flex items-center justify-center font-mono text-[14px]">
              S
            </span>
            <span>
              StudyRaven
              <span className="hidden min-[400px]:inline text-graymute">.ai</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-[14.5px] text-graytext">
            {LINKS.map((l) => (
              <a key={l.href} href={l.href} className="hover:text-ink transition">
                {l.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <Link
              href="/login"
              className="hidden md:inline-block text-[14.5px] font-medium text-ink px-3 py-2"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center min-h-[44px] whitespace-nowrap bg-accent text-on-accent rounded-pill px-4 text-[14px] font-semibold shadow-card hover:bg-accent/90 press"
            >
              Start free
            </Link>
            <button
              ref={menuButton}
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => (open ? close() : setOpen(true))}
              className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-full text-ink hover:bg-graylite transition"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile bottom sheet — CSS transitions only, no animation library. */}
      <div
        aria-hidden
        onClick={close}
        className={cn(
          "md:hidden fixed inset-0 z-[60] bg-ink/40 transition-opacity duration-200",
          open ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
      />
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className={cn(
          "md:hidden fixed inset-x-0 bottom-0 z-[70] rounded-t-2xl bg-paper border-t border-grayline px-4 pt-3 pb-8 transition-transform duration-300 ease-[cubic-bezier(.16,1,.3,1)]",
          open ? "translate-y-0 visible" : "translate-y-full invisible",
        )}
      >
        <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-grayline" aria-hidden />
        <ul className="flex flex-col">
          {LINKS.map((l, i) => (
            <li key={l.href}>
              <a
                ref={i === 0 ? firstLink : undefined}
                href={l.href}
                onClick={() => setOpen(false)}
                className="flex items-center min-h-[48px] px-2 text-[17px] text-ink border-b border-grayline"
              >
                {l.label}
              </a>
            </li>
          ))}
          <li>
            <Link
              href="/login"
              className="flex items-center min-h-[48px] px-2 text-[17px] font-medium text-ink"
            >
              Log in
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
}
