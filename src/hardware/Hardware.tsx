import React from "react";
import { AbsoluteFill, Easing, Sequence, interpolate, useCurrentFrame } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import type { TransitionPresentation, TransitionPresentationComponentProps } from "@remotion/transitions";
import { Brand, FilmGrain, Letterbox, t } from "./Cine";
import { FONT_FAMILY } from "../shared/fonts";
import { CHAPTERS, H, HW_DURATION_FRAMES } from "./hwTheme";
import { H0Opening } from "./scenes/H0Opening";
import { H1Design } from "./scenes/H1Design";
import { H2Display } from "./scenes/H2Display";
import { H3Performance } from "./scenes/H3Performance";
import { H4Camera } from "./scenes/H4Camera";
import { H5Ecosystem } from "./scenes/H5Ecosystem";
import { H6Cta } from "./scenes/H6Cta";

const easeInOut = Easing.inOut(Easing.cubic);
const easeOut = Easing.out(Easing.cubic);

/* ---------- 전환 ---------- */

// 시네 디졸브 — 앞 씬은 살짝 커지며 어두워지고, 다음 씬은 미세하게 줌아웃하며 밝아진다
type FadeProps = Record<string, never>;
const CineFadeComp: React.FC<TransitionPresentationComponentProps<FadeProps>> = ({ children, presentationDirection, presentationProgress }) => {
  const p = presentationProgress;
  if (presentationDirection === "exiting") {
    return <AbsoluteFill style={{ transform: `scale(${1 + p * 0.05})`, filter: `brightness(${1 - p * 0.5})`, opacity: 1 - p }}>{children}</AbsoluteFill>;
  }
  return <AbsoluteFill style={{ transform: `scale(${1.06 - p * 0.06})`, opacity: p }}>{children}</AbsoluteFill>;
};
const cineFade = (): TransitionPresentation<FadeProps> => ({ component: CineFadeComp, props: {} });

// 위프 — 가로 모션 블러 푸시(퍼포먼스 → 카메라처럼 템포를 올릴 때)
type WhipProps = Record<string, never>;
const WhipComp: React.FC<TransitionPresentationComponentProps<WhipProps>> = ({ children, presentationDirection, presentationProgress }) => {
  const p = presentationProgress;
  const blur = Math.sin(p * Math.PI) * 18;
  if (presentationDirection === "exiting") {
    return <AbsoluteFill style={{ transform: `translateX(${-p * 60}%)`, filter: `blur(${blur}px)`, opacity: 1 - p }}>{children}</AbsoluteFill>;
  }
  return <AbsoluteFill style={{ transform: `translateX(${(1 - p) * 60}%)`, filter: `blur(${blur}px)`, opacity: p }}>{children}</AbsoluteFill>;
};
const whip = (): TransitionPresentation<WhipProps> => ({ component: WhipComp, props: {} });

/* ---------- 타임라인 (30fps · 1350f = 45s) ---------- */
// 씬 길이에는 앞뒤 전환 겹침이 포함된다. 합계 − 전환 합계 = 1350.
export const HW_TIMELINE = [
  { id: "S0 오프닝", frames: 150 },
  { id: "01 디자인", frames: 240 },
  { id: "02 디스플레이", frames: 230 },
  { id: "03 퍼포먼스", frames: 220 },
  { id: "04 트래킹 카메라", frames: 240 },
  { id: "05 생태계", frames: 210 },
  { id: "S6 CTA", frames: 166 },
] as const;
export const HW_TRANSITIONS = [18, 18, 18, 18, 16, 18] as const;

const starts = HW_TIMELINE.reduce<number[]>((acc, _s, i) => {
  const prev = i === 0 ? 0 : acc[i - 1] + HW_TIMELINE[i - 1].frames - HW_TRANSITIONS[i - 1];
  acc.push(prev);
  return acc;
}, []);
const total = HW_TIMELINE.reduce((a, s) => a + s.frames, 0) - HW_TRANSITIONS.reduce((a, b) => a + b, 0);
if (total !== HW_DURATION_FRAMES) {
  throw new Error(`HW 타임라인 합계 ${total} ≠ ${HW_DURATION_FRAMES}`);
}

const Overlay: React.FC = () => {
  const frame = useCurrentFrame();
  // 레터박스: 오프닝과 CTA 에서만
  const lb = interpolate(frame, [starts[1] - 4, starts[1] + 20, starts[6] - 2, starts[6] + 22], [1, 0, 0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const chapterVis = interpolate(frame, [starts[1] + 6, starts[1] + 18, starts[6] - 10, starts[6] + 4], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  let active = 0;
  for (let i = 1; i <= 5; i++) if (frame >= starts[i] + 8) active = i - 1;
  const ch = CHAPTERS[active];
  const progress = frame / HW_DURATION_FRAMES;
  return (
    <>
      <Letterbox visible={lb} bar={96} />
      <div style={{ position: "absolute", left: 100, top: 56, opacity: chapterVis }}>
        <Brand height={26} />
      </div>
      <div style={{ position: "absolute", right: 100, top: 54, display: "flex", alignItems: "center", gap: 14, opacity: chapterVis }}>
        <span style={{ fontFamily: FONT_FAMILY, fontSize: 16, fontWeight: 700, color: H.dim, letterSpacing: "0.22em" }}>{ch.en}</span>
        <span style={{ width: 1, height: 16, background: H.line2 }} />
        <span style={{ fontFamily: FONT_FAMILY, fontSize: 16, fontWeight: 700, color: H.muted, letterSpacing: "0.2em", fontVariantNumeric: "tabular-nums" }}>{ch.n} / 05</span>
      </div>
      <div style={{ position: "absolute", left: 0, bottom: 0, height: 3, width: `${progress * 100}%`, background: H.mint, opacity: 0.8 }} />
    </>
  );
};

export const Hardware: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: FONT_FAMILY, background: H.bg, ...t(16, 400) }}>
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={HW_TIMELINE[0].frames}>
        <H0Opening />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={cineFade()} timing={linearTiming({ durationInFrames: HW_TRANSITIONS[0], easing: easeInOut })} />

      <TransitionSeries.Sequence durationInFrames={HW_TIMELINE[1].frames}>
        <H1Design />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={cineFade()} timing={linearTiming({ durationInFrames: HW_TRANSITIONS[1], easing: easeInOut })} />

      <TransitionSeries.Sequence durationInFrames={HW_TIMELINE[2].frames}>
        <H2Display />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={cineFade()} timing={linearTiming({ durationInFrames: HW_TRANSITIONS[2], easing: easeInOut })} />

      <TransitionSeries.Sequence durationInFrames={HW_TIMELINE[3].frames}>
        <H3Performance />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={cineFade()} timing={linearTiming({ durationInFrames: HW_TRANSITIONS[3], easing: easeInOut })} />

      <TransitionSeries.Sequence durationInFrames={HW_TIMELINE[4].frames}>
        <H4Camera />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={whip()} timing={linearTiming({ durationInFrames: HW_TRANSITIONS[4], easing: easeOut })} />

      <TransitionSeries.Sequence durationInFrames={HW_TIMELINE[5].frames}>
        <H5Ecosystem />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={cineFade()} timing={linearTiming({ durationInFrames: HW_TRANSITIONS[5], easing: easeInOut })} />

      <TransitionSeries.Sequence durationInFrames={HW_TIMELINE[6].frames}>
        <H6Cta />
      </TransitionSeries.Sequence>
    </TransitionSeries>
    <Sequence from={0} layout="none">
      <Overlay />
    </Sequence>
    <FilmGrain opacity={0.08} />
  </AbsoluteFill>
);
