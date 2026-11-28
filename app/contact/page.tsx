import type { Metadata } from "next";
import Link from "next/link";
import { CreditCard, GraduationCap, LifeBuoy, PenLine, ShieldCheck, Users, type LucideIcon } from "lucide-react";
import StickyNav from "@/components/landing/StickyNav";
import SiteFooter from "@/components/site/SiteFooter";
import CopyEmail from "@/components/site/CopyEmail";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact — StudyRaven",
  description: "Email StudyRaven support about your account, billing, your data, a mark you think is wrong, or anything else.",
};

const mailto = (subject: string) => `mailto:${SITE.contactEmail}?subject=${encodeURIComponent(subject)}`;

const TOPICS: { icon: LucideIcon; title: string; body: React.ReactNode; subject: string }[] = [
  {
    icon: LifeBuoy,
    title: "Help with the app",
    body: "Something broken, confusing or missing. A screenshot and the page you were on help a lot.",
    subject: "Help: ",
  },
  {
    icon: PenLine,
    title: "A mark looks wrong",
    body: "Send the question, your answer and the mark you got. We check every report, and they make the marking better.",
    subject: "Marking: ",
  },
  {
    icon: CreditCard,
    title: "Billing and refunds",
    body: (
      <>
        Include the Razorpay payment ID from your receipt. Read the{" "}
        <Link href="/refunds" className="font-medium text-ink underline underline-offset-4">
          refund policy
        </Link>
        .
      </>
    ),
    subject: "Billing: ",
  },
  {
    icon: ShieldCheck,
    title: "Your data and privacy",
    body: (
      <>
        Ask to see, correct or delete your data, or withdraw consent. See the{" "}
        <Link href="/privacy" className="font-medium text-ink underline underline-offset-4">
          privacy policy
        </Link>
        .
      </>
    ),
    subject: "Data request: ",
  },
  {
    icon: Users,
    title: "Parents and guardians",
    body: "You're welcome to write to us about your child's account, including their data.",
    subject: "Parent: ",
  },
  {
    icon: GraduationCap,
    title: "Schools and teachers",
    body: "Using StudyRaven with a class, or want to help us check our marking? We'd love to hear from you.",
    subject: "School: ",
  },
];

export default function ContactPage() {
  return (
    <main className="bg-paper text-ink">
      <StickyNav />

      <section className="page-in mx-auto max-w-[1200px] px-5 pb-12 pt-32 md:pt-40">
        <p className="text-sm font-semibold text-accent">Contact</p>
        <h1 className="mt-4 max-w-[16ch] font-display text-h1 font-semibold">Write to us about anything.</h1>
        <p className="mt-6 max-w-[56ch] text-lg text-graytext">
          A bug, your bill, your data or a feature you want. The people who build StudyRaven read every email.
        </p>

        <div className="mt-10 rounded-object border border-grayline bg-study-tint p-6 sm:p-8">
          <p className="text-sm font-medium text-graytext">Support email</p>
          <a
            href={`mailto:${SITE.contactEmail}`}
            className="mt-2 block break-all font-display text-h3 font-semibold text-ink underline-offset-4 hover:underline"
          >
            {SITE.contactEmail}
          </a>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button href={`mailto:${SITE.contactEmail}`}>Write an email</Button>
            <CopyEmail email={SITE.contactEmail} />
          </div>
        </div>
      </section>

      <section aria-labelledby="topics-title" className="mx-auto max-w-[1200px] px-5 pb-16 md:pb-24">
        <h2 id="topics-title" className="mt-6 text-title font-semibold">
          Pick a topic and we&apos;ll start the email for you
        </h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TOPICS.map(({ icon: Icon, title, body, subject }, i) => (
            <li key={title}>
              <Reveal delayMs={Math.min(i, 5) * 50} className="h-full">
                <div className="lift flex h-full flex-col rounded-object border border-grayline bg-paper p-6">
                  <Icon className="h-5 w-5 text-accent" aria-hidden />
                  <h3 className="mt-4 font-semibold">{title}</h3>
                  <p className="mt-2 flex-1 text-sm text-graytext">{body}</p>
                  <a
                    href={mailto(subject)}
                    className="mt-5 inline-flex min-h-[44px] items-center text-sm font-semibold text-accent underline-offset-4 hover:underline"
                  >
                    Email about this
                    <span className="sr-only">: {title}</span>
                  </a>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>

        {SITE.operator && (
          <p className="mt-12 text-sm text-graytext">
            StudyRaven is run by {SITE.operator}
            {SITE.operatorCity ? `, ${SITE.operatorCity}` : ""}, India.
          </p>
        )}
      </section>

      <SiteFooter />
    </main>
  );
}
