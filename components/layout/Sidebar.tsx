"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/subjects", label: "Subjects", icon: BookOpen },
  { href: "/studio", label: "Studio", icon: Wand2 },
  { href: "/papers", label: "Past papers", icon: FileText },
  { href: "/marks", label: "Mark schemes", icon: ScrollText },
  { href: "/mocks", label: "Mock tests", icon: TimerReset },
  { href: "/flashcards", label: "Flashcards", icon: Layers },
  { href: "/focus", label: "Focus", icon: Timer },
  { href: "/stats", label: "Stats", icon: BarChart3 },
  { href: "/college", label: "College guide", icon: Compass },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const path = usePathname();
  // Tracks the link the user just clicked so we can show it as active
  // immediately, even before Next.js finishes compiling the destination page.
  // Cleared when the URL actually changes.
  const [pending, setPending] = useState<string | null>(null);

  useEffect(() => {
    setPending(null);
  }, [path]);

  return (
    <aside className="hidden md:flex flex-col w-[240px] shrink-0 border-r border-grayline bg-paper h-screen sticky top-0">
      <Link
        href="/dashboard"
        className="px-6 py-6 font-mono font-bold text-xl tracking-tight"
      >
        StudyRaven<span className="text-graymute">.ai</span>
      </Link>
      <nav className="flex-1 px-3">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = path === href || path.startsWith(href + "/");
          const isPending = pending === href && !active;
          return (
            <Link
              key={href}
              href={href}
              prefetch
              onClick={() => setPending(href)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 mb-1 rounded-lg text-sm transition",
                active
                  ? "bg-ink text-paper"
                  : isPending
                    ? "bg-graylite text-ink"
                    : "text-graytext hover:bg-graylite hover:text-ink",
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4",
                  isPending && "animate-pulse",
                )}
              />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="px-3 pb-6 text-xs text-graymute px-6">
        v0.1 · made for IGCSE
      </div>
    </aside>
  );
}
