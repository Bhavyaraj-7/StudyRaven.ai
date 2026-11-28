/**
 * One honest line or two for every feature that exists today, used by the
 * About page. Keep it true: if a feature changes or is removed, change it
 * here in the same pull request.
 */
export type Access = "Free" | "Free, 5 AI uses a day" | "Pro";

export interface Feature {
  name: string;
  href: string;
  brief: string;
  access: Access;
}

export interface FeatureGroup {
  title: string;
  intro: string;
  features: Feature[];
}

export const FEATURE_GROUPS: FeatureGroup[] = [
  {
    title: "Practise and get marked",
    intro: "Answer real exam-style questions and see exactly where the marks went.",
    features: [
      {
        name: "Mock tests",
        href: "/mocks",
        brief:
          "A timed one-hour paper on any topic, or from a past paper you upload. Type your answers and get a score, topic-by-topic breakdown and feedback against the mark scheme.",
        access: "Free, 5 AI uses a day",
      },
      {
        name: "Mark schemes",
        href: "/marks",
        brief:
          "What examiners want for each command word (state, describe, explain, evaluate) and how many points each mark needs, so you stop losing marks to wording.",
        access: "Free",
      },
      {
        name: "AI tutor",
        href: "/papers",
        brief:
          "Ask a doubt, paste a question or attach a paper from your library, and get a step-by-step explanation of what the mark scheme is looking for.",
        access: "Free, 5 AI uses a day",
      },
      {
        name: "Daily drill",
        href: "/dashboard",
        brief: "Five quick questions a day on a subject and topic you pick, with a streak to keep you coming back.",
        access: "Free",
      },
    ],
  },
  {
    title: "Learn and remember",
    intro: "Turn your notes into material you can actually revise from.",
    features: [
      {
        name: "Studio",
        href: "/studio",
        brief:
          "Give a topic or upload your notes and get a study guide, summary, slides, flashcards, a mind map and a quiz from the same material.",
        access: "Free, 5 AI uses a day",
      },
      {
        name: "Flashcards",
        href: "/flashcards",
        brief: "Review your saved decks. Cards you miss come back sooner until you know them.",
        access: "Free",
      },
      {
        name: "Focus",
        href: "/focus",
        brief: "A 25-minute focus timer with 5-minute breaks. Pick one task and start.",
        access: "Free",
      },
    ],
  },
  {
    title: "Plan and track",
    intro: "Know what to do today and how far you've come.",
    features: [
      {
        name: "Home",
        href: "/dashboard",
        brief: "Your day at a glance: exam countdowns, this week's plan and your open tasks.",
        access: "Free",
      },
      {
        name: "Subjects",
        href: "/subjects",
        brief: "Add your subjects and exam dates once. Everything else uses them.",
        access: "Free",
      },
      {
        name: "Schedule",
        href: "/schedule",
        brief: "Generate a study plan around your test dates, set deadline reminders and email it to yourself.",
        access: "Free",
      },
      {
        name: "Stats",
        href: "/stats",
        brief: "Your average mock score, predicted grade, study streak and tasks done, with progress for each subject.",
        access: "Free",
      },
      {
        name: "Gmail and Google Classroom",
        href: "/dashboard",
        brief: "Connect them to bring school deadlines and assignments in automatically. In beta.",
        access: "Free",
      },
    ],
  },
  {
    title: "Beyond exams",
    intro: "For students already thinking about university.",
    features: [
      {
        name: "College guide",
        href: "/college",
        brief:
          "A readiness score, a roadmap from your grade to applications, a GPA calculator, an admissions counsellor to chat with, an application tracker, scholarships and live opportunities.",
        access: "Pro",
      },
      {
        name: "Essay coach",
        href: "/college",
        brief:
          "Feedback on your own essay drafts: structure, clarity and what's missing. It never writes the essay for you.",
        access: "Pro",
      },
    ],
  },
];

export const PRINCIPLES: { title: string; body: string }[] = [
  {
    title: "Honest marks",
    body: "Predicted grades always say they are predictions. We never invent numbers, reviews or results.",
  },
  {
    title: "Your work stays yours",
    body: "Other students can never see your answers. We don't sell data, run ads or use trackers.",
  },
  {
    title: "We help you learn, not cheat",
    body: "StudyRaven explains, marks and coaches. It will not write your essays or coursework.",
  },
  {
    title: "Priced for students in India",
    body: "Most of StudyRaven is free. Pro is ₹299 a month or ₹2,499 a year, and you can cancel anytime.",
  },
];
