import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { DuotoneDefs } from "./components/Media";
import { Grain, Vignette } from "./components/Stage";
import { RecHud } from "./components/Hud";
import { C, FONT, scene } from "./lib/theme";
import { Intro } from "./scenes/Intro";
import { Drop } from "./scenes/Drop";
import { Chant } from "./scenes/Chant";
import { Future } from "./scenes/Future";
import { System } from "./scenes/System";
import { MapScene } from "./scenes/MapScene";
import { Scale } from "./scenes/Scale";
import { Finale } from "./scenes/Finale";
import { End } from "./scenes/End";

// v5 타임라인 — 씬 경계와 모든 히트 프레임은 src/data/cues.json(사운드트랙과 공유)에서 온다.
// 훅·상실(0–240)은 한 장의 긴 모눈종이 위 카메라 이동이라 Intro 하나로 묶었다.
const SCENES: Array<{ name: string; from: number; len: number; Comp: React.FC }> = [
  { name: "S1–2 훅·상실", from: 0, len: scene("drop").from, Comp: Intro },
  { name: "S3 드롭", ...scene("drop"), Comp: Drop },
  { name: "S4 챈트", ...scene("chant"), Comp: Chant },
  { name: "S5 미래 교실", ...scene("future"), Comp: Future },
  { name: "S6 시스템", ...scene("system"), Comp: System },
  { name: "S7 지도", ...scene("map"), Comp: MapScene },
  { name: "S8 글로벌", ...scene("scale"), Comp: Scale },
  { name: "S9 피날레", ...scene("finale"), Comp: Finale },
  { name: "S10 엔드", ...scene("end"), Comp: End },
];

export const Showreel: React.FC = () => (
  <AbsoluteFill style={{ background: C.ink, fontFamily: FONT.sans }}>
    <DuotoneDefs />
    {SCENES.map(({ name, from, len, Comp }) => (
      <Sequence key={name} name={name} from={from} durationInFrames={len}>
        <Comp />
      </Sequence>
    ))}
    <RecHud />
    <Grain opacity={0.085} />
    <Vignette strength={0.26} />
    <Audio src={staticFile("audio/classin-v5.wav")} />
  </AbsoluteFill>
);
