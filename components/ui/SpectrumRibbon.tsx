// All seven area colours in one thin band: marks big moments (§5.2).
const BANDS = [
  "bg-study-bright",
  "bg-compete-bright",
  "bg-profile-bright",
  "bg-essays-bright",
  "bg-pitch-bright",
  "bg-streak-bright",
  "bg-parents-bright",
];

export default function SpectrumRibbon({ className = "h-1.5" }: { className?: string }) {
  return (
    <div aria-hidden className={`flex w-full ${className}`}>
      {BANDS.map((b) => (
        <span key={b} className={`flex-1 ${b}`} />
      ))}
    </div>
  );
}
