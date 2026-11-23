import type { Metadata } from "next";
import { Suspense } from "react";
import NavProgress from "@/components/layout/NavProgress";
import { SITE } from "@/lib/site";
import "./globals.css";

const DESCRIPTION =
  "Your AI study partner for IGCSE and IB, Grades 8–12. Study plans, AI-marked mock tests with a predicted grade, and a college guide — all in one place.";

export const metadata: Metadata = {
  title: "StudyRaven.ai — Built for students. Engineered for results.",
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
