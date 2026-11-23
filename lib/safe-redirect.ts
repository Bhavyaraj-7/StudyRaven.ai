const BASE = "https://studyraven.invalid";

/**
 * Returns `input` only when it is a same-origin relative path such as
 * "/mocks?id=1"; anything else falls back. Blocks open redirects like
 * "//evil.com", "/\\evil.com", "https://evil.com" and "javascript:…".
 */
export function safeRedirectPath(
  input: string | null | undefined,
  fallback = "/dashboard",
): string {
  if (typeof input !== "string" || !input.startsWith("/")) return fallback;
  try {
    const url = new URL(input, BASE);
    if (url.origin !== BASE) return fallback;
    return url.pathname + url.search + url.hash;
  } catch {
    return fallback;
  }
}
