import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { Grain, Vignette } from "./components/Stage";
import { RecHud } from "./components/Hud";
import { C, FONT } from "./lib/theme";
import { type SceneId, sceneSpan, useCues } from "./lib/timing";
import { Intro } from "./scenes/Intro";
import { Drop } from "./scenes/Drop";
import { Chant } from "./scenes/Chant";
import { Future } from "./scenes/Future";
import { System } from "./scenes/System";
import { MapScene } from "./scenes/MapScene";
import { Scale } from "./scenes/Scale";
import { Finale } from "./scenes/Finale";
import { End } from "./scenes/End";

// v5 타임라인 — 씬 경계와 모든 히트 프레임은 버전별 cues JSON(사운드트랙과 공유)에서 온다.
// 훅·상실은 한 장의 긴 모눈종이 위 카메라 이동이라 Intro 하나로 묶었다.
const SCENES: Array<{ name: string; id: SceneId; Comp: React.FC }> = [
  { name: "S3 드롭", id: "drop", Comp: Drop },
  { name: "S4 챈트", id: "chant", Comp: Chant },
  { name: "S5 미래 교실", id: "future", Comp: Future },
  { name: "S6 시스템", id: "system", Comp: System },
  { name: "S7 지도", id: "map", Comp: MapScene },
  { name: "S8 글로벌", id: "scale", Comp: Scale },
  { name: "S9 피날레", id: "finale", Comp: Finale },
  { name: "S10 엔드", id: "end", Comp: End },
];

export const Showreel: React.FC<{ audio: string }> = ({ audio }) => {
  const cues = useCues();
  return (
    <AbsoluteFill style={{ background: C.ink, fontFamily: FONT.sans }}>
      <Sequence name="S1–2 훅·상실" from={0} durationInFrames={sceneSpan(cues, "drop").from}>
        <Intro />
      </Sequence>
      {SCENES.map(({ name, id, Comp }) => {
        const { from, len } = sceneSpan(cues, id);
        return (
          <Sequence key={name} name={name} from={from} durationInFrames={len}>
            <Comp />
          </Sequence>
        );
      })}
      <RecHud />
      <Grain opacity={0.085} />
      <Vignette />
      <Audio src={staticFile(audio)} />
    </AbsoluteFill>
  );
};
