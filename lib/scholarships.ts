// Curated scholarship database for IGCSE students (Grades 9-10).
// Every entry is a real, well-established scholarship or award program.
// URLs point to stable top-level pages, never deep links that rot.
// Deadlines are recurring windows, not exact dates — they shift slightly
// each cycle, so the UI should present them as "usually X".

export type ScholarshipCategory =
  | "apply-now"
  | "high-school-abroad"
  | "university-full"
  | "need-based-us"
  | "india";

export const CATEGORY_LABELS: Record<
  ScholarshipCategory,
  { title: string; subtitle: string }
> = {
  "apply-now": {
    title: "Apply now — open to Grade 9-10",
    subtitle:
      "Competitions and programs with real money you can enter today. These also become application strengths later.",
  },
  "high-school-abroad": {
    title: "Study abroad for Grades 11-12",
    subtitle:
      "Full scholarships to finish high school overseas — you apply during Grade 10, so the window is now.",
  },
  "university-full": {
    title: "Full university scholarships to target",
    subtitle:
      "Applied in Grade 12, but knowing them now shapes what you build for the next 2 years.",
  },
  "need-based-us": {
    title: "Need-blind US universities",
    subtitle:
      "These admit internationals without looking at ability to pay, then meet 100% of demonstrated need — effectively a full scholarship if you get in.",
  },
  india: {
    title: "For Indian students",
    subtitle: "Scholarships specific to studying in or from India.",
  },
};

export interface CuratedScholarship {
  name: string;
  provider: string;
  amount: string;
  eligibility: string;
  deadlineWindow: string;
  url: string;
  category: ScholarshipCategory;
  /** Grade band that should act on this now. */
  actNow: string;
  /** Countries this helps you study in; "Any" = destination-agnostic. */
  destinations: string[];
  /** Interest tags used for per-student matching. */
  tags: string[];
}

