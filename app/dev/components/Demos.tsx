"use client";

import { useState } from "react";
import Segmented from "@/components/ui/Segmented";
import Progress from "@/components/ui/Progress";
import Stroke from "@/components/ui/Stroke";
import Button from "@/components/ui/Button";
import Celebrate from "@/components/ui/Celebrate";
import PenLoader from "@/components/ui/PenLoader";
import MarkedScore from "@/components/mocks/MarkedScore";
import WelcomeOverlay, { type WelcomeMode } from "@/components/welcome/WelcomeOverlay";

const SUBJECTS = ["Physics", "Chemistry", "Maths", "Biology", "Economics"].map((s) => ({ value: s, label: s }));

export function SegmentedDemo() {
  const [v, setV] = useState("Physics");
  return <Segmented label="Subject" options={SUBJECTS} value={v} onChange={setV} />;
}

export function ProgressDemo() {
  const [v, setV] = useState(35);
  return (
    <div className="space-y-4">
      <Progress label="Profile strength" value={v} />
      <Button variant="secondary" onClick={() => setV((x) => (x >= 100 ? 10 : x + 25))}>
        Add progress
      </Button>
    </div>
  );
}

export function StrokeDemo() {
  const [run, setRun] = useState(0);
  return (
    <div className="flex flex-wrap items-center gap-8" key={run}>
      <span className="text-examiner">
        <Stroke variant="tick" play width={40} />
      </span>
      <span className="relative inline-flex items-center justify-center text-examiner">
        <span className="absolute font-display text-h3 tabular-nums text-examiner">31</span>
        <Stroke variant="circle" play delayMs={200} width={110} />
      </span>
      <span className="text-accent">
        <Stroke variant="underline" play delayMs={400} width={140} />
      </span>
      <Button variant="quiet" onClick={() => setRun((r) => r + 1)}>
        Replay
      </Button>
    </div>
  );
}

export function MarkedDemo() {
  const [run, setRun] = useState(0);
  const [party, setParty] = useState(0);
  return (
    <div className="space-y-4">
      <div key={`marked-${run}`}>
        <MarkedScore
          score={31}
          maxScore={40}
          predictedGrade="A"
          feedback="Strong on forces and energy. Two method marks dropped on units in question 4."
        />
      </div>
      <div className="flex flex-wrap items-center gap-6">
        <Button variant="secondary" onClick={() => setRun((r) => r + 1)}>
          Replay marking
        </Button>
        <Button variant="secondary" onClick={() => setParty((p) => p + 1)}>
          Celebrate
        </Button>
        <PenLoader label="Marking your answers" />
      </div>
      <Celebrate key={`party-${party}`} fire={party > 0} />
    </div>
  );
}

export function AlertDemo() {
  const [n, setN] = useState(0);
  return (
    <div className="space-y-4">
      <Button variant="secondary" onClick={() => setN((x) => x + 1)}>
        Show an error
      </Button>
      {n > 0 && (
        <div key={n} role="alert" className="max-w-md rounded-lg border border-danger/30 bg-danger/5 p-3 text-sm text-danger">
          That file is over 10 MB. Try a smaller PDF.
        </div>
      )}
    </div>
  );
}

export function WelcomeDemo() {
  const [mode, setMode] = useState<WelcomeMode | null>(null);
  return (
    <div className="flex flex-wrap gap-4">
      <Button variant="secondary" onClick={() => setMode("film")}>
        Play welcome film
      </Button>
      <Button variant="secondary" onClick={() => setMode("still")}>
        Show still version
      </Button>
      {mode && (
        <WelcomeOverlay
          name="Aarav Mehta"
          subjects={["Physics", "Chemistry", "Economics", "Additional Maths"]}
          mode={mode}
          onClose={() => setMode(null)}
        />
      )}
    </div>
  );
}
