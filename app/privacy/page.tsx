import type { Metadata } from "next";
import LegalPage from "@/components/legal/LegalPage";

export const metadata: Metadata = { title: "Privacy policy — StudyRaven" };

export default function Page() {
  return <LegalPage slug="privacy" />;
}
