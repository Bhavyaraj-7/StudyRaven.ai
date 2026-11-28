// Server-side environment access with clear errors. Never import this from
// a client component: none of these values may reach the browser.
// Every variable is listed (without values) in .env.example.

export type ServerEnvName =
  | "SUPABASE_SERVICE_ROLE_KEY"
  | "OPENROUTER_API_KEY"
  | "AI_PRIMARY_MODEL"
  | "AI_FALLBACK_MODEL"
  | "TAVILY_API_KEY"
  | "RESEND_API_KEY"
  | "RESEND_FROM_EMAIL"
  | "RAZORPAY_KEY_ID"
  | "RAZORPAY_KEY_SECRET"
  | "RAZORPAY_MONTHLY_PLAN_ID"
  | "RAZORPAY_YEARLY_PLAN_ID"
  | "RAZORPAY_WEBHOOK_SECRET"
  | "GOOGLE_CLIENT_ID"
  | "GOOGLE_CLIENT_SECRET"
  // Reserved for the Mesh API. Not used by any code yet: wiring it in
  // needs the founder's yes (new processor of student data, §0 rule 5).
  | "MESH_API_KEY";

export class EnvError extends Error {
  constructor(public variable: ServerEnvName) {
    super(`Missing server environment variable ${variable}`);
    this.name = "EnvError";
  }
}

/** The trimmed value, or undefined when unset or blank. */
export function env(name: ServerEnvName): string | undefined {
  const v = process.env[name]?.trim();
  return v ? v : undefined;
}

/** The value, or an EnvError naming the variable (never its value). */
export function requireEnv(name: ServerEnvName): string {
  const v = env(name);
  if (!v) throw new EnvError(name);
  return v;
}
