import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { FONT_FAMILY } from "../lib/fonts";
import { FilmGrain, Vignette } from "./fx";
import { R, T } from "./theme";
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
 *   S1 훅        0–180    "미래의 수업" 글자 안 영상 → 줌스루 → "이미, 학원에서 시작됐습니다."
 *   S2 흐름      168–540  판서 · 녹화 · 교안 · 복습 · 데이터 (5비트 휩 몽타주 + 상단 흐름 레일)
 *   S3 그리드    528–720  15타일 3D 정렬 → "하나의 흐름으로." → 중앙 칠판으로 줌스루
 *   S4 히어로    720–912  사진 속 빈 전자칠판에 예시 수업 → 지우개 → "좋은 수업을 … 학원의 시스템으로."
 *   S5 스케일    900–1062 160+ 개국 · 6만+ 교육기관 · 5,000만+ 교사·학습자(EEO 공식 기준)
 *   S6 엔드      1050–1200 로고 · 태그라인 · CTA(목동 쇼룸) · classin.co.kr
 */
const span = (s: { from: number; to: number }) => ({ from: s.from, durationInFrames: s.to - s.from });

export const BrandReel: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: FONT_FAMILY, background: R.night }}>
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
    <Vignette strength={0.42} />
    <FilmGrain opacity={0.08} />
  </AbsoluteFill>
);
