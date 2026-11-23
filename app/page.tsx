import Link from "next/link";
import {
  Calendar,
  GraduationCap,
  Sparkles,
  Timer,
  Wand2,
  FileText,
  Check,
} from "lucide-react";
import StickyNav from "@/components/landing/StickyNav";
import MagneticButton from "@/components/landing/MagneticButton";
import { TRADEMARK_NOTE } from "@/lib/site";

export default function Landing() {
  return (
    <main className="bg-paper text-ink overflow-x-hidden">
      <StickyNav />

      {/* ============== HERO ============== */}
      {/* Plain background until the Phase 1c hero ships (the old AI video
          carried a third-party watermark). */}
      <header className="relative min-h-[600px] md:min-h-[720px] flex items-center justify-center text-center overflow-hidden bg-paper">
        <div className="relative max-w-[900px] px-7 pt-32 pb-24">
          <h1
            className="text-balance"
            style={{
              fontSize: "clamp(42px, 7.2vw, 80px)",
              lineHeight: 1.02,
              fontWeight: 600,
              letterSpacing: "-0.035em",
              margin: "0 0 22px",
            }}
          >
            Study plans and marked mock tests for IGCSE and IB.
          </h1>
          <p
            className="text-pretty max-w-[600px] mx-auto text-graytext"
            style={{
              fontSize: "clamp(16px, 2vw, 19px)",
              lineHeight: 1.6,
              margin: "0 auto 38px",
            }}
          >
            Get a 7-day plan built around your exam dates, take AI-marked mocks,
            and see exactly where you dropped marks and which topics to fix.
          </p>
          <div
            className="flex items-center justify-center gap-3 flex-wrap"
          >
            <MagneticButton href="/signup" variant="primary">
              Start free
            </MagneticButton>
            <MagneticButton href="/login" variant="ghost">
              Log in
            </MagneticButton>
          </div>
        </div>
      </header>

      {/* ============== FEATURES ============== */}
      <section id="features" className="bg-paper py-[104px] px-7">
        <div className="max-w-[1180px] mx-auto">
          <h2
            style={{
              fontSize: "clamp(30px, 4.4vw, 46px)",
              fontWeight: 600,
              letterSpacing: "-0.03em",
              lineHeight: 1.08,
              maxWidth: 680,
              margin: "0 0 56px",
            }}
          >
            What StudyRaven does
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[18px]">
            {FEATURES.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* ============== HOW IT WORKS (DARK) ============== */}
      <section id="how" className="bg-inverse text-on-inverse py-[104px] px-7">
        <div className="max-w-[1180px] mx-auto">
          <h2
            style={{
              fontSize: "clamp(30px, 4.4vw, 46px)",
              fontWeight: 600,
              letterSpacing: "-0.03em",
              lineHeight: 1.08,
              maxWidth: 640,
              margin: "0 0 56px",
            }}
          >
            How it works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {STEPS.map((s) => (
              <div
                key={s.title}
                className="p-8 rounded-[18px] border border-on-inverse/10 bg-on-inverse/5"
              >
                <div className="font-semibold text-[21px] tracking-tight mb-2.5">
                  {s.title}
                </div>
                <p className="text-on-inverse/70 text-[15px] leading-relaxed">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============== COLLEGE GUIDANCE ============== */}
      <section id="college" className="bg-paper py-[104px] px-7">
        <div className="max-w-[1180px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-14 items-center">
          <div>
            <span className="font-mono text-[10px] tracking-wider px-2.5 py-1 rounded-md bg-ink text-paper">
              PRO
            </span>
            <h2
              style={{
                fontSize: "clamp(28px, 3.6vw, 42px)",
                fontWeight: 600,
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
                margin: "20px 0 18px",
              }}
            >
              A college guide that starts in Grade 9
            </h2>
            <p className="text-graytext text-[17px] leading-relaxed mb-8">
              Pro includes a college guide built around your profile: a
              readiness score, a step-by-step roadmap, scholarships, an
              application tracker and feedback on your essay drafts.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 bg-ink text-paper rounded-[12px] px-6 py-3.5 text-[15px] font-medium hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(0,0,0,0.2)] transition"
            >
              See the college guide
            </Link>
          </div>
          <div className="border border-grayline rounded-[18px] p-6 bg-paper shadow-[0_20px_60px_rgba(10,10,10,0.07)]">
            <div className="mb-5 pb-4 border-b border-grayline">
              <span className="font-semibold text-[15px]">
                Inside the college guide
              </span>
            </div>
            <div className="flex flex-col gap-2.5">
              {COLLEGE_TABS.map((n) => (
                <div
                  key={n.label}
                  className="p-4 rounded-[12px] bg-graylite"
                >
                  <div className="text-[12.5px] font-medium text-graytext mb-1">
                    {n.label}
                  </div>
                  <div className="text-[14.5px] font-medium leading-snug">
                    {n.title}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============== PRICING ============== */}
      <section id="pricing" className="bg-graylite/40 py-[104px] px-7">
        <div className="max-w-[920px] mx-auto">
          <h2
            className="text-center"
            style={{
              fontSize: "clamp(30px, 4.4vw, 46px)",
              fontWeight: 600,
              letterSpacing: "-0.03em",
              lineHeight: 1.08,
              margin: "0 0 12px",
            }}
          >
            Start free. Upgrade when you need more.
          </h2>
          <p className="text-center text-graytext text-[17px] mb-12">
            No credit card to start. Cancel Pro anytime.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <PriceCard
              name="Free"
              price="₹0"
              sub="forever, for students"
              features={[
                "AI study planner",
                "AI-marked mock tests",
                "Mark scheme guides for your subjects",
                "5 AI generations a day",
                "Deadline and exam tracker",
              ]}
              cta="Start free"
              href="/signup"
              dark={false}
            />
            <PriceCard
              name="Pro"
              price="₹299"
              sub="per month · cancel anytime"
              features={[
                "Everything in Free",
                "Unlimited AI generations",
                "AI tutor",
                "College guide",
              ]}
              cta="Go Pro"
              href="/signup"
              dark={true}
              badge="Save 30% yearly"
            />
          </div>
        </div>
      </section>

      {/* ============== FINAL CTA ============== */}
      <section className="bg-paper py-[120px] px-7 text-center">
        <h2
          style={{
            fontSize: "clamp(34px, 5vw, 56px)",
            fontWeight: 600,
            letterSpacing: "-0.03em",
            lineHeight: 1.05,
          }}
        >
          See exactly where your marks go.
        </h2>
        <p className="text-graytext text-[18px] mt-5 max-w-[520px] mx-auto leading-relaxed">
          Free to start. Add your subjects and take your first mock today.
        </p>
        <div className="mt-8">
          <MagneticButton href="/signup" variant="primary">
            Start free
          </MagneticButton>
        </div>
      </section>

      {/* ============== ABOUT ============== */}
      <section
        id="about"
        className="bg-paper py-[104px] px-7 border-t border-grayline"
      >
        <div className="max-w-[1080px] mx-auto">
          <div className="text-center max-w-[660px] mx-auto">
            <h2
              className="reveal"
              style={{
                fontSize: "clamp(30px, 4.4vw, 46px)",
                fontWeight: 600,
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
                margin: "0 0 18px",
              }}
            >
              Built by four 14-year-olds who lived the pain.
            </h2>
            <p
              className="text-graytext text-[17px] leading-relaxed reveal"
              style={{ animationDelay: "120ms" }}
            >
              We&apos;re IGCSE students ourselves, buried in past papers, missed
              deadlines, and mark schemes that never actually explained anything.
              Nothing out there was built for students like us, so we built it:
              StudyRaven.ai, the study partner we wished we&apos;d had.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-14">
            {TEAM.map((m) => (
              <div
                key={m.name}
                className="rounded-[18px] border border-grayline bg-paper p-6 text-center shadow-[0_10px_40px_rgba(10,10,10,0.05)] hover:border-ink hover:shadow-[0_20px_50px_rgba(10,10,10,0.12)] transition-colors"
              >
                <div className="w-14 h-14 mx-auto rounded-full bg-ink text-paper inline-flex items-center justify-center font-mono text-[17px] font-semibold">
                  {m.initials}
                </div>
                <div className="font-semibold text-[16px] mt-4">{m.name}</div>
                <div className="text-graymute text-[13px] mt-1">{m.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============== FOOTER ============== */}
      <footer className="bg-inverse text-on-inverse py-14 px-7">
        <div className="max-w-[1180px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2 md:col-span-1">
            <Link
              href="/"
              className="flex items-center gap-2 font-semibold text-[19px]"
            >
              <span className="w-[26px] h-[26px] rounded-[7px] bg-on-inverse text-inverse inline-flex items-center justify-center font-mono text-[14px]">
                S
              </span>
              StudyRaven<span className="text-on-inverse/70">.ai</span>
            </Link>
          </div>
          <FooterCol
            title="Product"
            items={[
              { label: "Features", href: "#features" },
              { label: "Pricing", href: "#pricing" },
              { label: "College guide", href: "#college" },
            ]}
          />
          <FooterCol
            title="Account"
            items={[
              { label: "Log in", href: "/login" },
              { label: "Start free", href: "/signup" },
            ]}
          />
          <FooterCol
            title="Legal"
            items={[
              { label: "Privacy", href: "/privacy" },
              { label: "Terms", href: "/terms" },
              { label: "Refunds", href: "/refunds" },
              { label: "Contact", href: "/contact" },
            ]}
          />
        </div>
        <div className="max-w-[1180px] mx-auto mt-10 pt-6 border-t border-on-inverse/10 text-[12.5px] text-on-inverse/70 space-y-3">
          <p className="max-w-[760px] leading-relaxed">{TRADEMARK_NOTE}</p>
          <p className="font-mono">
            Built by students, for students. © 2026 StudyRaven.ai
          </p>
        </div>
      </footer>
    </main>
  );
}

// ---- Data ----

const FEATURES = [
  {
    icon: <Wand2 className="w-5 h-5" />,
    title: "StudyRaven Studio",
    desc: "Turn any topic or PDF into a summary, study guide, slide deck, flashcards, mind map or quiz.",
    pro: false,
  },
  {
    icon: <Timer className="w-5 h-5" />,
    title: "Mock tests, AI-marked",
    desc: "Take timed mocks on AI-written practice papers. Each paper comes with its own mark scheme, and you get a score and topic-by-topic feedback.",
    pro: false,
  },
  {
    icon: <Calendar className="w-5 h-5" />,
    title: "Deadline tracker",
    desc: "Keep every deadline and exam date in one place, with a countdown to your next exam.",
    pro: false,
  },
  {
    icon: <GraduationCap className="w-5 h-5" />,
    title: "College guide",
    desc: "A readiness score, roadmap, scholarships, application tracker and essay feedback, from Grade 9.",
    pro: true,
  },
];

const TEAM = [
  { name: "Bhavyaraj Singh", role: "CEO", initials: "BS" },
  { name: "Viraj Gupta", role: "Marketing", initials: "VG" },
  { name: "Avyaan Dhoka", role: "Technology", initials: "AD" },
  { name: "Prabhat Khatri", role: "Finance", initials: "PK" },
];

const STEPS = [
  {
    title: "Tell StudyRaven.ai about you",
    body: "Add your curriculum, subjects, exam dates and target grades.",
  },
  {
    title: "Get your study plan",
    body: "A 7-day plan with three tasks a day, weighted towards your nearest exams.",
  },
  {
    title: "Practise and track",
    body: "Take mocks, see where you dropped marks, and keep every deadline in one place.",
  },
];

const COLLEGE_TABS = [
  { label: "Readiness", title: "Where your profile stands today, and the gaps to close" },
  { label: "Roadmap", title: "A step-by-step plan from your grade to applications" },
  { label: "Scholarships", title: "A curated list, plus live search matched to your interests" },
  { label: "Essays", title: "Feedback on your drafts. Every word stays yours." },
];

// ---- Components ----

function FeatureCard({
  icon,
  title,
  desc,
  pro,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  pro?: boolean;
}) {
  return (
    <div className="relative p-8 rounded-[18px] border border-grayline bg-paper transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_50px_rgba(10,10,10,0.08)] hover:border-ink">
      <div className="flex items-start justify-between mb-6">
        <div className="w-[46px] h-[46px] rounded-[12px] border border-grayline flex items-center justify-center text-ink">
          {icon}
        </div>
        {pro && (
          <span className="font-mono text-[10px] tracking-wider px-2 py-0.5 rounded-md bg-ink text-paper">
            PRO
          </span>
        )}
      </div>
      <div className="font-semibold text-[20px] tracking-tight mb-2.5">
        {title}
      </div>
      <p className="text-graytext text-[15px] leading-relaxed">{desc}</p>
    </div>
  );
}

function PriceCard({
  name,
  price,
  sub,
  features,
  cta,
  href,
  dark,
  badge,
}: {
  name: string;
  price: string;
  sub: string;
  features: string[];
  cta: string;
  href: string;
  dark: boolean;
  badge?: string;
}) {
  return (
    <div
      className={`relative p-9 rounded-[20px] border ${
        dark ? "bg-inverse text-on-inverse border-inverse" : "bg-paper border-grayline"
      }`}
    >
      {badge && (
        <span className="absolute -top-3 right-6 font-mono text-[10px] tracking-wider px-2.5 py-1 rounded-md bg-paper text-ink border border-grayline shadow-sm">
          {badge}
        </span>
      )}
      <div className="font-semibold text-[19px] mb-1.5">{name}</div>
      <div className="font-mono text-[40px] font-semibold tracking-tight mb-1">
        {price}
      </div>
      <div
        className={`text-[14px] mb-7 ${
          dark ? "text-on-inverse/70" : "text-graymute"
        }`}
      >
        {sub}
      </div>
      <div className="flex flex-col gap-3 mb-8">
        {features.map((f) => (
          <div
            key={f}
            className={`flex gap-3 text-[14.5px] ${
              dark ? "text-on-inverse/80" : "text-graytext"
            }`}
          >
            <Check className="w-4 h-4 mt-0.5 shrink-0" />
            {f}
          </div>
        ))}
      </div>
      <Link
        href={href}
        className={`inline-flex w-full justify-center items-center gap-2 rounded-[12px] px-5 py-3 text-[15px] font-medium transition ${
          dark
            ? "bg-on-inverse text-inverse hover:-translate-y-px"
            : "bg-ink text-paper hover:-translate-y-px"
        }`}
      >
        {cta}
      </Link>
    </div>
  );
}

function FooterCol({
  title,
  items,
}: {
  title: string;
  items: { label: string; href: string }[];
}) {
  return (
    <div>
      <div className="text-[13px] font-medium text-on-inverse mb-4">{title}</div>
      <ul className="space-y-2.5 text-[14px]">
        {items.map((it) => (
          <li key={it.label}>
            <a href={it.href} className="text-on-inverse/80 hover:text-on-inverse transition">
              {it.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
