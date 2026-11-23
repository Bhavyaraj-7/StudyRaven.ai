// Theme: "system" (default) follows the device; "light"/"dark" are the
// student's explicit choice, saved in localStorage. The class on <html> is
// set before first paint by THEME_SCRIPT (app/layout.tsx) and updated here.

export type Theme = "light" | "dark" | "system";

const KEY = "sr-theme";

/** Inline <head> script: runs before paint so there's no light flash. */
export const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem("${KEY}");var d=t==="dark"||(t!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d)}catch(e){}})();`;

export function getStoredTheme(): Theme {
  try {
    const t = window.localStorage.getItem(KEY);
    return t === "light" || t === "dark" ? t : "system";
  } catch {
    return "system";
  }
}

function prefersDark(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function applyTheme(theme: Theme): void {
  const dark = theme === "dark" || (theme === "system" && prefersDark());
  document.documentElement.classList.toggle("dark", dark);
}

export function setStoredTheme(theme: Theme): void {
  try {
    if (theme === "system") window.localStorage.removeItem(KEY);
    else window.localStorage.setItem(KEY, theme);
  } catch {
    // Private mode or blocked storage: still apply for this page view.
  }
  applyTheme(theme);
}
