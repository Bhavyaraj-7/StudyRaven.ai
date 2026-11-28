import Link from "next/link";
import { SITE, TRADEMARK_NOTE } from "@/lib/site";

const COLUMNS: { title: string; items: { label: string; href: string }[] }[] = [
  {
    title: "Product",
    items: [
      { label: "Features", href: "/#features" },
      { label: "Pricing", href: "/#pricing" },
      { label: "College guide", href: "/#college" },
    ],
  },
  {
    title: "Company",
    items: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Log in", href: "/login" },
    ],
  },
  {
    title: "Legal",
    items: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Refunds", href: "/refunds" },
    ],
  },
];

/** The public footer: landing, About and Contact. Server-rendered. */
export default function SiteFooter() {
  return (
    <footer className="bg-inverse px-5 py-12 text-on-inverse md:py-16">
      <div className="mx-auto grid max-w-[1200px] grid-cols-2 gap-10 md:grid-cols-4">
        <div className="col-span-2 md:col-span-1">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
            <span className="grid h-7 w-7 place-items-center rounded-input bg-on-inverse font-mono text-sm text-inverse">S</span>
            <span>
              StudyRaven<span className="text-on-inverse/70">.ai</span>
            </span>
          </Link>
          <p className="mt-4 max-w-[28ch] text-sm text-on-inverse/70">Study plans and marked mocks for IGCSE and IB.</p>
          <p className="mt-6 text-sm text-on-inverse/70">Support</p>
          <a href={`mailto:${SITE.contactEmail}`} className="mt-1 inline-block break-all text-sm font-medium underline-offset-4 hover:underline">
            {SITE.contactEmail}
          </a>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <div className="mb-4 text-sm font-medium">{col.title}</div>
            <ul className="space-y-2.5 text-sm">
              {col.items.map((it) => (
                <li key={it.label}>
                  <a href={it.href} className="text-on-inverse/80 transition-colors hover:text-on-inverse">
                    {it.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto mt-12 max-w-[1200px] space-y-3 border-t border-on-inverse/10 pt-6 text-sm text-on-inverse/70">
        <p className="max-w-[760px] leading-relaxed">{TRADEMARK_NOTE}</p>
        <p>Built by students, for students. © 2026 StudyRaven.ai</p>
      </div>
    </footer>
  );
}
