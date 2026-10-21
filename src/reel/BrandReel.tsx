import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { FONT_FAMILY } from "../lib/fonts";
import { AnaFlare, FilmGrain, shakeAt, Vignette } from "./fx";
import { IMPACTS, R, T } from "./theme";
import { S1Hook } from "./scenes/S1Hook";
import { S2Flow } from "./scenes/S2Flow";
import { S3Grid } from "./scenes/S3Grid";
import { S4Hero } from "./scenes/S4Hero";
import { S5Proof } from "./scenes/S5Proof";
import { S6End } from "./scenes/S6End";

/*
 * Classin 브랜드 쇼릴 — 20초 · 60fps · 1920×1080
 * 학원 원장·교육기관 의사결정자를 겨냥한 커머셜. Drive 사진창고의 실제 학원·쇼룸 사진과 Classin 스톡 영상을 모션그래픽으로 묶었다.
 *
 *   S1 훅        0–180    2.39:1 레터박스 · "미래의 수업" 글자 안 영상 → 줌스루(16:9로 열림) → "이미, 학원에서 시작됐습니다."
 *   S2 흐름      168–510  판서 · 녹화 · 교안 · 복습(자동 녹화) · 데이터 (5비트 휩 몽타주 + 상단 흐름 레일 + 랙 포커스)
 *   S3 그리드    498–690  15타일 3D 정렬(피사계 심도) → "하나의 흐름으로." → 중앙 칠판으로 줌스루
 *   S4 히어로    690–882  사진 속 빈 전자칠판에 예시 영어 수업 → 지우개 → "좋은 수업을 … 학원의 시스템으로."
 *   S5 스케일    870–1062 점 지구본 + 아크 · 160+ 개국 · 6만+ 교육기관 · 5,000만+ 교사·학습자 · 3,000만+ 월간 수업(EEO 공식 기준)
 *   S6 엔드      1050–1200 보케 사진 월 · 로고 · 태그라인 · CTA(목동 쇼룸) · classin.co.kr
 * 전역: 임팩트 3곳(IMPACTS)에서 펀치 인 + 감쇠 흔들림 + 아나모픽 플레어, 비네트, 필름 그레인.
 */
const span = (s: { from: number; to: number }) => ({ from: s.from, durationInFrames: s.to - s.from });

// 임팩트 펀치 인 — 흔들림으로 가장자리가 비지 않도록 그만큼 살짝 확대한다
const punchAt = (frame: number) => IMPACTS.reduce((m, h) => (frame >= h && frame <= h + 16 ? Math.max(m, Math.exp(-(frame - h) / 5)) : m), 0);

const Camera: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const { x, y } = shakeAt(frame, IMPACTS, 7, 16);
  const punch = punchAt(frame);
  return <AbsoluteFill style={{ transform: punch > 0.001 ? `translate(${x}px, ${y}px) scale(${1 + punch * 0.014})` : undefined }}>{children}</AbsoluteFill>;
};

export const BrandReel: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: FONT_FAMILY, background: R.night }}>
    <Camera>
      <Sequence {...span(T.hook)} name="S1 훅">
        <S1Hook />
      </Sequence>
      <Sequence {...span(T.flow)} name="S2 흐름">
        <S2Flow />
      </Sequence>
      <Sequence {...span(T.grid)} name="S3 그리드">
        <S3Grid />
      </Sequence>
      <Sequence {...span(T.hero)} name="S4 히어로">
        <S4Hero />
      </Sequence>
      <Sequence {...span(T.proof)} name="S5 스케일">
        <S5Proof />
      </Sequence>
      <Sequence {...span(T.end)} name="S6 엔드">
        <S6End />
      </Sequence>
    </Camera>
    <AnaFlare at={IMPACTS[0]} x={960} y={520} len={36} />
    <AnaFlare at={IMPACTS[1]} x={996} y={600} len={40} strength={0.8} />
    <AnaFlare at={IMPACTS[2]} x={960} y={246} len={44} ghosts={false} />
    <Vignette strength={0.42} />
    <FilmGrain opacity={0.08} />
  </AbsoluteFill>
);
