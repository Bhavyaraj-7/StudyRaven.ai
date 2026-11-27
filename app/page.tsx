import Link from "next/link";
import {
  CalendarClock,
  Check,
  ClipboardCheck,
  GraduationCap,
  Layers,
  ListChecks,
  Target,
  Timer,
  type LucideIcon,
} from "lucide-react";
import StickyNav from "@/components/landing/StickyNav";
import HeroMesh from "@/components/landing/HeroMesh";
import HeroPaper from "@/components/landing/HeroPaper";
import Button from "@/components/ui/Button";
import Card, { type Area } from "@/components/ui/Card";
import Reveal from "@/components/ui/Reveal";
import { TRADEMARK_NOTE } from "@/lib/site";

export default function Landing() {
  return (
    <main className="overflow-x-hidden bg-paper text-ink">
      <StickyNav />

      {/* ---------- Hero: the paper that marks itself (§7.1) ---------- */}
      <header className="relative">
        <HeroMesh />
        <div className="relative mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-12 px-5 pb-16 pt-28 md:pb-24 md:pt-36 lg:grid-cols-12">
          <div className="min-w-0 lg:col-span-6">
            <p className="inline-flex items-center gap-2 rounded-pill bg-paper/80 px-3 py-1.5 text-sm font-medium text-graytext shadow-card">
              <span aria-hidden className="h-2 w-2 rounded-pill bg-profile-bright" />
              For IGCSE and IB, Grades 8–12
            </p>
            <h1 className="mt-5 text-[40px] font-semibold leading-[1.04] sm:text-h1 lg:text-hero">
              Study plans and marked mock tests for IGCSE and IB.
            </h1>
            <p className="mt-5 max-w-[52ch] text-lg text-graytext">
              Get a 7-day plan built around your exam dates, take AI-marked mocks, and see exactly where you dropped
              marks and which topics to fix.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
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
            <HeroPaper />
          </div>
        </div>
      </header>

      {/* ---------- What it does: one colour per area ---------- */}
      <section id="features" className="mx-auto max-w-[1200px] px-5 py-16 md:py-24">
        <Reveal>
          <h2 className="text-h3 font-semibold md:text-h2">What StudyRaven does</h2>
          <p className="mt-3 max-w-[56ch] text-lg text-graytext">
            Four tools that work together, from your first plan to the day of the exam.
          </p>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delayMs={i * 80}>
              <Card area={f.area} stripe={false} className="h-full">
                <div className="flex items-start justify-between gap-4">
                  <span className="grid h-12 w-12 place-items-center rounded-input bg-area-tint text-area-deep">
                    <f.icon className="h-6 w-6" strokeWidth={1.75} aria-hidden />
                  </span>
                  {f.pro && <span className="rounded-pill bg-gold px-2.5 py-0.5 text-xs font-semibold text-on-area">Pro</span>}
                </div>
                <h3 className="mt-5 text-title font-semibold">{f.title}</h3>
                <p className="mt-2 text-graytext">{f.desc}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- How it works ---------- */}
      <section id="how" className="bg-inverse px-5 py-16 text-on-inverse md:py-24">
        <div className="mx-auto max-w-[1200px]">
          <Reveal>
            <h2 className="text-h3 font-semibold md:text-h2">How it works</h2>
          </Reveal>
          <ol className="mt-10 grid gap-4 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title} data-area={s.area} className="h-full">
                <Reveal delayMs={i * 100} className="h-full rounded-object border border-on-inverse/10 bg-on-inverse/5 p-6">
                  <span className="grid h-11 w-11 place-items-center rounded-pill bg-area-bright text-on-area">
                    <s.icon className="h-5 w-5" strokeWidth={2} aria-hidden />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold">{s.title}</h3>
                  <p className="mt-2 text-on-inverse/75">{s.body}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- College guide ---------- */}
      <section id="college" className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-12 px-5 py-16 md:py-24 lg:grid-cols-2">
        <Reveal>
          <span className="rounded-pill bg-gold px-2.5 py-0.5 text-xs font-semibold text-on-area">Pro</span>
          <h2 className="mt-4 text-h3 font-semibold md:text-h2">A college guide that starts in Grade 9</h2>
          <p className="mt-4 max-w-[52ch] text-lg text-graytext">
            Pro includes a college guide built around your profile: a readiness score, a step-by-step roadmap,
            scholarships, an application tracker and feedback on your essay drafts.
          </p>
          <div className="mt-8">
            <Button href="/signup">See the college guide</Button>
          </div>
        </Reveal>
        <Reveal delayMs={120}>
          <div className="rounded-object bg-paper p-6 shadow-float ring-1 ring-grayline">
            <div className="border-b border-grayline pb-4 font-semibold">Inside the college guide</div>
            <ul className="mt-4 space-y-3">
              {COLLEGE_TABS.map((t) => (
                <li key={t.label} data-area={t.area} className="flex gap-4 rounded-input bg-area-tint p-4">
                  <span aria-hidden className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-pill bg-area-bright" />
                  <div>
                    <div className="text-sm font-semibold text-area-deep">{t.label}</div>
                    <div className="mt-0.5 text-[15px] text-ink">{t.title}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </section>

      {/* ---------- Pricing ---------- */}
      <section id="pricing" className="bg-paper-2 px-5 py-16 md:py-24">
        <div className="mx-auto max-w-[960px]">
          <Reveal className="text-center">
            <h2 className="text-h3 font-semibold md:text-h2">Start free. Upgrade when you need more.</h2>
            <p className="mt-3 text-lg text-graytext">No credit card to start. Cancel Pro anytime.</p>
          </Reveal>
          <div className="mt-12 grid gap-4 md:grid-cols-2">
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
                sub="per month · cancel anytime"
                features={["Everything in Free", "Unlimited AI generations", "AI tutor", "College guide"]}
                cta="Go Pro"
                badge="Save 30% yearly"
                featured
              />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------- Final call ---------- */}
      <section className="px-5 py-20 md:py-28">
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
          <div className="mt-8 flex justify-center">
            <Button href="/signup" size="lg">
              Start free
            </Button>
          </div>
        </Reveal>
      </section>

      {/* ---------- Built by students ---------- */}
      <section id="about" className="border-t border-grayline px-5 py-16 md:py-24">
        <div className="mx-auto max-w-[1200px]">
          <Reveal className="max-w-[640px]">
            <h2 className="text-h3 font-semibold md:text-h2">Built by four 14-year-olds who lived the pain.</h2>
            <p className="mt-4 text-lg text-graytext">
              We&apos;re IGCSE students ourselves, buried in past papers, missed deadlines, and mark schemes that never
              actually explained anything. Nothing out there was built for students like us, so we built it.
            </p>
          </Reveal>
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
            {TEAM.map((m, i) => (
              <Reveal key={m.name} delayMs={i * 80} className="h-full">
                <div data-area={m.area} className="lift h-full rounded-object bg-paper p-6 text-center shadow-card">
                  <div className="mx-auto grid h-14 w-14 place-items-center rounded-pill bg-area-bright text-lg font-semibold text-on-area">
                    {m.initials}
                  </div>
                  <div className="mt-4 font-semibold">{m.name}</div>
                  <div className="mt-1 text-sm text-graytext">{m.role}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Footer ---------- */}
      <footer className="bg-inverse px-5 py-14 text-on-inverse">
        <div className="mx-auto grid max-w-[1200px] grid-cols-2 gap-10 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
              <span className="grid h-7 w-7 place-items-center rounded-input bg-on-inverse font-mono text-sm text-inverse">S</span>
              StudyRaven<span className="text-on-inverse/70">.ai</span>
            </Link>
          </div>
          <FooterCol title="Product" items={[{ label: "Features", href: "#features" }, { label: "Pricing", href: "#pricing" }, { label: "College guide", href: "#college" }]} />
          <FooterCol title="Account" items={[{ label: "Log in", href: "/login" }, { label: "Start free", href: "/signup" }]} />
          <FooterCol title="Legal" items={[{ label: "Privacy", href: "/privacy" }, { label: "Terms", href: "/terms" }, { label: "Refunds", href: "/refunds" }, { label: "Contact", href: "/contact" }]} />
        </div>
        <div className="mx-auto mt-10 max-w-[1200px] space-y-3 border-t border-on-inverse/10 pt-6 text-sm text-on-inverse/70">
          <p className="max-w-[760px] leading-relaxed">{TRADEMARK_NOTE}</p>
          <p>Built by students, for students. © 2026 StudyRaven.ai</p>
        </div>
      </footer>
    </main>
  );
}

// ---- Data ----

const FEATURES: { icon: LucideIcon; title: string; desc: string; area: Area; pro?: boolean }[] = [
  {
    icon: Timer,
    area: "study",
    title: "Mock tests, AI-marked",
    desc: "Take timed mocks on AI-written practice papers. Each paper comes with its own mark scheme, and you get a score and topic-by-topic feedback.",
  },
  {
    icon: Layers,
    area: "essays",
    title: "StudyRaven Studio",
    desc: "Turn any topic or PDF into a summary, study guide, slide deck, flashcards, mind map or quiz.",
  },
  {
    icon: CalendarClock,
    area: "streak",
    title: "Deadline tracker",
    desc: "Keep every deadline and exam date in one place, with a countdown to your next exam.",
  },
  {
    icon: GraduationCap,
    area: "profile",
    title: "College guide",
    desc: "A readiness score, roadmap, scholarships, application tracker and essay feedback, from Grade 9.",
    pro: true,
  },
];

const STEPS: { icon: LucideIcon; title: string; body: string; area: Area }[] = [
  { icon: ListChecks, area: "study", title: "Tell StudyRaven about you", body: "Add your curriculum, subjects, exam dates and target grades." },
  { icon: Target, area: "streak", title: "Get your study plan", body: "A 7-day plan with three tasks a day, weighted towards your nearest exams." },
  { icon: ClipboardCheck, area: "profile", title: "Practise and track", body: "Take mocks, see where you dropped marks, and keep every deadline in one place." },
];

const COLLEGE_TABS: { label: string; title: string; area: Area }[] = [
  { label: "Readiness", title: "Where your profile stands today, and the gaps to close", area: "profile" },
  { label: "Roadmap", title: "A step-by-step plan from your grade to applications", area: "study" },
  { label: "Scholarships", title: "A curated list, plus live search matched to your interests", area: "streak" },
  { label: "Essays", title: "Feedback on your drafts. Every word stays yours.", area: "essays" },
];

const TEAM: { name: string; role: string; initials: string; area: Area }[] = [
  { name: "Bhavyaraj Singh", role: "CEO", initials: "BS", area: "study" },
  { name: "Viraj Gupta", role: "Marketing", initials: "VG", area: "compete" },
  { name: "Avyaan Dhoka", role: "Technology", initials: "AD", area: "essays" },
  { name: "Prabhat Khatri", role: "Finance", initials: "PK", area: "profile" },
];

// ---- Pieces ----

function PriceCard({
  name,
  price,
  sub,
  features,
  cta,
  badge,
  featured = false,
}: {
  name: string;
  price: string;
  sub: string;
  features: string[];
  cta: string;
  badge?: string;
  featured?: boolean;
}) {
  return (
    <div
      className={`lift relative h-full rounded-object p-8 shadow-card ${
        featured ? "bg-inverse text-on-inverse" : "bg-paper ring-1 ring-grayline"
      }`}
    >
      {badge && (
        <span className="absolute -top-3 right-6 rounded-pill bg-gold px-3 py-1 text-xs font-semibold text-on-area shadow-card">
          {badge}
        </span>
      )}
      <div className="text-lg font-semibold">{name}</div>
      <div className="mt-2 font-display text-h2 font-semibold tabular-nums">{price}</div>
      <div className={`text-sm ${featured ? "text-on-inverse/70" : "text-graymute"}`}>{sub}</div>
      <ul className="my-8 space-y-3">
        {features.map((f) => (
          <li key={f} className={`flex gap-3 text-[15px] ${featured ? "text-on-inverse/85" : "text-graytext"}`}>
            <Check className={`mt-0.5 h-4 w-4 shrink-0 ${featured ? "text-streak-bright" : "text-profile-deep"}`} aria-hidden />
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