export const CURATED_SCHOLARSHIPS: CuratedScholarship[] = [
  // ── Apply now (Grade 9-10) ────────────────────────────────────────────
  {
    name: "Breakthrough Junior Challenge",
    provider: "Breakthrough Prize Foundation",
    amount: "$250,000 college scholarship + $100,000 school lab",
    eligibility: "Ages 13-18 worldwide. Make a 2-minute video explaining a science/math concept.",
    deadlineWindow: "Submissions usually April-June",
    url: "https://breakthroughjuniorchallenge.org",
    category: "apply-now",
    actNow: "9-10",
    destinations: ["Any"],
    tags: ["science", "math", "physics", "biology", "video"],
  },
  {
    name: "RISE for the World",
    provider: "Schmidt Futures & Rhodes Trust",
    amount: "Lifetime benefits: scholarships, funding, tech, mentorship",
    eligibility: "Ages 15-17 worldwide. Selects 100 'brilliant people who need opportunity' per year via a project you build.",
    deadlineWindow: "Applications usually close January",
    url: "https://www.risefortheworld.org",
    category: "apply-now",
    actNow: "9-10",
    destinations: ["Any"],
    tags: ["leadership", "social-impact", "entrepreneurship", "research"],
  },
  {
    name: "John Locke Institute Essay Competition",
    provider: "John Locke Institute",
    amount: "Up to $10,000 toward institute programs; huge admissions signal",
    eligibility: "Ages 18 and under (Junior Prize under 15). Essay in philosophy, politics, economics, history, law, psychology, or theology.",
    deadlineWindow: "Register by May, submit by end of June",
    url: "https://www.johnlockeinstitute.com",
    category: "apply-now",
    actNow: "9-10",
    destinations: ["Any"],
    tags: ["writing", "economics", "history", "philosophy", "law", "psychology"],
  },
  {
    name: "Conrad Challenge",
    provider: "Conrad Foundation",
    amount: "Scholarships, seed funding, and 'Pete Conrad Scholar' title",
    eligibility: "Ages 13-18 worldwide, teams of 2-5. Innovation challenge: design a product solving a real problem.",
    deadlineWindow: "Registration usually August-November",
    url: "https://www.conradchallenge.org",
    category: "apply-now",
    actNow: "9-10",
    destinations: ["Any"],
    tags: ["entrepreneurship", "engineering", "innovation", "teamwork"],
  },
  {
    name: "Diamond Challenge",
    provider: "University of Delaware Horn Entrepreneurship",
    amount: "Share of $100,000+ prize pool",
    eligibility: "Ages 14-18 worldwide, teams of 2-4. Business or social venture concept.",
    deadlineWindow: "Concept submissions usually early January",
    url: "https://diamondchallenge.org",
    category: "apply-now",
    actNow: "9-10",
    destinations: ["Any"],
    tags: ["entrepreneurship", "business", "social-impact"],
  },
  {
    name: "The Earth Prize",
    provider: "The Earth Foundation",
    amount: "$100,000 total awards",
    eligibility: "Ages 13-19 worldwide. Environmental sustainability solution, individually or in teams.",
    deadlineWindow: "Register September-January",
    url: "https://www.theearthprize.org",
    category: "apply-now",
    actNow: "9-10",
    destinations: ["Any"],
    tags: ["environment", "sustainability", "science", "innovation"],
  },
  {
    name: "Technovation Girls",
    provider: "Technovation",
    amount: "Scholarships and prizes; alumnae network",
    eligibility: "Girls ages 8-18 worldwide. Build a mobile app or AI project solving a community problem.",
    deadlineWindow: "Season runs October-April",
    url: "https://technovationchallenge.org",
    category: "apply-now",
    actNow: "9-10",
    destinations: ["Any"],
    tags: ["technology", "coding", "girls", "ai", "app-development"],
  },
  {
    name: "Regeneron ISEF (via affiliated fairs)",
    provider: "Society for Science",
    amount: "$9M+ in awards; top prize $75,000",
    eligibility: "Grades 9-12. Qualify through an affiliated science fair in your country (India has several IRIS-affiliated fairs).",
    deadlineWindow: "Local fairs run October-February",
    url: "https://www.societyforscience.org/isef",
    category: "apply-now",
    actNow: "9-10",
    destinations: ["Any"],
    tags: ["science", "research", "engineering", "STEM"],
  },

  // ── High-school abroad (apply in Grade 10) ────────────────────────────
  {
    name: "UWC International Scholarships",
    provider: "United World Colleges (18 schools worldwide)",
    amount: "Full and partial scholarships for the 2-year IB Diploma",
    eligibility: "Apply via your UWC national committee (UWC India) at age 15-17 — i.e., during Grade 10.",
    deadlineWindow: "India applications usually open May-September",
    url: "https://www.uwc.org",
    category: "high-school-abroad",
    actNow: "10",
    destinations: ["UK", "USA", "Singapore", "Italy", "Norway", "Any"],
    tags: ["IB", "boarding-school", "leadership", "global"],
  },
  {
    name: "SIA Youth Scholarship (Singapore)",
    provider: "Singapore Ministry of Education",
    amount: "Full tuition + boarding + annual allowance for 2 years",
    eligibility: "Indian students completing Grade 10, to study Grades 11-12 in top Singapore junior colleges.",
    deadlineWindow: "Applications usually open around May",
    url: "https://www.moe.gov.sg",
    category: "high-school-abroad",
    actNow: "10",
    destinations: ["Singapore"],
    tags: ["india", "singapore", "pre-university"],
  },

  // ── University full scholarships to target ────────────────────────────
  {
    name: "Tata Scholarship at Cornell University",
    provider: "Tata Education & Development Trust",
    amount: "Full demonstrated need for the entire degree",
    eligibility: "Indian citizens admitted to Cornell undergraduate programs who qualify for need-based aid.",
    deadlineWindow: "Automatic with Cornell aid application (Grade 12)",
    url: "https://finaid.cornell.edu",
    category: "university-full",
    actNow: "plan-ahead",
    destinations: ["USA"],
    tags: ["india", "engineering", "any-major"],
  },
  {
    name: "Jardine Scholarship (Oxford & Cambridge)",
    provider: "Jardine Foundation",
    amount: "Full funding: fees, flights, and living costs",
    eligibility: "Students from SE Asia, mainland China, HK and Taiwan applying to selected Oxbridge colleges (note: India not currently eligible — relevant if you hold SE Asian citizenship).",
    deadlineWindow: "Usually closes August-September of Grade 12",
    url: "https://www.jardines.com/en/community/foundation.html",
    category: "university-full",
    actNow: "plan-ahead",
    destinations: ["UK"],
    tags: ["oxbridge", "any-major"],
  },
  {
    name: "NUS Science & Technology Undergraduate Scholarship",
    provider: "National University of Singapore",
    amount: "Full tuition + living allowance + accommodation",
    eligibility: "Asian nationals (including India) admitted to science/tech degrees at NUS.",
    deadlineWindow: "With NUS admission application (Grade 12)",
    url: "https://www.nus.edu.sg",
    category: "university-full",
    actNow: "plan-ahead",
    destinations: ["Singapore"],
    tags: ["STEM", "engineering", "computer-science", "india"],
  },
  {
    name: "MEXT Undergraduate Scholarship (Japan)",
    provider: "Government of Japan",
    amount: "Full tuition + monthly stipend + flights, 5 years",
    eligibility: "International students applying to Japanese universities; screened via embassy exam and interview.",
    deadlineWindow: "Embassy applications usually April-May of Grade 12",
    url: "https://www.studyinjapan.go.jp/en",
    category: "university-full",
    actNow: "plan-ahead",
    destinations: ["Japan"],
    tags: ["STEM", "any-major", "government"],
  },
  {
    name: "University of Hong Kong International Scholarships",
    provider: "HKU",
    amount: "Up to full tuition + living costs for top admits",
    eligibility: "Awarded automatically on admission strength — no separate application.",
    deadlineWindow: "With HKU admission (Grade 12)",
    url: "https://www.hku.hk",
    category: "university-full",
    actNow: "plan-ahead",
    destinations: ["Hong Kong"],
    tags: ["any-major", "business", "STEM"],
  },

  // ── Need-blind US universities ────────────────────────────────────────
  {
    name: "MIT need-blind financial aid",
    provider: "Massachusetts Institute of Technology",
    amount: "100% of demonstrated need met; most aided families pay under $25k/yr, many pay $0",
    eligibility: "All admitted students including internationals — admission decisions ignore finances entirely.",
    deadlineWindow: "With admission application (Grade 12)",
    url: "https://mitadmissions.org",
    category: "need-based-us",
    actNow: "plan-ahead",
    destinations: ["USA"],
    tags: ["STEM", "engineering", "computer-science"],
  },
  {
    name: "Harvard Financial Aid Initiative",
    provider: "Harvard College",
    amount: "Families under ~$85k/yr pay nothing; need-blind for internationals",
    eligibility: "All admitted students; aid identical for internationals and US citizens.",
    deadlineWindow: "With admission application (Grade 12)",
    url: "https://college.harvard.edu/financial-aid",
    category: "need-based-us",
    actNow: "plan-ahead",
    destinations: ["USA"],
    tags: ["any-major", "liberal-arts"],
  },
  {
    name: "Yale need-blind admissions",
    provider: "Yale University",
    amount: "100% of demonstrated need, no loans required",
    eligibility: "All applicants including internationals evaluated need-blind.",
    deadlineWindow: "With admission application (Grade 12)",
    url: "https://admissions.yale.edu",
    category: "need-based-us",
    actNow: "plan-ahead",
    destinations: ["USA"],
    tags: ["any-major", "liberal-arts"],
  },

  // ── India-specific ────────────────────────────────────────────────────
  {
    name: "Reliance Foundation Undergraduate Scholarships",
    provider: "Reliance Foundation",
    amount: "Up to ₹2,00,000 over the degree; 5,000 awards/year",
    eligibility: "Indian students entering first-year undergraduate study in India, merit-cum-means.",
    deadlineWindow: "Applications usually open August-October",
    url: "https://scholarships.reliancefoundation.org",
    category: "india",
    actNow: "plan-ahead",
    destinations: ["India"],
    tags: ["india", "any-major", "merit"],
  },
];

