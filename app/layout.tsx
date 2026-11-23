import type { Metadata } from "next";
import { Suspense } from "react";
import NavProgress from "@/components/layout/NavProgress";
import { SITE } from "@/lib/site";
import "./globals.css";

const DESCRIPTION =
  "Study plans and AI-marked mock tests with a predicted grade for IGCSE and IB students in Grades 8–12, plus a college guide.";

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
    <html lang="en">
      <body className="bg-paper text-ink antialiased">
        <Suspense fallback={null}>
          <NavProgress />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
