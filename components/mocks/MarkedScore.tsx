"use client";

import CountUp from "@/components/ui/CountUp";
import Stroke from "@/components/ui/Stroke";

/**
 * The product's hero moment (§7.2): a tick stamps "Marked", the real score
 * counts up, then the examiner's pen circles the total. The predicted grade
 * always carries its caveat. One polite announcement for screen readers.
 */
export default function MarkedScore({
  score,
  maxScore,
  predictedGrade,
  feedback,
}: {
  score: number;
  maxScore: number;
  predictedGrade?: string | null;
  feedback?: string;
}) {
  return (
    <div className="rounded-object border border-grayline bg-paper p-6 sm:p-8">
      <p className="sr-only" aria-live="polite">
        Marked: {score} out of {maxScore}.{predictedGrade ? ` Predicted grade ${predictedGrade}.` : ""}
      </p>
      <div className="flex items-center gap-2 text-sm font-medium text-graytext">
        <span className="text-examiner">
          <Stroke variant="tick" play width={18} strokeWidth={3} />
        </span>
        Marked
      </div>

      <div className="mt-6 flex flex-wrap items-end gap-x-12 gap-y-6">
        <div>
          <div className="relative inline-flex px-6 py-4">
            <span className="font-display text-h1 font-semibold tabular-nums text-examiner">
              <CountUp value={score} delayMs={250} />
              <span className="text-title text-graymute">/{maxScore}</span>
            </span>
            <svg
              aria-hidden
              viewBox="0 0 100 62"
              preserveAspectRatio="none"
              // No non-scaling-stroke here: with a stretched viewBox Chrome
              // measures the dash in screen pixels and the circle never closes.
              className="stroke-mark pointer-events-none absolute inset-0 h-full w-full overflow-visible text-examiner-stroke"
              fill="none"
            >
              <path
                d="M52 5 C80 5 96 18 95 33 C93 50 67 58 45 56 C21 54 4 45 5 29 C7 14 26 4 58 7"
                pathLength={100}
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                className="stroke-draw"
                style={{ "--delay": "900ms" } as React.CSSProperties}
              />
            </svg>
          </div>
          <div className="mt-1 text-sm text-graytext">Raw score</div>
        </div>

        {predictedGrade && (
          <div className="pop-in" style={{ "--delay": "1200ms" } as React.CSSProperties}>
            <div className="font-display text-h1 font-semibold">{predictedGrade}</div>
            <div className="mt-1 max-w-[24ch] text-sm text-graytext">Predicted from this mock, not an official grade</div>
          </div>
        )}
      </div>

      {feedback && <p className="mt-6 max-w-[68ch] text-graytext">{feedback}</p>}
    </div>
  );
}
