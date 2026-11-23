import type { Metadata } from "next";
import LegalPage from "@/components/legal/LegalPage";

export const metadata: Metadata = { title: "Terms of use — StudyRaven" };

export default function Page() {
  return <LegalPage slug="terms" />;
}
