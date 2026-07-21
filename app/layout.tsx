import type { Metadata } from "next";
import { Suspense } from "react";
import NavProgress from "@/components/layout/NavProgress";
import "./globals.css";

export const metadata: Metadata = {
  title: "StudyRaven.ai — Built for students. Engineered for results.",
  description:
    "Your AI study partner for IGCSE and IB, Grades 8–12. Personalized plans, smart reminders, mock grading, and college guidance — all in one place.",
  metadataBase: new URL("https://studyraven.ai"),
  openGraph: {
    title: "StudyRaven.ai",
    description: "Built for students. Engineered for results.",
    type: "website",
  },
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
