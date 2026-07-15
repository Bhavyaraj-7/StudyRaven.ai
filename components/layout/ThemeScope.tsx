"use client";

import { useEffect, useState } from "react";
import { getStoredTheme, THEME_EVENT, type Theme } from "@/lib/theme";

/**
 * Applies the user's theme to the app shell via a data-theme attribute.
 * Scoped to AppLayout so the public landing page stays light regardless of
 * a logged-in user's preference.
 */
export default function ThemeScope({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    setTheme(getStoredTheme());
    const onChange = (e: Event) => setTheme((e as CustomEvent<Theme>).detail);
    window.addEventListener(THEME_EVENT, onChange);
    return () => window.removeEventListener(THEME_EVENT, onChange);
  }, []);

  return (
    <div data-theme={theme} className={className}>
      {children}
    </div>
  );
}
