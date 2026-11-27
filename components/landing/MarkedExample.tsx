import Link from "next/link";
import Stroke from "@/components/ui/Stroke";

export interface Example {
  subject: string;
  question: string;
  marks: number;
  answer: string;
  points: { label: string; earned: boolean; note?: string }[];
}

const TICK_START = 350;
const TICK_GAP = 220;

/**
 * One marked exam question: ticks on earned points, graphite notes with a
 * blue Fix it on missed ones, the total circled in the examiner's blue pen. With
 * play, the ticks draw in order, then the score pops and gets circled;
 * without it (or under reduced motion) it shows the finished marking.
 */
export default function MarkedExample({ example: ex, play = false }: { example: Example; play?: boolean }) {
  const earned = ex.points.filter((p) => p.earned).length;
  const totalDelay = TICK_START + ex.points.length * TICK_GAP;
  return (
    <figure
      className="relative overflow-hidden rounded-paper bg-paper shadow-float ring-1 ring-grayline"
    >
      <figcaption className="flex items-center justify-between border-b border-grayline px-5 py-3 text-sm text-graymute">
        <span>Example · {ex.subject}</span>
        <span className="tabular-nums">Question 3</span>
      </figcaption>

      <div
        className="grid grid-cols-[auto_1fr] gap-x-4 px-5 py-5"
        // Faint ruled answer lines, every 32px, like exam paper (§5.4).
        style={{ backgroundImage: "repeating-linear-gradient(to bottom, transparent 0 31px, rgb(var(--grayline) / 0.7) 31px 32px)" }}
      >
        <div className="font-display text-title font-semibold tabular-nums text-graymute">3</div>
        <div className="min-w-0">
          <p className="font-medium text-ink">
            {ex.question}{" "}
            <span className="tabular-nums text-graymute">[{ex.marks}]</span>
          </p>
          <p className="mt-3 rounded-input bg-paper-2 px-4 py-3 text-[15px] text-graytext">{ex.answer}</p>

          <ul className="mt-4 space-y-2.5">
            {ex.points.map((p, i) => (
              <li key={p.label} className="flex items-start gap-3 text-[15px]">
                {p.earned ? (
                  <span className="mt-0.5 text-examiner">
                    <Stroke variant="tick" width={22} strokeWidth={3} play={play} delayMs={TICK_START + i * TICK_GAP} />
                  </span>
                ) : (
                  <span aria-hidden className="mt-2.5 h-0.5 w-5 shrink-0 rounded-pill bg-graymute" />
                )}
                <div className="min-w-0">
                  <span className="sr-only">{p.earned ? "Mark earned: " : "Mark missed: "}</span>
                  <span className={p.earned ? "text-ink" : "text-graytext"}>{p.label}</span>
                  {!p.earned && p.note && (
                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-graytext">
                      <span>{p.note}</span>
                      <Link
                        href="/signup"
                        className="press rounded-pill bg-accent px-3 py-1 text-xs font-semibold text-on-accent"
                      >
                        Fix it
                      </Link>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-grayline px-5 py-4">
        <span className="text-sm text-graytext">Marked against {ex.points.length} mark-scheme points</span>
        <span className="relative inline-flex h-12 w-20 items-center justify-center">
          <span
            className={`font-display text-title font-semibold tabular-nums text-examiner ${play ? "pop-in" : ""}`}
            style={play ? ({ "--delay": `${totalDelay}ms` } as React.CSSProperties) : undefined}
          >
            {earned}/{ex.marks}
          </span>
          <span className="absolute inset-0 text-examiner-stroke">
            <Stroke variant="circle" width={80} play={play} delayMs={totalDelay + 150} />
          </span>
        </span>
      </div>
      <p className="sr-only" aria-live="polite">
        Example marked: {earned} out of {ex.marks}.
      </p>
    </figure>
  );
}
