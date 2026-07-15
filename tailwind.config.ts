import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Channel-format CSS vars so Tailwind opacity modifiers (bg-ink/40)
        // keep working, and a single [data-theme] swap flips the whole app.
        ink: "rgb(var(--ink) / <alpha-value>)",
        paper: "rgb(var(--paper) / <alpha-value>)",
        graylite: "rgb(var(--graylite) / <alpha-value>)",
        grayline: "rgb(var(--grayline) / <alpha-value>)",
        graytext: "rgb(var(--graytext) / <alpha-value>)",
        graymute: "rgb(var(--graymute) / <alpha-value>)",
        // Restrained accents — used sparingly for emphasis, never as fills.
        accent: "rgb(var(--accent) / <alpha-value>)",
        gold: "rgb(var(--gold) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["JetBrains Mono", "Courier New", "monospace"],
      },
      fontSize: {
        hero: ["80px", { lineHeight: "1.05", fontWeight: "600" }],
        h1: ["56px", { lineHeight: "1.1", fontWeight: "600" }],
        h2: ["40px", { lineHeight: "1.15", fontWeight: "600" }],
        body: ["17px", { lineHeight: "1.6", fontWeight: "400" }],
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
