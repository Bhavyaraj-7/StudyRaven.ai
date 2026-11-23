import type { Metadata, Viewport } from "next";
import { Inter, Bricolage_Grotesque } from "next/font/google";
import { Suspense } from "react";
import NavProgress from "@/components/layout/NavProgress";
import GridOverlay from "@/components/dev/GridOverlay";
import { SITE } from "@/lib/site";
import { THEME_SCRIPT } from "@/lib/theme";
import "./globals.css";

// Two font files on every page (budget: <= 3 preloaded, <= 120 KB on /).
// Inter is preloaded (body text); Bricolage loads without preload.
const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });
const display = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
  // Not preloaded: preloading both fonts pushed LCP past 2.0 s on slow 4G.
  // Headings paint at once in a size-matched fallback, then swap.
  preload: false,
  // No opsz axis: it takes Bricolage from 41 KB to 77 KB (125 KB total, over budget).
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FCFCFA" },
    { media: "(prefers-color-scheme: dark)", color: "#0E0F12" },
  ],
};

const DESCRIPTION =
  "Study plans and AI-marked mock tests for IGCSE and IB students in Grades 8–12, plus a college guide.";

export const metadata: Metadata = {
  title: "StudyRaven: study plans and marked mocks for IGCSE and IB",
  description: DESCRIPTION,
  metadataBase: new URL(SITE.url),
  openGraph: {
    title: "StudyRaven.ai",
    description: DESCRIPTION,
    type: "website",
    siteName: "StudyRaven",
    locale: "en_IN",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${display.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Sets .dark before first paint (no flash). */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="bg-paper text-ink font-sans antialiased">
        <Suspense fallback={null}>
          <NavProgress />
        </Suspense>
        {children}
        <GridOverlay />
      </body>
    </html>
  );
}
