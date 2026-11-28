"use client";

import { cn } from "@/lib/utils";

/**
 * An on/off setting. The whole row is the control (44px+ target), the
 * thumb slides with the spring easing, and it is a real role="switch".
 */
export default function Switch({
  checked,
  onChange,
  label,
  description,
  disabled,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="flex min-h-[44px] w-full items-center justify-between gap-6 py-2 text-left disabled:opacity-60"
    >
      <span>
        <span className="block font-medium text-ink">{label}</span>
        {description && <span className="mt-0.5 block text-sm text-graytext">{description}</span>}
      </span>
      <span
        aria-hidden
        className={cn(
          "relative inline-flex h-7 w-12 shrink-0 items-center rounded-pill transition-colors duration-small",
          checked ? "bg-accent" : "bg-grayline",
        )}
      >
        <span
          className={cn(
            "absolute left-1 h-5 w-5 rounded-pill bg-paper shadow-card transition-transform duration-medium ease-spring",
            checked ? "translate-x-5" : "translate-x-0",
          )}
        />
      </span>
    </button>
  );
}
