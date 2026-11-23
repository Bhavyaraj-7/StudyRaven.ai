// Shared by the copy and style lints. Existing violations are recorded in
// scripts/guardrails/baseline.json per file and rule. A file may never go
// above its baseline (new problems fail CI), and fixing one lowers it.
import { readFileSync, writeFileSync, existsSync } from "node:fs";

export interface Finding {
  file: string;
  line: number;
  rule: string;
  text: string;
}

const BASELINE = "scripts/guardrails/baseline.json";
type Baseline = Record<string, Record<string, number>>; // tool -> "file::rule" -> count

function load(): Baseline {
  return existsSync(BASELINE) ? JSON.parse(readFileSync(BASELINE, "utf8")) : {};
}

export function report(tool: string, findings: Finding[]): never {
  const counts: Record<string, number> = {};
  for (const f of findings) counts[`${f.file}::${f.rule}`] = (counts[`${f.file}::${f.rule}`] ?? 0) + 1;

  if (process.argv.includes("--update-baseline")) {
    const all = load();
    all[tool] = Object.fromEntries(Object.entries(counts).sort());
    writeFileSync(BASELINE, JSON.stringify(all, null, 2) + "\n");
    console.log(`${tool}: baseline written (${findings.length} existing findings).`);
    process.exit(0);
  }

  const allowed = load()[tool] ?? {};
  const over = Object.keys(counts).filter((k) => counts[k] > (allowed[k] ?? 0));
  if (over.length === 0) {
    const shrinkable = Object.keys(allowed).filter((k) => (counts[k] ?? 0) < allowed[k]);
    console.log(`${tool}: OK (${findings.length} legacy findings tracked in the baseline).`);
    if (shrinkable.length) console.log(`  ${shrinkable.length} baseline entries can be lowered: run with --update-baseline.`);
    process.exit(0);
  }

  console.error(`${tool}: ${over.length} file/rule pair(s) have new problems:\n`);
  for (const key of over) {
    const [file, rule] = key.split("::");
    for (const f of findings.filter((x) => x.file === file && x.rule === rule)) {
      console.error(`  ${f.file}:${f.line}  [${f.rule}]  ${f.text}`);
    }
  }
  console.error(`\nFix them (see master prompt §5.7). Only if a finding is a false positive, run with --update-baseline and explain why in the PR.`);
  process.exit(1);
}

export function lineOf(source: string, index: number): number {
  return source.slice(0, index).split("\n").length;
}
