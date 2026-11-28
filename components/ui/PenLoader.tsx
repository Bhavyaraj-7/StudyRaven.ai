/**
 * M23: while the AI works, a pen scribbles a line next to an honest status
 * (a real loading state, so it may loop). Under reduced motion the line
 * just sits there, drawn.
 */
export default function PenLoader({ label }: { label: string }) {
  return (
    <div role="status" aria-live="polite" className="inline-flex items-center gap-3 text-graytext">
      <svg viewBox="0 0 60 16" className="h-4 w-14 text-accent" fill="none" aria-hidden>
        <path
          d="M2 10 C8 2 12 14 18 8 S28 2 32 9 S42 14 46 6 S54 4 58 9"
          pathLength={100}
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          className="pen-scribble"
        />
      </svg>
      <span>{label}</span>
    </div>
  );
}
