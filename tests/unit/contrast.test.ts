import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// Checks every colour pair from master prompt §5.2 against WCAG 2.2 AA,
// reading the real token values from app/globals.css in both themes.
const css = readFileSync("app/globals.css", "utf8");

type Palette = Record<string, [number, number, number]>;

function readBlock(selector: string): Palette {
  const start = css.indexOf(`${selector} {`);
  if (start < 0) throw new Error(`No ${selector} block in globals.css`);
  const body = css.slice(start, css.indexOf("\n  }", start));
  const out: Palette = {};
  for (const m of body.matchAll(/--([\w-]+):\s*(\d+)\s+(\d+)\s+(\d+);/g)) {
    out[m[1]] = [Number(m[2]), Number(m[3]), Number(m[4])];
  }
  return out;
}

const light = readBlock(":root");
const dark: Palette = { ...light, ...readBlock(".dark") };
const WHITE: [number, number, number] = [255, 255, 255];

function luminance([r, g, b]: [number, number, number]): number {
  const lin = (v: number) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

export function contrast(a: [number, number, number], b: [number, number, number]): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const TEXT = 4.5; // body text
const UI = 3; // non-text UI and large strokes
const AREAS = ["study", "compete", "profile", "essays", "pitch", "streak", "parents"];

const pairs: [fg: string, bg: string, min: number][] = [
  ["ink", "paper", TEXT],
  ["ink", "paper-2", TEXT],
  ["graytext", "paper", TEXT],
  ["graytext", "paper-2", TEXT],
  ["graymute", "paper", TEXT],
  ["graymute", "paper-2", TEXT],
  ["control-line", "paper", 3.5],
  ["control-line", "paper-2", 3.5],
  ["accent", "paper", TEXT],
  ["accent", "paper-2", TEXT],
  ["on-accent", "accent", TEXT],
  ["examiner", "paper", TEXT],
  ["examiner", "paper-2", TEXT],
  ["examiner-stroke", "paper", UI],
  ["danger", "paper", TEXT],
  ["danger", "paper-2", TEXT],
  ["gold", "paper", UI],
  ["on-inverse", "inverse", TEXT],
  ...AREAS.flatMap((a): [string, string, number][] => [
    [`area-${a}-deep`, "paper", TEXT],
    [`area-${a}-deep`, `area-${a}-tint`, TEXT],
    ["on-area", `area-${a}-bright`, TEXT],
  ]),
];

describe.each([
  ["light", light],
  ["dark", dark],
] as const)("%s theme", (_name, palette) => {
  it.each(pairs)("%s on %s ≥ %s:1", (fg, bg, min) => {
    expect(palette[fg], `missing --${fg}`).toBeDefined();
    expect(palette[bg], `missing --${bg}`).toBeDefined();
    expect(contrast(palette[fg], palette[bg])).toBeGreaterThanOrEqual(min);
  });
});

describe("light theme, white text on area deep fills", () => {
  it.each(AREAS)("%s", (a) => {
    expect(contrast(WHITE, light[`area-${a}-deep`])).toBeGreaterThanOrEqual(TEXT);
  });
});

// Founder rule (23 Nov 2026): no pink anywhere in the palette.
function hsl([r, g, b]: [number, number, number]) {
  const [R, G, B] = [r / 255, g / 255, b / 255];
  const max = Math.max(R, G, B);
  const min = Math.min(R, G, B);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return { h: 0, s: 0, l };
  const s = d / (1 - Math.abs(2 * l - 1));
  const h = max === R ? ((G - B) / d) % 6 : max === G ? (B - R) / d + 2 : (R - G) / d + 4;
  return { h: (h * 60 + 360) % 360, s, l };
}

describe.each([
  ["light", light],
  ["dark", dark],
] as const)("no pink tokens (%s)", (_name, palette) => {
  it.each(Object.keys(palette))("--%s", (name) => {
    const { h, s, l } = hsl(palette[name]);
    const pink = s > 0.25 && l > 0.15 && l < 0.97 && (h >= 290 || h < 2);
    expect(pink, `--${name} is pink (hue ${Math.round(h)}°)`).toBe(false);
  });
});
