import Link from "next/link";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "area" | "secondary" | "quiet";
type Size = "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  // Raven blue: every main action (§5.2).
  primary: "bg-accent text-on-accent shadow-card hover:bg-accent/90",
  // The current area's bright colour with dark text (works in both themes).
  area: "bg-area-bright text-on-area shadow-card hover:brightness-105",
  secondary: "border-[1.5px] border-control-line text-ink hover:bg-paper-2",
  quiet: "text-accent underline-offset-4 hover:underline",
};
const SIZES: Record<Size, string> = {
  md: "h-11 px-5 text-[15px]",
  lg: "h-12 px-6 text-base",
};

interface Props {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  /** A disabled button always says why, next to it (§8). */
  disabledReason?: string;
  className?: string;
}

export default function Button({
  children,
  href,
  onClick,
  type = "button",
  variant = "primary",
  size = "md",
  loading = false,
  disabledReason,
  className,
}: Props) {
  const disabled = Boolean(disabledReason) || loading;
  const classes = cn(
    "press inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-pill font-semibold transition-colors duration-small",
    variant !== "quiet" && SIZES[size],
    VARIANTS[variant],
    disabled && "pointer-events-none opacity-50",
    className,
  );
  const content = (
    <>
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </>
  );

  const control =
    href && !disabled ? (
      <Link href={href} className={classes}>
        {content}
      </Link>
    ) : (
      <button type={type} onClick={onClick} disabled={disabled} aria-busy={loading || undefined} className={classes}>
        {content}
      </button>
    );

  if (!disabledReason) return control;
  return (
    <span className="inline-flex flex-col items-start gap-1">
      {control}
      <span className="text-caption text-graymute">{disabledReason}</span>
    </span>
  );
}
