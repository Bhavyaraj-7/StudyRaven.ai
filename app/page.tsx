import Link from "next/link";
import {
  Calendar,
  GraduationCap,
  Sparkles,
  Timer,
  Wand2,
  FileText,
  ArrowRight,
  Check,
} from "lucide-react";
import StickyNav from "@/components/landing/StickyNav";
import CursorHalo from "@/components/landing/CursorHalo";
import MagneticButton from "@/components/landing/MagneticButton";

export default function Landing() {
  return (
    <main className="bg-paper text-ink overflow-x-hidden">
      <CursorHalo />
      <StickyNav />

      {/* ============== HERO ============== */}
      <header className="relative min-h-[820px] flex items-center justify-center text-center overflow-hidden">
        {/* Video bg — plays as-is, full frame, no masking on the right corner. */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="hero-video absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src="/landing-bg.mp4" type="video/mp4" />
        </video>

        {/* Light wash for text legibility — top only, leaves the rest of the animation visible. */}
        <div
          className="absolute inset-0 z-[2] pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.25) 40%, rgba(255,255,255,0.4) 100%)",
          }}
        />

        <div className="relative z-[5] max-w-[900px] px-7 pt-32 pb-24">
          <h1
            className="reveal"
            style={{
              fontSize: "clamp(42px, 7.2vw, 80px)",
              lineHeight: 1.02,
              fontWeight: 600,
              letterSpacing: "-0.035em",
              margin: "0 0 22px",
              animationDelay: "100ms",
            }}
          >
            Built for students.
            <br />
            Engineered for results.
          </h1>
          <p
            className="reveal max-w-[600px] mx-auto"
            style={{
              fontSize: "clamp(16px, 2vw, 19px)",
              lineHeight: 1.6,
              color: "#4A4A4A",
              margin: "0 auto 38px",
              animationDelay: "200ms",
            }}
          >
            Your AI study partner. Personalized plans, smart reminders, mock
            grading, and college guidance — all in one place.
          </p>
          <div
            className="reveal flex items-center justify-center gap-3 flex-wrap"
            style={{ animationDelay: "300ms" }}
          >
            <MagneticButton href="/signup" variant="primary">
              Start your journey <ArrowRight className="w-4 h-4" />
            </MagneticButton>
            <MagneticButton href="/login" variant="ghost">
              I have an account
            </MagneticButton>
          </div>
        </div>
      </header>

      {/* ============== FEATURES ============== */}
      <section id="features" className="bg-paper py-[104px] px-7">
        <div className="max-w-[1180px] mx-auto">
          <div className="font-mono text-[12.5px] text-graymute tracking-wider mb-3.5">
            WHAT STUDYRAVEN.AI DOES
          </div>
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
            Everything you need to study smart. Nothing you don&apos;t.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[18px]">
            {FEATURES.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* ============== HOW IT WORKS (DARK) ============== */}
      <section id="how" className="bg-ink text-paper py-[104px] px-7">
        <div className="max-w-[1180px] mx-auto">
          <div className="font-mono text-[12.5px] text-graymute tracking-wider mb-3.5">
            HOW IT WORKS
          </div>
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
            From scattered notes to a clear plan in three steps.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {STEPS.map((s, i) => (
              <div
                key={s.title}
                className="p-8 rounded-[18px] border border-[#1f1f1f] bg-[#0e0e0e]"
              >
                <div className="font-mono text-[14px] text-graymute mb-6">
                  0{i + 1}
                </div>
                <div className="font-semibold text-[21px] tracking-tight mb-2.5">
                  {s.title}
                </div>
                <p className="text-graymute text-[15px] leading-relaxed">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============== STATS (DARK) ============== */}
      <section className="bg-ink text-paper py-[104px] px-7 border-t border-[#1f1f1f]">
        <div className="max-w-[1180px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-5">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="border-l border-[#1f1f1f] pl-6"
            >
              <div
                className="font-mono font-semibold"
                style={{
                  fontSize: "clamp(34px, 5vw, 54px)",
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                }}
              >
                {s.display}
              </div>
              <div className="text-graymute text-[14px] mt-3 leading-snug">
                {s.label}
              </div>
            </div>
          ))}
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
              Your grades open doors. We help you choose which one.
            </h2>
            <p className="text-graytext text-[17px] leading-relaxed mb-8">
              A weekly newsletter on competitions, summer programs, books,
              podcasts, and country-specific portfolio guidance — written by
              students who got in.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 bg-ink text-paper rounded-[12px] px-6 py-3.5 text-[15px] font-medium hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(0,0,0,0.2)] transition"
            >
              Experience college guidance <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="border border-grayline rounded-[18px] p-6 bg-paper shadow-[0_20px_60px_rgba(10,10,10,0.07)]">
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-grayline">
              <span className="font-semibold text-[15px]">
                The StudyRaven.ai Edge
              </span>
              <span className="font-mono text-[11px] text-graymute">
                issue #18
              </span>
            </div>
            <div className="flex flex-col gap-2.5">
              {NEWSLETTER_ITEMS.map((n) => (
                <div
                  key={n.kicker}
                  className="p-4 rounded-[12px] bg-graylite"
                >
                  <div className="font-mono text-[10px] text-graymute tracking-wider mb-1.5">
                    {n.kicker}
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
            Start free. Upgrade when you&apos;re ready to win.
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
                "Past papers + mark schemes",
                "Basic mock tests",
                "Deadline reminders",
                "Gmail + Classroom sync",
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
                "Score predictor on mocks",
                "Audio overview (podcast)",
                "College guidance + weekly newsletter",
                "AI-generated practice papers",
                "Unlimited generations",
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
          Stop hoping. Start scoring.
        </h2>
        <p className="text-graytext text-[18px] mt-5 max-w-[520px] mx-auto leading-relaxed">
          Join thousands of students using StudyRaven.ai to study smarter,
          not harder.
        </p>
        <div className="mt-8">
          <MagneticButton href="/signup" variant="primary">
            Start your journey <ArrowRight className="w-4 h-4" />
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
            <div className="font-mono text-[12px] tracking-[0.18em] text-graymute mb-4 reveal">
              WHO WE ARE
            </div>
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
              We&apos;re IGCSE students ourselves — buried in past papers, missed
              deadlines, and mark schemes that never actually explained anything.
              Nothing out there was built for students like us, so we built it:
              StudyRaven.ai, the study partner we wished we&apos;d had.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-14">
            {TEAM.map((m, i) => (
              <div
                key={m.name}
                className="about-float rounded-[18px] border border-grayline bg-paper p-6 text-center shadow-[0_10px_40px_rgba(10,10,10,0.05)] hover:border-ink hover:shadow-[0_20px_50px_rgba(10,10,10,0.12)] transition-colors"
                style={{ animationDelay: `${i * 0.5}s` }}
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
      <footer className="bg-ink text-paper py-14 px-7">
        <div className="max-w-[1180px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2 md:col-span-1">
            <Link
              href="/"
              className="flex items-center gap-2 font-semibold text-[19px]"
            >
              <span className="w-[26px] h-[26px] rounded-[7px] bg-paper text-ink inline-flex items-center justify-center font-mono text-[14px]">
                S
              </span>
              StudyRaven<span className="text-graymute">.ai</span>
            </Link>
            <div className="mt-4 inline-flex items-center gap-2 text-[12px] text-graymute">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 ticker-dot" />
              All systems normal
            </div>
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
            title="Resources"
            items={[
              { label: "Past papers", href: "/papers" },
              { label: "Mark schemes", href: "/marks" },
              { label: "Mock tests", href: "/mocks" },
            ]}
          />
          <FooterCol
            title="Legal"
            items={[
              { label: "Privacy", href: "#" },
              { label: "Terms", href: "#" },
              { label: "Contact", href: "mailto:bsingh10@jpischool.com" },
            ]}
          />
        </div>
        <div className="max-w-[1180px] mx-auto mt-10 pt-6 border-t border-[#1f1f1f] flex items-center justify-between text-[12.5px] text-graymute font-mono">
          <span>Built by students, for students. © 2026 StudyRaven.ai</span>
          <span>Made for students</span>
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
    desc: "Turn any topic or PDF into a slide deck, summary, study guide, flashcards, or mind map in seconds.",
    pro: false,
  },
  {
    icon: <Timer className="w-5 h-5" />,
    title: "Mock tests, AI-graded",
    desc: "Take timed mocks. Get a score, predicted grade, and topic-by-topic feedback graded against real mark schemes.",
    pro: false,
  },
  {
    icon: <Calendar className="w-5 h-5" />,
    title: "Smart deadline tracker",
    desc: "Auto reminders by email. Connect Gmail and Classroom to sync every due date so nothing slips.",
    pro: false,
  },
  {
    icon: <GraduationCap className="w-5 h-5" />,
    title: "College guidance",
    desc: "Competitions, summer programs, university matches, and a weekly newsletter — starting from Grade 9.",
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
    body: "Add your subjects, exam dates, and current grades. It takes about two minutes.",
  },
  {
    title: "Get your study plan",
    body: "A personalized roadmap with daily tasks, study guides, and the right past papers.",
  },
  {
    title: "Never miss a deadline",
    body: "Auto reminders by email. Connect Gmail and Classroom to sync every due date.",
  },
];

const STATS = [
  { display: "12k+", label: "Past papers and mark schemes indexed" },
  { display: "5", label: "AI outputs from a single topic" },
  { display: "<60s", label: "From prompt to graded mock" },
  { display: "₹0", label: "To start — free forever" },
];

const NEWSLETTER_ITEMS = [
  {
    kicker: "COMPETITIONS",
    title: "3 competitions closing this month for Grade 9 students",
  },
  {
    kicker: "PORTFOLIO",
    title: "What Stanford wants in a Grade 10 portfolio",
  },
  {
    kicker: "FREE COURSE",
    title: "The free MIT course that will set you apart",
  },
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
        dark ? "bg-ink text-paper border-ink" : "bg-paper border-grayline"
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
          dark ? "text-graymute" : "text-graymute"
        }`}
      >
        {sub}
      </div>
      <div className="flex flex-col gap-3 mb-8">
        {features.map((f) => (
          <div
            key={f}
            className={`flex gap-3 text-[14.5px] ${
              dark ? "text-paper/80" : "text-graytext"
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
            ? "bg-paper text-ink hover:-translate-y-px"
            : "bg-ink text-paper hover:-translate-y-px"
        }`}
      >
        {cta} <ArrowRight className="w-4 h-4" />
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
      <div className="font-mono text-[11.5px] text-graymute tracking-wider mb-4">
        {title.toUpperCase()}
      </div>
      <ul className="space-y-2.5 text-[14px]">
        {items.map((it) => (
          <li key={it.label}>
            <a href={it.href} className="text-paper/80 hover:text-paper transition">
              {it.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
