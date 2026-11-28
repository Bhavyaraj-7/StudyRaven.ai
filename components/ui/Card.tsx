import { cn } from "@/lib/utils";

export type Area = "study" | "compete" | "profile" | "essays" | "pitch" | "streak" | "parents";

/**
 * Cards are for real objects (§5.4). The area colour shows as a stripe and,
 * on pointer devices, a soft ring when the card lifts on hover (M19).
 */
export default function Card({
  area,
  stripe = true,
  className,
  children,
}: {
  area?: Area;
  stripe?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div data-area={area} className={cn("lift relative rounded-object bg-paper p-6 shadow-card", className)}>
      {stripe && <div aria-hidden className="mb-4 h-1.5 w-10 rounded-pill bg-area-bright" />}
      {children}
    </div>
  );
}
