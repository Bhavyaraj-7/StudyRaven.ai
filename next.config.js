/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: { remotePatterns: [{ protocol: "https", hostname: "**" }] },
  // /college-guide was a dead public path (404); send it to the college
  // section on the landing page.
  async redirects() {
    return [{ source: "/college-guide", destination: "/#college", permanent: true }];
  },
};
module.exports = nextConfig;