/**
 * Order scholarships for a specific student. Curated set is small, so this
 * is a rank, not a filter — nothing is hidden, best fits float up.
 */
export function rankScholarships(opts: {
  grade: number | null;
  homeCountry: string;
  targetCountry: string;
  interests: string[];
}): CuratedScholarship[] {
  const interests = opts.interests.map((i) => i.toLowerCase());
  const target = opts.targetCountry.toLowerCase();
  const home = opts.homeCountry.toLowerCase();
  const isIndian = home.includes("india") || home === "";

  const score = (s: CuratedScholarship): number => {
    let n = 0;
    // Grade 9-10 students should see actionable items first.
    if (s.category === "apply-now") n += 4;
    if (s.category === "high-school-abroad" && (opts.grade ?? 10) === 10) n += 3;
    if (
      target &&
      s.destinations.some((d) => d.toLowerCase() === target || d === "Any")
    )
      n += 2;
    if (isIndian && s.tags.includes("india")) n += 2;
    if (!isIndian && s.tags.includes("india")) n -= 2;
    for (const i of interests) {
      if (s.tags.some((t) => i.includes(t) || t.includes(i))) n += 1;
    }
    return n;
  };

  return [...CURATED_SCHOLARSHIPS].sort((a, b) => score(b) - score(a));
}
