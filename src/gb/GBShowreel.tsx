import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import "./fonts";
import { PAPER, SC } from "./theme";
import { FilterDefs, Flash } from "./kit";
import { S1Six } from "./scenes/S1Six";
import { S2Chaos } from "./scenes/S2Chaos";
import { S3Turn } from "./scenes/S3Turn";
import { S4Paths } from "./scenes/S4Paths";
import { S5Record } from "./scenes/S5Record";
import { S6Dashboard } from "./scenes/S6Dashboard";
import { S7End } from "./scenes/S7End";

export const GB_AUDIO = { enabled: true, src: "gb/audio/gb_score.wav" };

export const GBShowreel: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: PAPER.evening.base }}>
      <FilterDefs />
      <Sequence from={SC.s1.from} durationInFrames={SC.s1.dur} name="S1 여섯 갈래">
        <S1Six />
      </Sequence>
      <Sequence from={SC.s2.from} durationInFrames={SC.s2.dur} name="S2 손이 많이 갑니다">
        <S2Chaos />
      </Sequence>
      <Sequence from={SC.s3.from} durationInFrames={SC.s3.dur} name="S3 전환">
        <S3Turn />
      </Sequence>
      <Sequence from={SC.s4.from} durationInFrames={SC.s4.dur} name="S4 AI 진도 설계">
        <S4Paths />
      </Sequence>
      <Sequence from={SC.s5.from} durationInFrames={SC.s5.dur} name="S5 수업방 · AI 강의분석">
        <S5Record />
      </Sequence>
      <Sequence from={SC.s6.from} durationInFrames={SC.s6.dur} name="S6 원장 화면 → 리포트 초안">
        <S6Dashboard />
      </Sequence>
      <Sequence from={SC.s7.from} durationInFrames={SC.s7.dur} name="S7 엔딩">
        <S7End />
      </Sequence>
      <Flash at={SC.s4.from} dur={12} peak={0.85} />
      <Flash at={SC.s6.from} dur={10} peak={0.6} />
      <Flash at={SC.s7.from} dur={12} peak={0.75} />
      {/* 은은한 가장자리 그늘 */}
      <AbsoluteFill style={{ background: "radial-gradient(95% 95% at 50% 50%, rgba(0,0,0,0) 62%, rgba(60,50,30,0.16) 100%)", pointerEvents: "none" }} />
      {GB_AUDIO.enabled ? <Audio src={staticFile(GB_AUDIO.src)} /> : null}
    </AbsoluteFill>
  );
};
