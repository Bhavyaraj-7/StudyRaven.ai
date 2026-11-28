import { AbsoluteFill, Easing, Sequence, interpolate, useCurrentFrame } from "remotion";
import { firstName, type WelcomeProps } from "./shared";

/**
 * The welcome film (§7.4): nine seconds, played once right after sign-up.
 * Everything is driven by the frame number (no CSS transitions, no
 * Math.random), so every frame is reproducible. Colours and fonts come from
 * the page's own tokens, so it follows light and dark mode.
 */
export const WELCOME_FPS = 30;
export const WELCOME_FRAMES = 9 * WELCOME_FPS;
export const WELCOME_SIZE = 1080;

const EASE = Easing.bezier(0.16, 1, 0.3, 1);
const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE } as const;
const DISPLAY = "var(--font-display), var(--font-inter), sans-serif";
const TEXT = "var(--font-inter), system-ui, sans-serif";
const rgb = (token: string, alpha = 1) => (alpha === 1 ? `rgb(var(${token}))` : `rgb(var(${token}) / ${alpha})`);

/** Fade and rise in over `dur` frames, starting at `start`. */
function rise(frame: number, start: number, dur = 16) {
  return {
    opacity: interpolate(frame, [start, start + dur], [0, 1], CLAMP),
    translate: `0px ${interpolate(frame, [start, start + dur], [28, 0], CLAMP)}px`,
  };
}

/** Fade a whole scene out over its last frames. */
function exit(frame: number, end: number, dur = 10) {
  return interpolate(frame, [end - dur, end], [1, 0], CLAMP);
}

/** A pen stroke that draws itself between two frames. */
function Pen({
  d,
  viewBox,
  frame,
  from,
  to,
  width,
  colour = "--examiner-stroke",
  strokeWidth = 6,
}: {
  d: string;
  viewBox: string;
  frame: number;
  from: number;
  to: number;
  width: number;
  colour?: string;
  strokeWidth?: number;
}) {
  return (
    <svg viewBox={viewBox} width={width} style={{ overflow: "visible", display: "block" }} fill="none" aria-hidden>
      <path
        d={d}
        pathLength={100}
        stroke={rgb(colour)}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={100}
        strokeDashoffset={interpolate(frame, [from, to], [100, 0], CLAMP)}
        opacity={frame > from ? 1 : 0}
      />
    </svg>
  );
}

const TICK = { d: "M3 13.5 L10 20 L23 4", viewBox: "0 0 26 24" };
const CIRCLE = {
  d: "M52 5 C80 5 96 18 95 33 C93 50 67 58 45 56 C21 54 4 45 5 29 C7 14 26 4 58 7",
  viewBox: "0 0 100 62",
};
const UNDERLINE = { d: "M2 8 C30 3 70 3 98 6", viewBox: "0 0 100 12" };

function Greeting({ name }: { name: string }) {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: exit(f, 66) }}>
      <div style={{ ...rise(f, 0, 14), fontFamily: TEXT, fontSize: 34, fontWeight: 600, color: rgb("--graytext") }}>
        StudyRaven
      </div>
      <div
        style={{
          ...rise(f, 6, 18),
          marginTop: 28,
          fontFamily: DISPLAY,
          fontSize: 104,
          fontWeight: 600,
          letterSpacing: "-0.02em",
          color: rgb("--ink"),
          textAlign: "center",
          lineHeight: 1.05,
          maxWidth: 900,
        }}
      >
        {name ? `Welcome, ${name}.` : "Welcome."}
      </div>
      <div style={{ marginTop: 18 }}>
        <Pen {...UNDERLINE} frame={f} from={22} to={44} width={420} colour="--accent" strokeWidth={7} />
      </div>
    </AbsoluteFill>
  );
}

const QUESTION = "State Newton's second law of motion.";
const ANSWER = "The resultant force equals mass × acceleration, F = ma.";

