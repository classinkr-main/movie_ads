import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { Grain, PanelWipe } from "./components/Backgrounds";
import { FONT_FAMILY } from "./lib/fonts";
import { C } from "./lib/theme";
import { S1Hook } from "./scenes/S1Hook";
import { S2Question } from "./scenes/S2Question";
import { S3Reveal } from "./scenes/S3Reveal";
import { S4Pipeline } from "./scenes/S4Pipeline";
import { S5Dashboard } from "./scenes/S5Dashboard";
import { S6Activities } from "./scenes/S6Activities";
import { S7Value } from "./scenes/S7Value";
import { S8Cta } from "./scenes/S8Cta";

// 씬 타임라인 (30fps · 600f = 20s)
export const SCENES = [
  { id: "S1 훅", from: 0, duration: 72, Comp: S1Hook },
  { id: "S2 질문", from: 72, duration: 60, Comp: S2Question },
  { id: "S3 리빌", from: 132, duration: 90, Comp: S3Reveal },
  { id: "S4 파이프라인", from: 222, duration: 78, Comp: S4Pipeline },
  { id: "S5 리포트", from: 300, duration: 105, Comp: S5Dashboard },
  { id: "S6 AI 학습활동", from: 405, duration: 78, Comp: S6Activities },
  { id: "S7 밸류", from: 483, duration: 60, Comp: S7Value },
  { id: "S8 CTA", from: 543, duration: 57, Comp: S8Cta },
] as const;

const WIPE = 16;
const WIPES: Array<{ at: number; colors: [string, string]; direction: "ltr" | "rtl" | "ttb" }> = [
  { at: 72, colors: [C.brand, C.surface100], direction: "ltr" },
  { at: 132, colors: [C.forest, C.mint], direction: "rtl" },
  { at: 222, colors: [C.brand, C.surface100], direction: "ttb" },
  { at: 300, colors: [C.forest, C.page], direction: "ltr" },
  { at: 405, colors: [C.brand, C.surface100], direction: "rtl" },
  { at: 483, colors: [C.forest, C.mint], direction: "ttb" },
  { at: 543, colors: [C.forest, C.surface100], direction: "ltr" },
];

export const Showreel: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: FONT_FAMILY, background: C.forest }}>
    {SCENES.map((s) => (
      <Sequence key={s.id} name={s.id} from={s.from} durationInFrames={s.duration}>
        <s.Comp />
      </Sequence>
    ))}
    {WIPES.map((w) => (
      <Sequence key={w.at} name={`wipe@${w.at}`} from={w.at - WIPE / 2} durationInFrames={WIPE}>
        <PanelWipe colors={w.colors} direction={w.direction} duration={WIPE} />
      </Sequence>
    ))}
    <Grain opacity={0.045} />
  </AbsoluteFill>
);
