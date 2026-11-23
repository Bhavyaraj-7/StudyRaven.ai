import type { Config } from "tailwindcss";

// Every colour is a CSS variable holding an RGB triplet (app/globals.css),
// so opacity modifiers work (bg-ink/40) and `.dark` on <html> flips them.
const rgb = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const AREAS = ["study", "compete", "profile", "essays", "pitch", "streak", "parents"] as const;
const areaPalettes = Object.fromEntries(
  AREAS.map((a) => [
    a,
    { deep: rgb(`area-${a}-deep`), bright: rgb(`area-${a}-bright`), tint: rgb(`area-${a}-tint`) },
  ]),
);

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: rgb("ink"),
        paper: rgb("paper"),
        "paper-2": rgb("paper-2"),
        graylite: rgb("graylite"),
        grayline: rgb("grayline"),
        graytext: rgb("graytext"),
        graymute: rgb("graymute"),
        "control-line": rgb("control-line"),
        accent: rgb("accent"),
        "on-accent": rgb("on-accent"),
        examiner: rgb("examiner"),
        "examiner-stroke": rgb("examiner-stroke"),
        danger: rgb("danger"),
        gold: rgb("gold"),
        "on-area": rgb("on-area"),
        inverse: rgb("inverse"),
        "on-inverse": rgb("on-inverse"),
        // Current area (set by data-area on a layout): text-area-deep, bg-area-tint…
        area: { deep: rgb("area-deep"), bright: rgb("area-bright"), tint: rgb("area-tint") },
        // Named palettes for places that show several areas at once.
        ...areaPalettes,
      },
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "-apple-system",
          "BlinkMacSystemFont",
          "Noto Sans Devanagari", // system fallback for Hindi names, never loaded
          "Nirmala UI",
          "sans-serif",
        ],
        display: ["var(--font-display)", "var(--font-inter)", "sans-serif"],
        mono: ["JetBrains Mono", "Courier New", "monospace"],
      },
      // Major-third scale (§5.3): 12 · 13 · 14 · 16 · 18 · 20 · 25 · 31 · 39 · 49 · 61.
      // Tailwind's xs/sm/base/lg/xl already cover 12/14/16/18/20.
      fontSize: {
        caption: ["13px", { lineHeight: "1.45" }],
        title: ["25px", { lineHeight: "1.2", letterSpacing: "-0.015em" }],
        h3: ["31px", { lineHeight: "1.15", letterSpacing: "-0.02em" }],
        h2: ["39px", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        h1: ["49px", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        hero: ["61px", { lineHeight: "1.02", letterSpacing: "-0.025em" }],
        body: ["16px", { lineHeight: "1.55" }],
      },
      borderRadius: {
        pill: "var(--radius-pill)",
        object: "var(--radius-object)",
        input: "var(--radius-input)",
        paper: "var(--radius-paper)",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        float: "var(--shadow-float)",
      },
      transitionDuration: {
        micro: "var(--dur-micro)",
        small: "var(--dur-small)",
        medium: "var(--dur-medium)",
        large: "var(--dur-large)",
        stamp: "var(--dur-stamp)",
      },
      transitionTimingFunction: {
        out: "var(--ease-out)",
        in: "var(--ease-in)",
        spring: "var(--ease-spring)",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        shimmer: "shimmer 2.5s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
