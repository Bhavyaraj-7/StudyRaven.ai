import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SITE, TRADEMARK_NOTE } from "@/lib/site";

export type LegalSlug = "privacy" | "terms" | "refunds";

const MISSING = "**[to be confirmed]**";

/** Reads content/legal/<slug>.md at build time and fills site facts. */
function loadLegal(slug: LegalSlug): string {
  const raw = fs.readFileSync(
    path.join(process.cwd(), "content", "legal", `${slug}.md`),
    "utf8",
  );
  const tokens: Record<string, string> = {
    SITE_URL: SITE.url.replace(/^https?:\/\//, ""),
    CONTACT_EMAIL: `[${SITE.contactEmail}](mailto:${SITE.contactEmail})`,
    OPERATOR: SITE.operator ?? MISSING,
    OPERATOR_CITY: SITE.operatorCity ?? MISSING,
  };
  return raw
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\{\{(\w+)\}\}/g, (m, key: string) => tokens[key] ?? m);
}

/** Server-rendered legal page: no client JavaScript. */
export default function LegalPage({ slug }: { slug: LegalSlug }) {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <header className="border-b border-grayline">
        <div className="max-w-[720px] mx-auto px-5 h-16 flex items-center">
          <Link href="/" className="font-semibold text-[18px] tracking-tight">
            StudyRaven<span className="text-graymute">.ai</span>
          </Link>
        </div>
      </header>
      <article className="page-in legal prose max-w-[720px] mx-auto px-5 py-10 text-[16px] leading-relaxed text-graytext">
        <Markdown remarkPlugins={[remarkGfm]}>{loadLegal(slug)}</Markdown>
      </article>
      <footer className="border-t border-grayline">
        <div className="max-w-[720px] mx-auto px-5 py-8 text-[13px] text-graytext space-y-3">
          <nav aria-label="Legal" className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/privacy" className="underline">Privacy</Link>
            <Link href="/terms" className="underline">Terms</Link>
            <Link href="/refunds" className="underline">Refunds</Link>
            <Link href="/contact" className="underline">Contact</Link>
            <Link href="/about" className="underline">About</Link>
          </nav>
          <p>
            Support:{" "}
            <a href={`mailto:${SITE.contactEmail}`} className="underline">
              {SITE.contactEmail}
            </a>
          </p>
          <p>{TRADEMARK_NOTE}</p>
        </div>
      </footer>
    </main>
  );
}
