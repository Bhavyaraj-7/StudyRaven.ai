"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Wand2,
  TimerReset,
  BarChart3,
  Menu,
  X,
  BookOpen,
  FileText,
  ScrollText,
  Layers,
  Timer,
  Compass,
  CalendarDays,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const PRIMARY = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/studio", label: "Studio", icon: Wand2 },
  { href: "/mocks", label: "Mocks", icon: TimerReset },
  { href: "/stats", label: "Stats", icon: BarChart3 },
];

const MORE = [
  { href: "/subjects", label: "Subjects", icon: BookOpen },
  { href: "/papers", label: "Past papers", icon: FileText },
  { href: "/marks", label: "Mark schemes", icon: ScrollText },
  { href: "/flashcards", label: "Flashcards", icon: Layers },
  { href: "/focus", label: "Focus", icon: Timer },
  { href: "/college", label: "College guide", icon: Compass },
  { href: "/schedule", label: "Schedule", icon: CalendarDays },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function BottomNav() {
  const path = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  // Close the sheet whenever navigation happens.
  useEffect(() => {
    setMoreOpen(false);
  }, [path]);

  const isActive = (href: string) => path === href || path.startsWith(href + "/");
  const moreActive = MORE.some((m) => isActive(m.href));

  return (
    <>
      {/* More sheet */}
      {moreOpen && (
        <div
          className="fixed inset-0 z-40 bg-ink/40 md:hidden"
          onClick={() => setMoreOpen(false)}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="More pages"
            className="absolute bottom-16 left-0 right-0 mx-3 mb-2 rounded-2xl border border-grayline bg-paper p-2 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid grid-cols-2 gap-1">
              {MORE.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition min-h-[44px]",
                    isActive(href)
                      ? "bg-ink text-paper"
                      : "text-graytext active:bg-graylite",
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom tab bar — mobile only */}
      <nav
        aria-label="Primary"
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-grayline bg-paper pb-[env(safe-area-inset-bottom)]"
      >
        <div className="grid grid-cols-5">
          {PRIMARY.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={isActive(href) ? "page" : undefined}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-2 min-h-[56px] text-[10px] transition",
                isActive(href) ? "text-ink font-semibold" : "text-graymute",
              )}
            >
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          ))}
          <button
            type="button"
            onClick={() => setMoreOpen((o) => !o)}
            aria-expanded={moreOpen}
            aria-haspopup="dialog"
            className={cn(
              "flex flex-col items-center justify-center gap-1 py-2 min-h-[56px] text-[10px] transition",
              moreActive || moreOpen ? "text-ink font-semibold" : "text-graymute",
            )}
          >
            {moreOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            More
          </button>
        </div>
      </nav>
    </>
  );
}
