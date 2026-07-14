"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Wand2,
  FileText,
  ScrollText,
  TimerReset,
  BarChart3,
  Compass,
  Settings,
  Layers,
  Timer,
  BookOpen,
  CalendarDays,
  Search,
  CornerDownLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/dashboard", label: "Home", hint: "dashboard overview", icon: LayoutDashboard },
  { href: "/subjects", label: "Subjects", hint: "manage subjects exams", icon: BookOpen },
  { href: "/studio", label: "Studio", hint: "generate summary flashcards slides mind map", icon: Wand2 },
  { href: "/papers", label: "Past papers", hint: "browse practice papers", icon: FileText },
  { href: "/marks", label: "Mark schemes", hint: "grading answers", icon: ScrollText },
  { href: "/mocks", label: "Mock tests", hint: "timed exam practice grade", icon: TimerReset },
  { href: "/flashcards", label: "Flashcards", hint: "review cards spaced repetition", icon: Layers },
  { href: "/focus", label: "Focus", hint: "pomodoro study timer", icon: Timer },
  { href: "/stats", label: "Stats", hint: "progress scores analytics streak", icon: BarChart3 },
  { href: "/college", label: "College guide", hint: "pro readiness roadmap essay scholarships", icon: Compass },
  { href: "/schedule", label: "Schedule", hint: "study plan reminders email", icon: CalendarDays },
  { href: "/settings", label: "Settings", hint: "profile subscription account", icon: Settings },
];

export default function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const filtered = query.trim()
    ? ITEMS.filter((i) =>
        `${i.label} ${i.hint}`.toLowerCase().includes(query.trim().toLowerCase()),
      )
    : ITEMS;

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActive(0);
  }, []);

  // Global Ctrl+K / Cmd+K listener.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  // Keep the active option scrolled into view.
  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);

  function go(href: string) {
    close();
    router.push(href);
  }

  function onInputKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && filtered[active]) {
      e.preventDefault();
      go(filtered[active].href);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-ink/40 flex items-start justify-center pt-[15vh] px-4"
      onClick={close}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="w-full max-w-lg rounded-2xl border border-grayline bg-paper shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 border-b border-grayline">
          <Search className="w-4 h-4 text-graymute shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onInputKey}
            placeholder="Jump to..."
            aria-label="Search pages"
            role="combobox"
            aria-expanded="true"
            aria-controls="command-palette-list"
            aria-activedescendant={
              filtered[active] ? `cp-item-${active}` : undefined
            }
            className="w-full py-3.5 text-sm bg-transparent focus:outline-none placeholder:text-graymute"
          />
          <kbd className="hidden sm:block text-[10px] text-graymute border border-grayline rounded px-1.5 py-0.5 shrink-0">
            ESC
          </kbd>
        </div>
        <ul
          id="command-palette-list"
          ref={listRef}
          role="listbox"
          aria-label="Pages"
          className="max-h-[320px] overflow-y-auto p-2"
        >
          {filtered.length === 0 && (
            <li className="px-3 py-6 text-center text-sm text-graymute">
              No matches for &ldquo;{query}&rdquo;
            </li>
          )}
          {filtered.map(({ href, label, icon: Icon }, i) => (
            <li key={href} role="presentation">
              <button
                id={`cp-item-${i}`}
                data-index={i}
                role="option"
                aria-selected={i === active}
                type="button"
                onClick={() => go(href)}
                onMouseEnter={() => setActive(i)}
                className={cn(
                  "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-left transition",
                  i === active ? "bg-ink text-paper" : "text-graytext",
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="flex-1">{label}</span>
                {i === active && (
                  <CornerDownLeft className="w-3.5 h-3.5 opacity-60" />
                )}
              </button>
            </li>
          ))}
        </ul>
        <div className="border-t border-grayline px-4 py-2 text-[10px] text-graymute flex gap-4">
          <span>↑↓ navigate</span>
          <span>↵ open</span>
          <span>esc close</span>
        </div>
      </div>
    </div>
  );
}
