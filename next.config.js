/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: { remotePatterns: [{ protocol: "https", hostname: "**" }] },
  // Baseline security headers (master prompt §14). A full script-src CSP
  // needs per-request nonces for Next's inline scripts; that's a later step.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          // camera=(self) is for Snap & Mark (photo marking) later.
          { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=(), browsing-topics=()" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'" },
        ],
      },
    ];
  },
  // /college-guide was a dead public path (404); send it to the college
  // section on the landing page.
  async redirects() {
    return [{ source: "/college-guide", destination: "/#college", permanent: true }];
  },
};
module.exports = nextConfig;


