// Copy lint (master prompt §5.7 D). Fails on "AI-ish" copy in UI strings:
// banned words, sparkles, emoji, ALL-CAPS words, and more than one em dash
// in a sentence. Reads JSX text, prose-like string literals, email
// templates, content/*.json and content/**/*.md.
// Run: node --experimental-strip-types scripts/guardrails/lint-copy.mts
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import ts from "typescript";
import { report, lineOf, type Finding } from "./ratchet.mts";

const ROOTS = ["app", "components", "lib", "content", "supabase/functions"];
const SKIP = [/\/dev\//, /^lib\/ai\//, /\.test\./];

// §5.7 table A, plus "AI-powered". Whole words, case-insensitive.
const BANNED = [
  "unlock your potential", "supercharge", "supercharged", "seamless", "seamlessly", "elevate", "empower",
  "empowering", "revolutionize", "revolutionise", "revolutionary", "cutting-edge", "game-changer",
  "game changer", "effortless", "effortlessly", "harness", "leverage", "delve", "in today's fast-paced world",
  "engineered for", "ai-powered", "powered by ai",
];
const BANNED_RE = new RegExp(`\\b(${BANNED.map((w) => w.replace(/[-']/g, "[-' ]?")).join("|")})\\b`, "i");

// Real acronyms may stay in capitals.
const ACRONYMS = new Set(
  "IGCSE IB DP MYP SAT ACT IELTS TOEFL PSAT IOQM RMO INMO IMOTC IMO AMC UKMT HBCSE NSEJS NSEP NSEC NSEB NSEA SOF USACO ISEF IRIS UCAS CIE GPA PDF CSV PPTX IST UTC DPDP OTP INR USD API FAQ URL HTML JSON STEM NGO CEO MIT USA UAE WCAG SMTP SPF DKIM DMARC OAUTH UPI HTTPS".split(" "),
);
const EMOJI = /\p{Extended_Pictographic}/u;
const NOT_EMOJI = /[©®™]/g;

// In server code (API routes, lib, edge functions) most strings are AI
// prompts or identifiers. Only these properties reach a student.
const SERVER_DIRS = /^(app\/api|lib|supabase\/functions)\//;
const USER_FACING_PROPS = new Set(["error", "message", "subject", "title", "body", "html", "label", "description"]);

/** Tailwind class lists, identifiers, URLs and paths aren't prose. */
function isProse(s: string): boolean {
  const t = s.trim();
  if (t.length < 3 || !/[a-zA-Z]{2}/.test(t)) return false;
  if (/^(https?:|mailto:|\/|#|@\/|\.\/)/.test(t)) return false;
  const tokens = t.split(/\s+/);
  const classy = tokens.filter((x) => /^[!-]?[a-z0-9]+([:/\[\].#%()-][a-z0-9_/\[\].#%(),-]*)+$/.test(x)).length;
  if (classy > 0 && classy >= tokens.length / 2) return false;
  if (tokens.length === 1 && !/^[A-Z][a-z]/.test(t)) return false; // keys, ids, POST, INPUT
  return true;
}

function check(file: string, source: string, index: number, raw: string, out: Finding[]) {
  const text = raw
    .replace(/<[^>]+>/g, " ") // HTML in emails
    .replace(/\{\{\w+\}\}/g, " ") // {{TOKENS}} filled in at render time
    .replace(/\s+/g, " ")
    .trim();
  if (!isProse(text)) return;
  const line = lineOf(source, index);
  const short = text.length > 90 ? text.slice(0, 87) + "…" : text;
  const banned = text.match(BANNED_RE);
  if (banned) out.push({ file, line, rule: "banned-word", text: `"${banned[0]}" in: ${short}` });
  if (text.includes("✨")) out.push({ file, line, rule: "sparkles", text: short });
  else if (EMOJI.test(text.replace(NOT_EMOJI, ""))) out.push({ file, line, rule: "emoji", text: short });
  for (const word of text.match(/\b[A-Z][A-Z0-9]{3,}\b/g) ?? []) {
    if (!ACRONYMS.has(word) && !/\d/.test(word)) {
      out.push({ file, line, rule: "all-caps", text: `${word} in: ${short}` });
      break;
    }
  }
  // Line breaks end a "sentence" too (lists, multi-line placeholders).
  for (const sentence of raw.replace(/<[^>]+>/g, " ").split(/\n|(?<=[.!?])\s+/)) {
    if ((sentence.match(/—/g) ?? []).length > 1) {
      out.push({ file, line, rule: "em-dashes", text: sentence.slice(0, 90) });
      break;
    }
  }
}

function userFacingInServer(node: ts.Node): boolean {
  let n: ts.Node = node;
  while (n.parent && (ts.isParenthesizedExpression(n.parent) || ts.isBinaryExpression(n.parent) || ts.isConditionalExpression(n.parent))) {
    n = n.parent;
  }
  const p = n.parent;
  return !!p && ts.isPropertyAssignment(p) && USER_FACING_PROPS.has(p.name.getText());
}

function lintTs(file: string, source: string, out: Finding[]) {
  const serverOnly = SERVER_DIRS.test(file);
  const sf = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, file.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const visit = (node: ts.Node) => {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) return;
    // Model prompts are instructions to the AI, not copy students read.
    if (ts.isVariableDeclaration(node) && /^(SYSTEM|.*_PROMPT|SOURCE_RULE)$/.test(node.name.getText(sf))) return;
    const isText = ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node) || ts.isTemplateExpression(node);
    if (serverOnly && isText && !userFacingInServer(node)) return;
    if (ts.isJsxText(node)) check(file, source, node.getStart(sf), node.getText(sf), out);
    else if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) check(file, source, node.getStart(sf), node.text, out);
    else if (ts.isTemplateExpression(node)) {
      check(file, source, node.getStart(sf), [node.head.text, ...node.templateSpans.map((s) => s.literal.text)].join(" "), out);
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
}

function walk(dir: string, files: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, files);
    else files.push(p);
  }
  return files;
}

const findings: Finding[] = [];
for (const root of ROOTS) {
  let files: string[] = [];
  try {
    files = walk(root);
  } catch {
    continue;
  }
  for (const file of files) {
    if (SKIP.some((r) => r.test(file))) continue;
    const source = readFileSync(file, "utf8");
    if (/\.(tsx?|mts)$/.test(file)) lintTs(file, source, findings);
    else if (file.endsWith(".json") || file.endsWith(".md")) {
      // Markdown/JSON: lint each line of text (skip HTML comments).
      source.replace(/<!--[\s\S]*?-->/g, (m) => " ".repeat(m.length)).split("\n").forEach((l, i, all) => {
        const idx = all.slice(0, i).join("\n").length + (i ? 1 : 0);
        check(file, source, idx, l.replace(/^[#>*|\-\s]+/, ""), findings);
      });
    }
  }
}
report("copy", findings);
