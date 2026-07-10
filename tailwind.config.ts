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
        ink: "#0A0A0A",
        paper: "#FFFFFF",
        graylite: "#F4F4F5",
        grayline: "#E5E5E5",
        graytext: "#4A4A4A",
        graymute: "#8A8A8A",
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
