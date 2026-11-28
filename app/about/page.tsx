import type { Metadata } from "next";
import Link from "next/link";
import StickyNav from "@/components/landing/StickyNav";
import SiteFooter from "@/components/site/SiteFooter";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import { FEATURE_GROUPS, PRINCIPLES, type Access } from "@/content/features";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "About — StudyRaven",
  description:
    "What StudyRaven is, who it's for, and a short guide to every feature: marked mocks, mark schemes, the AI tutor, Studio, flashcards, plans and the college guide.",
};

const slug = (s: string) => s.toLowerCase().replace(/[^a-z]+/g, "-");

function AccessTag({ access }: { access: Access }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-pill px-2.5 py-0.5 text-xs font-semibold",
        access === "Pro" ? "bg-accent text-on-accent" : "border border-control-line text-graytext",
      )}
    >
      {access}
    </span>
  );
}

export default function AboutPage() {
  const total = FEATURE_GROUPS.reduce((n, g) => n + g.features.length, 0);
  return (
    <main className="bg-paper text-ink">
      <StickyNav />

      <section className="page-in mx-auto max-w-[1200px] px-5 pb-16 pt-32 md:pb-24 md:pt-40">
        <p className="text-sm font-semibold text-accent">About StudyRaven</p>
        <h1 className="mt-4 max-w-[18ch] font-display text-h1 font-semibold">A study app that marks like an examiner.</h1>
        <p className="mt-6 max-w-[60ch] text-lg text-graytext">
          StudyRaven helps IGCSE and IB students practise, get their answers marked against the mark scheme, and see
          exactly where the marks went. It&apos;s made by IGCSE students, for the exams we sit too.
        </p>
        <nav aria-label="Feature groups" className="mt-10 flex flex-wrap gap-2">
          {FEATURE_GROUPS.map((g) => (
            <a
              key={g.title}
              href={`#${slug(g.title)}`}
              className="press rounded-pill border border-grayline px-4 py-2 text-sm font-medium text-graytext transition-colors hover:border-ink hover:text-ink"
            >
              {g.title}
            </a>
          ))}
        </nav>
      </section>

      <section aria-labelledby="features-title" className="border-t border-grayline">
        <div className="mx-auto max-w-[1200px] px-5 py-16 md:py-24">
          <h2 id="features-title" className="font-display text-h2 font-semibold">
            Every feature, briefly
          </h2>
          <p className="mt-3 text-graytext">{total} tools. Most are free; the tag on each says how you get it.</p>

          {FEATURE_GROUPS.map((g) => (
            <div
              key={g.title}
              id={slug(g.title)}
              className="mt-14 grid scroll-mt-24 gap-6 border-t border-grayline pt-10 md:grid-cols-12 md:gap-10"
            >
              <div className="md:col-span-4">
                <h3 className="text-title font-semibold">{g.title}</h3>
                <p className="mt-2 max-w-[36ch] text-graytext">{g.intro}</p>
              </div>
              <ul className="md:col-span-8">
                {g.features.map((f, i) => (
                  <li key={f.name} className={cn("border-grayline py-5", i > 0 && "border-t")}>
                    <Reveal delayMs={Math.min(i, 4) * 60}>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                        <Link href={f.href} className="text-lg font-semibold underline-offset-4 hover:underline">
                          {f.name}
                        </Link>
                        <AccessTag access={f.access} />
                      </div>
                      <p className="mt-2 max-w-[64ch] text-graytext">{f.brief}</p>
                    </Reveal>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="principles-title" className="bg-paper-2">
        <div className="mx-auto max-w-[1200px] px-5 py-16 md:py-24">
          <h2 id="principles-title" className="font-display text-h2 font-semibold">
            What we promise
          </h2>
          <div className="mt-10 grid gap-px overflow-hidden rounded-object border border-grayline bg-grayline sm:grid-cols-2">
            {PRINCIPLES.map((p, i) => (
              <div key={p.title} className="bg-paper p-6 md:p-8">
                <Reveal delayMs={i * 60}>
                  <h3 className="text-lg font-semibold">{p.title}</h3>
                  <p className="mt-2 text-graytext">{p.body}</p>
                </Reveal>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-5 py-16 md:py-24">
        <div className="grid gap-8 md:grid-cols-2 md:items-end">
          <div>
            <h2 className="font-display text-h2 font-semibold">Questions or ideas?</h2>
            <p className="mt-3 max-w-[48ch] text-graytext">
              Tell us what&apos;s confusing, broken or missing. Email{" "}
              <a href={`mailto:${SITE.contactEmail}`} className="font-medium text-ink underline underline-offset-4">
                {SITE.contactEmail}
              </a>
              .
            </p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <Button href="/signup" size="lg">
              Start free
            </Button>
            <Button href="/contact" variant="secondary" size="lg">
              Contact us
            </Button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
