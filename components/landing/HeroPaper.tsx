"use client";

import { useEffect, useState } from "react";
import examples from "@/content/hero-examples.json";
import Segmented from "@/components/ui/Segmented";
import MarkedExample, { type Example } from "./MarkedExample";

const EXAMPLES = examples as Example[];

/**
 * "The paper that marks itself" (§7.1). Server-rendered in its final,
 * marked state, so it means something without JavaScript. After loading,
 * unless the visitor prefers reduced motion or saves data, the ticks draw
 * in, the score pops and the total gets circled. Switching subject replays.
 * Red ink is allowed here: it's a demo of graded work.
 */
export default function HeroPaper() {
  const [subject, setSubject] = useState(EXAMPLES[0].subject);
  const [play, setPlay] = useState(false);
  const [run, setRun] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (!reduce && !saveData) setPlay(true);
  }, []);

  const ex = EXAMPLES.find((e) => e.subject === subject) ?? EXAMPLES[0];

  return (
    <div>
      <div data-area="study" className="mb-4">
        <Segmented
          label="Example subject"
          options={EXAMPLES.map((e) => ({ value: e.subject, label: e.subject }))}
          value={subject}
          onChange={(v) => {
            setSubject(v);
            setRun((r) => r + 1);
          }}
        />
      </div>

      <MarkedExample key={`${subject}-${run}`} example={ex} play={play} />
    </div>
  );
}
