import Link from "next/link";
import {
  CalendarClock,
  Check,
  ClipboardCheck,
  GraduationCap,
  Layers,
  ListChecks,
  Lock,
  ShieldCheck,
  Target,
  Timer,
  Users,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import StickyNav from "@/components/landing/StickyNav";
import HeroPaper from "@/components/landing/HeroPaper";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import { TRADEMARK_NOTE } from "@/lib/site";

// Premium, minimal, trustworthy: mostly white and black, blue only for
// actions, the examiner's pen and small accents. Hairlines, not tinted boxes.

export default function Landing() {
  return (
    <main className="overflow-x-hidden bg-paper text-ink">
      <StickyNav />

      {/* ---------- Hero ---------- */}
      <header className="border-b border-grayline">
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-12 px-5 pb-14 pt-28 md:pb-28 md:pt-40 lg:grid-cols-12 lg:gap-16">
          <div className="min-w-0 lg:col-span-6">
            <p className="inline-flex items-center gap-2 rounded-pill border border-grayline px-3 py-1 text-sm text-graytext">
              <span aria-hidden className="h-1.5 w-1.5 rounded-pill bg-accent" />
              For IGCSE and IB, Grades 8–12
            </p>
            <h1 className="mt-6 text-[40px] font-semibold leading-[1.04] sm:text-h1 lg:text-hero">
              Study plans and marked mock tests for IGCSE and IB.
            </h1>
            <p className="mt-6 max-w-[50ch] text-lg leading-relaxed text-graytext">
              Get a 7-day plan built around your exam dates, take AI-marked mocks, and see exactly where you dropped
              marks and which topics to fix.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button href="/signup" size="lg">
                Start free
              </Button>
              <Button href="/login" size="lg" variant="secondary">
                Log in
              </Button>
            </div>
            <p className="mt-4 text-sm text-graymute">Free plan · No card needed</p>
          </div>
          <div className="min-w-0 lg:col-span-6">
            <div className="rounded-object bg-study-tint p-4 sm:p-8">
              <HeroPaper />
            </div>
          </div>
        </div>
      </header>

      {/* ---------- Trust: only things that are true today ---------- */}
      <section aria-label="Why you can trust StudyRaven" className="border-b border-grayline">
        <ul className="mx-auto grid max-w-[1200px] grid-cols-1 gap-x-8 gap-y-4 px-5 py-6 sm:grid-cols-2 md:py-8 lg:grid-cols-4">
          {TRUST.map((t) => (
            <li key={t.title} className="flex items-start gap-3">
              <t.icon className="mt-0.5 h-5 w-5 shrink-0 text-accent" strokeWidth={1.75} aria-hidden />
              <div>
                <div className="text-sm font-semibold">{t.title}</div>
                <div className="text-sm text-graytext">{t.body}</div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------- What it does ---------- */}
      <section id="features" className="mx-auto max-w-[1200px] px-5 py-16 md:py-32">
        <Reveal className="max-w-[640px]">
          <h2 className="text-h3 font-semibold md:text-h2">What StudyRaven does</h2>
          <p className="mt-4 text-lg text-graytext">Four tools that work together, from your first plan to the day of the exam.</p>
        </Reveal>
        <div className="mt-10 grid grid-cols-1 border-t border-grayline sm:grid-cols-2 md:mt-14">
          {FEATURES.map((f, i) => (
            <Reveal
              key={f.title}
              delayMs={i * 80}
              className={`border-b border-grayline py-8 sm:py-10 ${i % 2 === 0 ? "sm:border-r sm:pr-10" : "sm:pl-10"}`}
            >
              <div className="flex items-center justify-between">
                <f.icon className="h-6 w-6 text-accent" strokeWidth={1.5} aria-hidden />
                {f.pro && (
                  <span className="rounded-pill border border-control-line px-2 py-0.5 text-xs font-medium text-graytext">
                    Pro
                  </span>
                )}
              </div>
              <h3 className="mt-6 text-title font-semibold">{f.title}</h3>
              <p className="mt-2 max-w-[46ch] text-graytext">{f.desc}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- How it works ---------- */}
      <section id="how" className="bg-inverse px-5 py-24 text-on-inverse md:py-32">
        <div className="mx-auto max-w-[1200px]">
          <Reveal>
            <h2 className="text-h3 font-semibold md:text-h2">How it works</h2>
          </Reveal>
          <ol className="mt-10 grid grid-cols-1 border-t border-on-inverse/15 md:mt-14 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li
                key={s.title}
                className={`border-b border-on-inverse/15 py-8 md:border-b-0 md:py-10 ${i > 0 ? "md:border-l md:pl-10" : ""} ${i < 2 ? "md:pr-10" : ""}`}
              >
                <Reveal delayMs={i * 100}>
                  <span className="grid h-11 w-11 place-items-center rounded-pill border border-on-inverse/25">
                    <s.icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                  </span>
                  <h3 className="mt-6 text-lg font-semibold">{s.title}</h3>
                  <p className="mt-2 text-on-inverse/70">{s.body}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- College guide ---------- */}
      <section id="college" className="mx-auto grid max-w-[1200px] grid-cols-1 items-start gap-10 px-5 lg:gap-16 py-16 md:py-32 lg:grid-cols-2">
        <Reveal>
          <span className="rounded-pill border border-control-line px-2 py-0.5 text-xs font-medium text-graytext">Pro</span>
          <h2 className="mt-5 text-h3 font-semibold md:text-h2">A college guide that starts in Grade 9</h2>
          <p className="mt-5 max-w-[50ch] text-lg text-graytext">
            Pro includes a college guide built around your profile: a readiness score, a step-by-step roadmap,
            scholarships, an application tracker and feedback on your essay drafts.
          </p>
          <div className="mt-10">
            <Button href="/signup" variant="secondary">
              See the college guide
            </Button>
          </div>
        </Reveal>
        <Reveal delayMs={120}>
          <ul className="border-t border-grayline">
            {COLLEGE_TABS.map((t) => (
              <li key={t.label} className="flex gap-4 border-b border-grayline py-5">
                <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-pill bg-accent" />
                <div>
                  <div className="font-semibold">{t.label}</div>
                  <div className="mt-1 text-graytext">{t.title}</div>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      {/* ---------- Pricing ---------- */}
      <section id="pricing" className="border-t border-grayline px-5 py-16 md:py-32">
        <div className="mx-auto max-w-[960px]">
          <Reveal className="text-center">
            <h2 className="text-h3 font-semibold md:text-h2">Start free. Upgrade when you need more.</h2>
            <p className="mt-4 text-lg text-graytext">No credit card to start. Cancel Pro anytime.</p>
          </Reveal>
          <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Reveal className="h-full">
              <PriceCard
                name="Free"
                price="₹0"
                sub="forever, for students"
                features={["AI study planner", "AI-marked mock tests", "Mark scheme guides for your subjects", "5 AI generations a day", "Deadline and exam tracker"]}
                cta="Start free"
              />
            </Reveal>
            <Reveal delayMs={100} className="h-full">
              <PriceCard
                name="Pro"
                price="₹299"
                sub="per month · or ₹2,499 a year (save 30%)"
                features={["Everything in Free", "Unlimited AI generations", "AI tutor", "College guide"]}
                cta="Go Pro"
                featured
              />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------- Final call ---------- */}
      <section className="border-t border-grayline px-5 py-16 md:py-32">
        <Reveal className="mx-auto max-w-[760px] text-center">
          <h2 className="text-h3 font-semibold md:text-h1">
            See exactly where your{" "}
            <span className="relative inline-block">
              marks
              <span aria-hidden className="absolute -bottom-2 left-0 right-0 text-accent">
                <svg viewBox="0 0 100 12" className="h-3 w-full" preserveAspectRatio="none" fill="none">
                  <path
                    d="M2 8 C30 3 70 3 98 6"
                    pathLength={100}
                    stroke="currentColor"
                    strokeWidth={3}
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                    className="draw-on-reveal"
                  />
                </svg>
              </span>
            </span>{" "}
            go.
          </h2>
          <p className="mt-6 text-lg text-graytext">Free to start. Add your subjects and take your first mock today.</p>
          <div className="mt-10 flex justify-center">
            <Button href="/signup" size="lg">
              Start free
            </Button>
          </div>
        </Reveal>
      </section>

      {/* ---------- Built by students ---------- */}
      <section id="about" className="border-t border-grayline px-5 py-16 md:py-32">
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-5">
            <h2 className="text-h3 font-semibold md:text-h2">Built by four 14-year-olds who lived the pain.</h2>
            <p className="mt-5 text-lg text-graytext">
              We&apos;re IGCSE students ourselves, buried in past papers, missed deadlines, and mark schemes that never
              actually explained anything. Nothing out there was built for students like us, so we built it.
            </p>
          </Reveal>
          <ul className="grid grid-cols-1 gap-x-10 border-t border-grayline sm:grid-cols-2 lg:col-span-7">
            {TEAM.map((m, i) => (
              <li key={m.name} className="border-b border-grayline py-4 md:py-6">
                <Reveal delayMs={i * 80} className="flex items-center gap-4">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-pill bg-ink font-semibold text-paper">
                    {m.initials}
                  </span>
                  <div>
                    <div className="font-semibold">{m.name}</div>
                    <div className="text-sm text-graytext">{m.role}</div>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- Footer ---------- */}
      <footer className="bg-inverse px-5 py-12 text-on-inverse md:py-16">
        <div className="mx-auto grid max-w-[1200px] grid-cols-2 gap-10 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
              <span className="grid h-7 w-7 place-items-center rounded-input bg-on-inverse font-mono text-sm text-inverse">S</span>
              StudyRaven<span className="text-on-inverse/70">.ai</span>
            </Link>
            <p className="mt-4 max-w-[28ch] text-sm text-on-inverse/70">Study plans and marked mocks for IGCSE and IB.</p>
          </div>
          <FooterCol title="Product" items={[{ label: "Features", href: "#features" }, { label: "Pricing", href: "#pricing" }, { label: "College guide", href: "#college" }]} />
          <FooterCol title="Account" items={[{ label: "Log in", href: "/login" }, { label: "Start free", href: "/signup" }]} />
          <FooterCol title="Legal" items={[{ label: "Privacy", href: "/privacy" }, { label: "Terms", href: "/terms" }, { label: "Refunds", href: "/refunds" }, { label: "Contact", href: "/contact" }]} />
        </div>
        <div className="mx-auto mt-12 max-w-[1200px] space-y-3 border-t border-on-inverse/10 pt-6 text-sm text-on-inverse/70">
          <p className="max-w-[760px] leading-relaxed">{TRADEMARK_NOTE}</p>
          <p>Built by students, for students. © 2026 StudyRaven.ai</p>
        </div>
      </footer>
    </main>
  );
}

// ---- Data ----

const TRUST: { icon: LucideIcon; title: string; body: string }[] = [
  { icon: Lock, title: "Your work stays private", body: "Other students can never see your answers." },
  { icon: XCircle, title: "No ads, no trackers", body: "We never sell your data." },
  { icon: ShieldCheck, title: "Cancel Pro anytime", body: "It stays on until the period you paid for." },
  { icon: Users, title: "Made by IGCSE students", body: "Built for the exams we sit too." },
];

const FEATURES: { icon: LucideIcon; title: string; desc: string; pro?: boolean }[] = [
  {
    icon: Timer,
    title: "Mock tests, AI-marked",
    desc: "Take timed mocks on AI-written practice papers. Each paper comes with its own mark scheme, and you get a score and topic-by-topic feedback.",
  },
  {
    icon: Layers,
    title: "StudyRaven Studio",
    desc: "Turn any topic or PDF into a summary, study guide, slide deck, flashcards, mind map or quiz.",
  },
  {
    icon: CalendarClock,
    title: "Deadline tracker",
    desc: "Keep every deadline and exam date in one place, with a countdown to your next exam.",
  },
  {
    icon: GraduationCap,
    title: "College guide",
    desc: "A readiness score, roadmap, scholarships, application tracker and essay feedback, from Grade 9.",
    pro: true,
  },
];

const STEPS: { icon: LucideIcon; title: string; body: string }[] = [
  { icon: ListChecks, title: "Tell StudyRaven about you", body: "Add your curriculum, subjects, exam dates and target grades." },
  { icon: Target, title: "Get your study plan", body: "A 7-day plan with three tasks a day, weighted towards your nearest exams." },
  { icon: ClipboardCheck, title: "Practise and track", body: "Take mocks, see where you dropped marks, and keep every deadline in one place." },
];

const COLLEGE_TABS: { label: string; title: string }[] = [
  { label: "Readiness", title: "Where your profile stands today, and the gaps to close" },
  { label: "Roadmap", title: "A step-by-step plan from your grade to applications" },
  { label: "Scholarships", title: "A curated list, plus live search matched to your interests" },
  { label: "Essays", title: "Feedback on your drafts. Every word stays yours." },
];

const TEAM: { name: string; role: string; initials: string }[] = [
  { name: "Bhavyaraj Singh", role: "CEO", initials: "BS" },
  { name: "Viraj Gupta", role: "Marketing", initials: "VG" },
  { name: "Avyaan Dhoka", role: "Technology", initials: "AD" },
  { name: "Prabhat Khatri", role: "Finance", initials: "PK" },
];

// ---- Pieces ----

function PriceCard({
  name,
  price,
  sub,
  features,
  cta,
  featured = false,
}: {
  name: string;
  price: string;
  sub: string;
  features: string[];
  cta: string;
  featured?: boolean;
}) {
  return (
    <div
      className={`relative h-full rounded-object p-8 md:p-10 ${
        featured ? "bg-inverse text-on-inverse" : "bg-paper ring-1 ring-grayline"
      }`}
    >
      <div className="text-lg font-semibold">{name}</div>
      <div className="mt-3 font-display text-h2 font-semibold tabular-nums">{price}</div>
      <div className={`mt-1 text-sm ${featured ? "text-on-inverse/70" : "text-graymute"}`}>{sub}</div>
      <ul className="my-8 space-y-3">
        {features.map((f) => (
          <li key={f} className={`flex gap-3 text-[15px] ${featured ? "text-on-inverse/85" : "text-graytext"}`}>
            <Check className={`mt-0.5 h-4 w-4 shrink-0 ${featured ? "text-on-inverse" : "text-accent"}`} aria-hidden />
            {f}
          </li>
        ))}
      </ul>
      <Button href="/signup" variant={featured ? "primary" : "secondary"} className="w-full">
        {cta}
      </Button>
    </div>
  );
}

function FooterCol({ title, items }: { title: string; items: { label: string; href: string }[] }) {
  return (
    <div>
      <div className="mb-4 text-sm font-medium text-on-inverse">{title}</div>
      <ul className="space-y-2.5 text-sm">
        {items.map((it) => (
          <li key={it.label}>
            <a href={it.href} className="text-on-inverse/80 transition hover:text-on-inverse">
              {it.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