function Marking() {
  const f = useCurrentFrame();
  const typed = Math.floor(interpolate(f, [14, 50], [0, ANSWER.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const caretOn = f < 52 && Math.floor(f / 8) % 2 === 0;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: 90, opacity: exit(f, 116) }}>
      <div
        style={{
          ...rise(f, 0, 16),
          width: "100%",
          borderRadius: 36,
          border: `3px solid ${rgb("--grayline")}`,
          background: rgb("--paper"),
          padding: "56px 60px",
          fontFamily: TEXT,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 30, color: rgb("--graymute") }}>
          <span>Question 3</span>
          <span>[2 marks]</span>
        </div>
        <div style={{ marginTop: 18, fontSize: 40, fontWeight: 600, color: rgb("--ink"), lineHeight: 1.3 }}>{QUESTION}</div>
        <div
          style={{
            marginTop: 34,
            paddingBottom: 18,
            borderBottom: `3px solid ${rgb("--grayline")}`,
            fontSize: 38,
            color: rgb("--ink"),
            lineHeight: 1.4,
            minHeight: 110,
          }}
        >
          {ANSWER.slice(0, typed)}
          <span style={{ opacity: caretOn ? 1 : 0, color: rgb("--accent") }}>|</span>
        </div>
        <div style={{ marginTop: 34, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 22 }}>
            <Pen {...TICK} frame={f} from={54} to={62} width={64} />
            <Pen {...TICK} frame={f} from={62} to={70} width={64} />
          </div>
          <div style={{ position: "relative", padding: "18px 40px" }}>
            <span
              style={{
                fontFamily: DISPLAY,
                fontSize: 72,
                fontWeight: 600,
                color: rgb("--examiner"),
                opacity: interpolate(f, [66, 74], [0, 1], CLAMP),
              }}
            >
              2/2
            </span>
            <div style={{ position: "absolute", inset: 0 }}>
              <svg viewBox={CIRCLE.viewBox} preserveAspectRatio="none" width="100%" height="100%" style={{ overflow: "visible" }} fill="none" aria-hidden>
                <path
                  d={CIRCLE.d}
                  pathLength={100}
                  stroke={rgb("--examiner-stroke")}
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeDasharray={100}
                  strokeDashoffset={interpolate(f, [72, 88], [100, 0], CLAMP)}
                  opacity={f > 72 ? 1 : 0}
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div style={{ ...rise(f, 64, 14), marginTop: 40, fontFamily: TEXT, fontSize: 36, color: rgb("--graytext"), textAlign: "center" }}>
        Every answer marked against the mark scheme.
      </div>
    </AbsoluteFill>
  );
}

function Subjects({ subjects }: { subjects: string[] }) {
  const f = useCurrentFrame();
  const shown = subjects.slice(0, 6);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: 90, opacity: exit(f, 54) }}>
      <div style={{ ...rise(f, 0, 14), fontFamily: DISPLAY, fontSize: 76, fontWeight: 600, color: rgb("--ink"), textAlign: "center" }}>
        {shown.length ? "Your subjects are ready." : "Add your subjects any time."}
      </div>
      {shown.length > 0 && (
        <div style={{ marginTop: 48, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 20, maxWidth: 900 }}>
          {shown.map((s, i) => (
            <div
              key={s}
              style={{
                ...rise(f, 8 + i * 4, 12),
                scale: interpolate(f, [8 + i * 4, 20 + i * 4], [0.92, 1], CLAMP),
                padding: "18px 34px",
                borderRadius: 999,
                border: `3px solid ${rgb("--accent", 0.35)}`,
                background: rgb("--area-study-tint"),
                color: rgb("--ink"),
                fontFamily: TEXT,
                fontSize: 36,
                fontWeight: 600,
              }}
            >
              {s}
            </div>
          ))}
        </div>
      )}
    </AbsoluteFill>
  );
}

function Ready({ name }: { name: string }) {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: 90 }}>
      <Pen {...TICK} frame={f} from={4} to={16} width={120} colour="--accent" strokeWidth={5} />
      <div
        style={{
          ...rise(f, 8, 16),
          marginTop: 40,
          fontFamily: DISPLAY,
          fontSize: 76,
          fontWeight: 600,
          color: rgb("--ink"),
          textAlign: "center",
          lineHeight: 1.1,
        }}
      >
        Take your first mock when you&apos;re ready.
      </div>
      <div style={{ ...rise(f, 18, 14), marginTop: 28, fontFamily: TEXT, fontSize: 36, color: rgb("--graytext") }}>
        {name ? `Good luck, ${name}.` : "Good luck."}
      </div>
    </AbsoluteFill>
  );
}

export default function WelcomeFilm({ name, subjects }: WelcomeProps) {
  const first = firstName(name);
  return (
    <AbsoluteFill style={{ background: rgb("--paper") }}>
      <Sequence durationInFrames={66}>
        <Greeting name={first} />
      </Sequence>
      <Sequence from={60} durationInFrames={116}>
        <Marking />
      </Sequence>
      <Sequence from={170} durationInFrames={54}>
        <Subjects subjects={subjects} />
      </Sequence>
      <Sequence from={218}>
        <Ready name={first} />
      </Sequence>
    </AbsoluteFill>
  );
}
