import { cn } from "@/lib/utils";

// Examiner marks drawn as pen strokes (§8): tick, circle, underline. Colour
// comes from text-* (stroke = currentColor). With play, the stroke draws
// itself via stroke-dashoffset; under reduced motion it just appears.
const SHAPES = {
  tick: { viewBox: "0 0 26 24", d: "M3 13.5 L10 20 L23 4", w: 26, h: 24 },
  circle: {
    viewBox: "0 0 100 62",
    d: "M52 5 C80 5 96 18 95 33 C93 50 67 58 45 56 C21 54 4 45 5 29 C7 14 26 4 58 7",
    w: 100,
    h: 62,
  },
  underline: { viewBox: "0 0 100 12", d: "M2 8 C30 3 70 3 98 6", w: 100, h: 12 },
} as const;

export default function Stroke({
  variant,
  play = false,
  delayMs = 0,
  width,
  strokeWidth = 2.5,
  className,
}: {
  variant: keyof typeof SHAPES;
  play?: boolean;
  delayMs?: number;
  width?: number;
  strokeWidth?: number;
  className?: string;
}) {
  const s = SHAPES[variant];
  const w = width ?? s.w;
  return (
    <svg
      aria-hidden
      viewBox={s.viewBox}
      width={w}
      height={(w * s.h) / s.w}
      className={cn("stroke-mark overflow-visible", className)}
      fill="none"
    >
      <path
        d={s.d}
        pathLength={100}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        className={play ? "stroke-draw" : undefined}
        style={play ? ({ "--delay": `${delayMs}ms` } as React.CSSProperties) : undefined}
      />
    </svg>
  );
}
