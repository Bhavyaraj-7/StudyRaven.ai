// Server-only feature flags (master prompt §13). Set in Vercel as "1" or
// "true"; never prefixed NEXT_PUBLIC_, so they can't leak into the browser.
// Pages read them at build/revalidate time: changing one needs a redeploy.

export type Flag =
  | "FLAG_NEW_SHELL"
  | "FLAG_ACCURACY_PAGE"
  | "FLAG_GATE_PREDICTED_GRADES"
  | "FLAG_SNAP_MARK"
  | "FLAG_MOCK_SERIES"
  | "FLAG_FAMILY_CHECKOUT"
  | "FLAG_PROFILE"
  | "FLAG_ACTIVITIES"
  | "FLAG_RADAR"
  | "FLAG_COMPETE"
  | "FLAG_ESSAYS"
  | "FLAG_EC_HELP"
  | "FLAG_PITCH"
  | "FLAG_MEDIA_CLIPS";

/** Every flag is off unless explicitly turned on. */
export function flag(name: Flag): boolean {
  const v = process.env[name]?.trim().toLowerCase();
  return v === "1" || v === "true";
}
