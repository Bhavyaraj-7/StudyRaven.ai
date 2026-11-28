/**
 * Dev-only review pages (/dev/*) show on local dev, Vercel preview
 * deployments, or with SHOW_DEV_PAGES=1. Production returns 404.
 */
export function devPagesEnabled(): boolean {
  return (
    process.env.NODE_ENV !== "production" ||
    process.env.VERCEL_ENV === "preview" ||
    process.env.SHOW_DEV_PAGES === "1"
  );
}
