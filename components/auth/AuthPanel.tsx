import Link from "next/link";
import examples from "@/content/hero-examples.json";
import HeroMesh from "@/components/landing/HeroMesh";
import MarkedExample, { type Example } from "@/components/landing/MarkedExample";
import SpectrumRibbon from "@/components/ui/SpectrumRibbon";

/**
 * Left half of the sign-in pages on desktop (§9.1): never an empty panel.
 * A colourful paper scene with one example question in its finished,
 * marked state (no looping animation) and one true line.
 */
export default function AuthPanel({ title, line }: { title: string; line: string }) {
  return (
    <section className="relative hidden overflow-hidden bg-paper md:flex md:flex-col md:justify-between md:p-12">
      <HeroMesh />
      <div className="absolute inset-x-0 top-0">
        <SpectrumRibbon />
      </div>
      <Link href="/" className="relative flex items-center gap-2 text-lg font-semibold">
        <span className="grid h-7 w-7 place-items-center rounded-input bg-ink font-mono text-sm text-paper">S</span>
        StudyRaven<span className="text-graymute">.ai</span>
      </Link>
      <div className="relative max-w-[480px]">
        <h2 className="text-h2 font-semibold">{title}</h2>
        <p className="mt-3 text-lg text-graytext">{line}</p>
        <div className="mt-8 origin-top-left scale-[0.92]">
          <MarkedExample example={(examples as Example[])[0]} />
        </div>
      </div>
      <p className="relative text-sm text-graytext">Free plan · No card needed</p>
    </section>
  );
}
