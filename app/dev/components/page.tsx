import { notFound } from "next/navigation";
import { devPagesEnabled } from "@/lib/dev";
import Button from "@/components/ui/Button";
import Card, { type Area } from "@/components/ui/Card";
import SpectrumRibbon from "@/components/ui/SpectrumRibbon";
import { AlertDemo, MarkedDemo, ProgressDemo, SegmentedDemo, StrokeDemo } from "./Demos";

export const dynamic = "force-dynamic";
export const metadata = { title: "Components (dev)", robots: { index: false } };

const AREAS: { area: Area; name: string; job: string }[] = [
  { area: "study", name: "Study", job: "Mocks, marking, Fix it" },
  { area: "compete", name: "Compete", job: "Olympiads and tests" },
  { area: "profile", name: "Profile", job: "Activities and honours" },
  { area: "essays", name: "Essays", job: "Essay coach, EC help" },
  { area: "pitch", name: "Pitch", job: "Pitch builder" },
  { area: "streak", name: "Streaks", job: "Achievements" },
  { area: "parents", name: "Parents", job: "Reports and reminders" },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-grayline py-12">
      <h2 className="mb-6 text-title font-semibold">{title}</h2>
      {children}
    </section>
  );
}

export default function ComponentsPage() {
  if (!devPagesEnabled()) notFound();
  return (
    <main className="min-h-screen bg-paper text-ink">
      <SpectrumRibbon />
      <div className="mx-auto max-w-[1200px] px-5 py-12">
        <h1 className="text-h2 font-semibold">Components</h1>
        <p className="mt-2 max-w-[68ch] text-graytext">
          Every building block in every state. Hover, press and tab through them. Turn on reduced motion to check
          the still versions.
        </p>

        <Section title="Buttons">
          <div className="flex flex-wrap items-start gap-4">
            <Button>Mark my answer</Button>
            <Button size="lg">Start free</Button>
            <Button variant="secondary">Log in</Button>
            <Button variant="quiet">See how marking works</Button>
            <Button loading>Marking</Button>
            <Button disabledReason="Answer at least one question first">Mark my answer</Button>
          </div>
        </Section>

        <Section title="Area colours">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {AREAS.map(({ area, name, job }) => (
              <Card key={area} area={area}>
                <div className="text-sm font-semibold text-area-deep">{name}</div>
                <p className="mt-1 text-sm text-graytext">{job}</p>
                <div className="mt-4">
                  <Button variant="area">Open {name.toLowerCase()}</Button>
                </div>
              </Card>
            ))}
          </div>
        </Section>

        <Section title="Switcher (M2)">
          <div className="space-y-4">
            {(["study", "compete", "essays"] as Area[]).map((a) => (
              <div key={a} data-area={a}>
                <SegmentedDemo />
              </div>
            ))}
          </div>
        </Section>

        <Section title="Progress (M20)">
          <div className="grid gap-8 sm:grid-cols-2">
            <div data-area="profile">
              <ProgressDemo />
            </div>
            <div data-area="streak">
              <ProgressDemo />
            </div>
          </div>
        </Section>

        <Section title="Examiner strokes">
          <StrokeDemo />
        </Section>

        <Section title="Marked score (M21, M22, M23)">
          <MarkedDemo />
        </Section>

        <Section title="Error message (M24)">
          <AlertDemo />
        </Section>
      </div>
    </main>
  );
}
