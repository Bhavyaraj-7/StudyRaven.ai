import type { Metadata } from "next";
import LegalPage from "@/components/legal/LegalPage";

export const metadata: Metadata = { title: "Refund and cancellation policy — StudyRaven" };

export default function Page() {
  return <LegalPage slug="refunds" />;
}
