"use client";

import { useState } from "react";
import { MessageSquareQuote, Search } from "lucide-react";

interface CommandWord {
  word: string;
  marks: string;
  wants: string;
  earns: string;
  loses: string;
  starter: string;
}

/**
 * Cambridge IGCSE command words. The mark tiers are the usual allocations —
 * the point is the shape of the answer each word demands, which is what
 * students actually lose marks on.
 */
const WORDS: CommandWord[] = [
  {
    word: "State / Give / Name",
    marks: "1 mark",
    wants: "Recall a fact. Nothing more.",
    earns: "One correct term or value.",
    loses: "Writing a paragraph. You earn the same 1 mark and burn your time.",
    starter: "—",
  },
  {
    word: "Define",
    marks: "1–2 marks",
    wants: "The precise meaning, in the syllabus's own words.",
    earns: "The exact terminology. Examiners mark against fixed wording.",
    loses: "Explaining an example instead of giving the definition.",
    starter: "X is the …",
  },
  {
    word: "Describe",
    marks: "2–4 marks",
    wants: "Say WHAT happens. No reasons.",
    earns: "One mark per distinct correct point.",
    loses: "Giving causes. That's Explain — it earns nothing here.",
    starter: "The … increases as …",
  },
  {
    word: "Explain",
    marks: "3–6 marks",
    wants: "Say WHY it happens. Reasons and mechanism.",
    earns: "Each linked cause-and-effect step.",
    loses: "Describing what happens without a single 'because'.",
    starter: "This happens because …, which causes …",
  },
  {
    word: "Suggest",
    marks: "2–4 marks",
    wants: "Apply what you know to an unfamiliar situation.",
    earns: "Any scientifically//logically valid answer — there's no single right one.",
    loses: "Leaving it blank because it wasn't in your notes. It's not meant to be.",
    starter: "One possible reason is … because …",
  },
  {
    word: "Calculate / Work out",
    marks: "2–4 marks",
    wants: "A numerical answer with working shown.",
    earns: "Method marks for the working, even when the final number is wrong.",
    loses: "Writing only the answer. Wrong number = zero, with no method to credit.",
    starter: "Formula → substitution → answer + unit",
  },
  {
    word: "Show that",
    marks: "2–3 marks",
    wants: "Prove the given answer. The answer is already printed.",
    earns: "Every intermediate step.",
    loses: "Jumping to the printed answer — there's nothing to credit.",
    starter: "Since … then … therefore …",
  },
  {
    word: "Compare",
    marks: "3–4 marks",
    wants: "Similarities AND differences, both sides in the same sentence.",
    earns: "Each linked comparison.",
    loses: "Two separate descriptions that never touch each other.",
    starter: "Whereas A …, B …",
  },
  {
    word: "Analyse",
    marks: "4–6 marks",
    wants: "Break it into parts and examine how they relate.",
    earns: "Identifying patterns, trends, or relationships in the material.",
    loses: "Summarising the data instead of interrogating it.",
    starter: "The data shows … which suggests …",
  },
  {
    word: "Discuss",
    marks: "4–8 marks",
    wants: "Both sides, developed.",
    earns: "Each developed point on each side.",
    loses: "Arguing only the side you agree with.",
    starter: "On one hand … However …",
  },
  {
    word: "Evaluate",
    marks: "6–8 marks",
    wants: "Weigh evidence both ways, then judge.",
    earns: "Balanced argument PLUS a supported conclusion. The conclusion is a mark.",
    loses: "Listing pros and cons and stopping. No judgement = capped marks.",
    starter: "Overall, … is more significant because …",
  },
  {
    word: "Justify",
    marks: "3–6 marks",
    wants: "Support a choice with evidence.",
    earns: "Reasons tied to specific evidence.",
    loses: "Stating an opinion with no evidence behind it.",
    starter: "This is supported by … which shows …",
  },
  {
    word: "Outline",
    marks: "2–4 marks",
    wants: "The main points only, briefly.",
    earns: "Each main point.",
    loses: "Excessive detail — you're spending time you needed elsewhere.",
    starter: "Firstly … Secondly …",
  },
  {
    word: "Identify",
    marks: "1–2 marks",
    wants: "Pick out the relevant item from given material.",
    earns: "The correct selection.",
    loses: "Explaining your choice when nobody asked.",
    starter: "—",
  },
];

export default function CommandWordCoach() {
  const [q, setQ] = useState("");

  const filtered = WORDS.filter((w) =>
    (w.word + w.wants).toLowerCase().includes(q.toLowerCase().trim()),
  );

  return (
    <section className="rounded-2xl border border-grayline bg-paper p-5">
      <div className="flex items-start gap-2">
        <MessageSquareQuote className="w-4 h-4 mt-1 shrink-0" aria-hidden="true" />
        <div className="flex-1">
          <h2 className="font-semibold">Command-word coach</h2>
          <p className="text-sm text-graytext mt-1">
            Most dropped marks aren&apos;t knowledge gaps — they&apos;re answering
            the wrong question. <strong>Describe</strong> and{" "}
            <strong>Explain</strong> earn marks for completely different things.
          </p>
        </div>
      </div>

      <label className="block mt-4">
        <span className="sr-only">Search command words</span>
        <div className="relative">
          <Search
            className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-graymute"
            aria-hidden="true"
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search a command word — e.g. evaluate"
            className="w-full rounded-lg border border-grayline bg-paper pl-9 pr-4 py-2.5 outline-none focus:border-accent min-h-[44px]"
          />
        </div>
      </label>

      <div className="mt-4 space-y-2">
        {filtered.length === 0 && (
          <p className="text-sm text-graymute py-4">
            No command word matches “{q}”.
          </p>
        )}
        {filtered.map((w) => (
          <details
            key={w.word}
            className="rounded-xl border border-grayline group"
          >
            <summary className="cursor-pointer list-none px-4 py-3 flex items-center justify-between gap-3 min-h-[44px]">
              <span className="font-medium">{w.word}</span>
              <span className="text-xs text-graymute whitespace-nowrap">
                {w.marks}
              </span>
            </summary>
            <dl className="px-4 pb-4 pt-1 space-y-2 text-sm border-t border-grayline">
              <div>
                <dt className="text-graymute">What it wants</dt>
                <dd>{w.wants}</dd>
              </div>
              <div>
                <dt className="text-graymute">What earns the mark</dt>
                <dd>{w.earns}</dd>
              </div>
              <div>
                <dt className="text-graymute">Where marks are lost</dt>
                <dd>{w.loses}</dd>
              </div>
              {w.starter !== "—" && (
                <div>
                  <dt className="text-graymute">Sentence starter</dt>
                  <dd className="font-mono text-xs bg-graylite rounded px-2 py-1 inline-block mt-0.5">
                    {w.starter}
                  </dd>
                </div>
              )}
            </dl>
          </details>
        ))}
      </div>
    </section>
  );
}
