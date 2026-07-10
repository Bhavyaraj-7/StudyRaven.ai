export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-graylite rounded-lg ${className}`}
      aria-hidden
    />
  );
}
