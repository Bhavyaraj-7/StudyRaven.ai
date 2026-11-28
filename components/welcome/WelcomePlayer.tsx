"use client";

import { useEffect, useRef } from "react";
import { Player, type PlayerRef } from "@remotion/player";
import WelcomeFilm, { WELCOME_FPS, WELCOME_FRAMES, WELCOME_SIZE } from "./WelcomeFilm";
import type { WelcomeProps } from "./shared";

/**
 * Loaded only when the film actually plays (next/dynamic, no SSR), so
 * Remotion never touches any other page's bundle.
 *
 * Licence: Remotion is free for individuals and companies of up to three
 * people. The founder confirmed StudyRaven qualifies (3 or fewer people work
 * on it); revisit if the team grows past three.
 */
export default function WelcomePlayer({ onEnded, ...props }: WelcomeProps & { onEnded: () => void }) {
  const ref = useRef<PlayerRef>(null);

  useEffect(() => {
    const player = ref.current;
    if (!player) return;
    player.addEventListener("ended", onEnded);
    return () => player.removeEventListener("ended", onEnded);
  }, [onEnded]);

  return (
    <Player
      ref={ref}
      component={WelcomeFilm}
      inputProps={props}
      durationInFrames={WELCOME_FRAMES}
      fps={WELCOME_FPS}
      compositionWidth={WELCOME_SIZE}
      compositionHeight={WELCOME_SIZE}
      autoPlay
      initiallyMuted
      controls={false}
      clickToPlay={false}
      doubleClickToFullscreen={false}
      spaceKeyToPlayOrPause={false}
      moveToBeginningWhenEnded={false}
      acknowledgeRemotionLicense
      style={{ width: "100%", height: "100%" }}
    />
  );
}
