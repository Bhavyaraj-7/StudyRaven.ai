// Theme preference lives in localStorage and is applied only inside the app
// shell (AppLayout), so the public landing page always renders light.

export type Theme = "light" | "dark";

const KEY = "sr-theme";
export const THEME_EVENT = "sr-theme-change";

export function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return window.localStorage.getItem(KEY) === "dark" ? "dark" : "light";
}

export function setStoredTheme(theme: Theme): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, theme);
  window.dispatchEvent(new CustomEvent<Theme>(THEME_EVENT, { detail: theme }));
}
