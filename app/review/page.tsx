import { notFound } from "next/navigation";
import { staffUser } from "@/lib/accuracy/auth";
import ReviewDesk from "./ReviewDesk";

export const dynamic = "force-dynamic";
export const metadata = { title: "Review desk", robots: { index: false } };

// Teachers mark anonymised answers blind (§10A.3). Only reviewers and
// admins in staff_roles can see this page; everyone else gets a 404.
export default async function ReviewPage() {
  if (!(await staffUser("reviewer"))) notFound();
  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="mx-auto max-w-[760px] px-5 py-12 md:py-16">
        <h1 className="text-h3 font-semibold">Review desk</h1>
        <p className="mt-2 text-graytext">
          Mark each answer as you would a real script. You won&apos;t see the AI&apos;s mark or anyone else&apos;s:
          that&apos;s what keeps the comparison fair.
        </p>
        <ReviewDesk />
      </div>
    </main>
  );
}
