import React from "react";
import { AbsoluteFill, Audio, Easing, staticFile } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import type { TransitionPresentation } from "@remotion/transitions";
import { flash, whip, zoomThrough } from "../components/Transitions";
import { FONT_FAMILY } from "../lib/fonts";
import { FilmGrain, K } from "./Cinema";
import { Caption } from "./scenes/Caption";
import { End } from "./scenes/End";
import { Eval } from "./scenes/Eval";
import { Grade } from "./scenes/Grade";
import { Hook } from "./scenes/Hook";
import { Reveal } from "./scenes/Reveal";
import { BRAG } from "./timeline";

const easeInOut = Easing.inOut(Easing.cubic);
const easeOut = Easing.out(Easing.cubic);

const SCENES: Record<string, React.FC> = { hook: Hook, reveal: Reveal, eval: Eval, grade: Grade, caption: Caption, end: End };

// 씬 i → i+1 전환
const PRESENTATIONS: Array<{ presentation: TransitionPresentation<Record<string, never>>; easing: (t: number) => number }> = [
  { presentation: flash(), easing: easeInOut },
  { presentation: zoomThrough(), easing: easeOut },
  { presentation: whip(), easing: easeInOut },
  { presentation: whip(), easing: easeInOut },
  { presentation: flash(), easing: easeInOut },
];

// 브래그컷 — 9:16 · 20s · 시네마틱. 타이밍은 cues.json 한 곳에서 관리한다.
export const Brag: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: FONT_FAMILY, background: K.night }}>
    <TransitionSeries>
      {BRAG.scenes.flatMap((s, i) => {
        const Scene = SCENES[s.id];
        const items = [
          <TransitionSeries.Sequence key={s.id} durationInFrames={s.frames}>
            <Scene />
          </TransitionSeries.Sequence>,
        ];
        if (i < BRAG.transitions.length) {
          const p = PRESENTATIONS[i];
          items.push(<TransitionSeries.Transition key={`${s.id}-t`} presentation={p.presentation} timing={linearTiming({ durationInFrames: BRAG.transitions[i], easing: p.easing })} />);
        }
        return items;
      })}
    </TransitionSeries>
    <FilmGrain opacity={0.1} />
    <Audio src={staticFile("audio/brag-mix.wav")} />
  </AbsoluteFill>
);
