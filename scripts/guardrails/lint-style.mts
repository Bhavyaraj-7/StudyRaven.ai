// Style lint (master prompt §5.7 D, §5.2, §5.4). Fails on:
// - hard-coded hex colours in components (use tokens),
// - any gradient or gradient text (founder rule: none at all),
// - arbitrary Tailwind spacing/radius values off the 4px scale,
// - more than one icon library,
// - off-palette: any colour but white, black and blue (founder rule).
// Run: node --experimental-strip-types scripts/guardrails/lint-style.mts
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { report, lineOf, type Finding } from "./ratchet.mts";

// Files where the rule can't apply (no CSS variables or brand rules).
const HEX_ALLOWED = [
  "app/opengraph-image.tsx", // next/og renders without our CSS variables
  "components/auth/GoogleButton.tsx", // Google's logo colours are required as-is
  "app/layout.tsx", // <meta name="theme-color"> needs literal colours
];
// Brand assets that must keep their own colours.
const PALETTE_EXEMPT = ["components/auth/GoogleButton.tsx"]; // Google's logo colours
// Founder rule (28 Nov 2026): no gradients anywhere, no exceptions.
const GRADIENT_ALLOWED: string[] = [];

const SPACING_PX = new Set([0, 1, 2, 4, 8, 12, 16, 24, 32, 48, 64, 96]);
const RADIUS_PX = new Set([2, 10, 16, 999]);
const ICON_LIBS = ["lucide-react", "react-icons", "@heroicons/react", "@tabler/icons-react", "@phosphor-icons/react", "react-feather", "@radix-ui/react-icons"];

function walk(dir: string, files: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, files);
    else files.push(p);
  }
  return files;
}

const findings: Finding[] = [];
const iconLibs = new Map<string, string>(); // lib -> first file

const files = ["app", "components"].flatMap((d) => walk(d)).filter((f) => /\.(tsx?|css)$/.test(f));

for (const file of files) {
  const src = readFileSync(file, "utf8");
  const push = (index: number, rule: string, text: string) =>
    findings.push({ file, line: lineOf(src, index), rule, text });

  if (file.endsWith(".tsx") && !HEX_ALLOWED.includes(file)) {
    for (const m of src.matchAll(/#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b(?![\w-])/g)) {
      push(m.index!, "hex-colour", `${m[0]} (use a token from app/globals.css)`);
    }
  }

  if (!GRADIENT_ALLOWED.includes(file)) {
    for (const m of src.matchAll(/\bbg-gradient-to-\w+|\bbg-clip-text\b|\b(linear|radial|conic)-gradient\(/g)) {
      push(m.index!, "gradient", `${m[0]} (no gradients: use solid colours)`);
    }
  }

  // Founder rule (27 Nov 2026): white, black and blue only.
  if (!PALETTE_EXEMPT.includes(file)) {
    for (const m of src.matchAll(/(?<![\w-])[a-z:-]*-(red|orange|amber|yellow|lime|green|emerald|teal|cyan|violet|purple|fuchsia|pink|rose|indigo)-\d{2,3}\b/g)) {
      push(m.index!, "off-palette", `${m[0]} (white, black and blue only)`);
    }
    for (const m of src.matchAll(/#[0-9a-fA-F]{6}\b/g)) {
      const [r, g, b] = [1, 3, 5].map((i) => parseInt(m[0].slice(i, i + 2), 16) / 255);
      const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min, l = (max + min) / 2;
      if (d === 0 || l < 0.08 || l > 0.97 || d / (1 - Math.abs(2 * l - 1)) <= 0.15) continue; // neutral
      const h = ((max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4) * 60 + 360) % 360;
      if (h < 195 || h > 235) push(m.index!, "off-palette", `${m[0]} is not blue (hue ${Math.round(h)}°)`);
    }
  }

  if (file.endsWith(".tsx")) {
    const spacing = /(?<![\w-])-?(p[xytrblse]?|m[xytrblse]?|gap(?:-[xy])?|space-[xy]|inset(?:-[xy])?|top|right|bottom|left)-\[(-?\d*\.?\d+)px\]/g;
    for (const m of src.matchAll(spacing)) {
      if (!SPACING_PX.has(Math.abs(Number(m[2])))) push(m.index!, "off-scale-spacing", `${m[0]} (scale: 4, 8, 12, 16, 24, 32, 48, 64, 96)`);
    }
    for (const m of src.matchAll(/(?<![\w-])rounded(?:-[trblse]{1,2})?-\[(\d+)px\]/g)) {
      if (!RADIUS_PX.has(Number(m[1]))) push(m.index!, "off-scale-radius", `${m[0]} (use rounded-pill/object/input/paper)`);
    }
    for (const m of src.matchAll(/from\s+["']([^"']+)["']/g)) {
      const lib = ICON_LIBS.find((l) => m[1] === l || m[1].startsWith(`${l}/`));
      if (lib && !iconLibs.has(lib)) iconLibs.set(lib, file);
    }
  }
}

if (iconLibs.size > 1) {
  for (const [lib, file] of iconLibs) {
    findings.push({ file, line: 1, rule: "icon-libraries", text: `${lib} (only one icon set: ${[...iconLibs.keys()].join(", ")})` });
  }
}

report("style", findings);
