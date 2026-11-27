// The landing hero's soft, static mesh of area colours: one of the three
// places §5.2 allows a gradient. The colours sit at low strength so text on
// top keeps its contrast in both themes. Nothing moves.
export default function HeroMesh() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundImage: [
          "radial-gradient(38% 46% at 12% 18%, rgb(var(--area-study-bright) / 0.20), transparent 70%)",
          "radial-gradient(34% 40% at 88% 12%, rgb(var(--area-streak-bright) / 0.22), transparent 70%)",
          "radial-gradient(40% 46% at 82% 78%, rgb(var(--area-essays-bright) / 0.16), transparent 70%)",
          "radial-gradient(36% 42% at 22% 88%, rgb(var(--area-profile-bright) / 0.16), transparent 70%)",
        ].join(", "),
      }}
    />
  );
}
