import React from "react";
import { AbsoluteFill, Easing, interpolate, useVideoConfig } from "remotion";
import { TransitionSeries, linearTiming, springTiming } from "@remotion/transitions";
import type { TransitionPresentation, TransitionPresentationComponentProps } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { Grain } from "./components/Backgrounds";
import { FONT_FAMILY } from "./lib/fonts";
import { C } from "./lib/theme";
import { Hook } from "./scenes/Hook";
import { Question } from "./scenes/Question";
import { Reveal } from "./scenes/Reveal";
import { Analysis } from "./scenes/Analysis";
import { Dashboard } from "./scenes/Dashboard";
import { Value } from "./scenes/Value";
import { Cta } from "./scenes/Cta";

const easeInOut = Easing.inOut(Easing.cubic);

/* ---------- 커스텀 프레젠테이션 ---------- */

// 연두 스윕 — 기울어진 연두 띠가 앞장서며 다음 씬을 드러낸다
type SweepProps = { direction: "ltr" | "rtl" };
const SweepComp: React.FC<TransitionPresentationComponentProps<SweepProps>> = ({ children, presentationDirection, presentationProgress, passedProps }) => {
  const p = presentationProgress;
  if (presentationDirection === "exiting") {
    return <AbsoluteFill style={{ transform: `scale(${1 - p * 0.05})`, filter: `brightness(${1 - p * 0.12})` }}>{children}</AbsoluteFill>;
  }
  const skew = 6; // %
  const ltr = passedProps.direction === "ltr";
  const edge = ltr ? interpolate(p, [0, 1], [-skew, 100 + skew]) : interpolate(p, [0, 1], [100 + skew, -skew]);
  const clip = ltr
    ? `polygon(0 0, ${edge + skew}% 0, ${edge - skew}% 100%, 0 100%)`
    : `polygon(${edge + skew}% 0, 100% 0, 100% 100%, ${edge - skew}% 100%)`;
  const bandW = 9; // %
  const bandLeft = ltr ? edge - bandW : edge;
  return (
    <AbsoluteFill style={{ clipPath: clip }}>
      {children}
      <div style={{ position: "absolute", top: "-10%", bottom: "-10%", left: `${bandLeft}%`, width: `${bandW}%`, background: C.lime, transform: "skewX(-12deg)", opacity: interpolate(p, [0.85, 1], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }} />
    </AbsoluteFill>
  );
};
const sweep = (props: SweepProps): TransitionPresentation<SweepProps> => ({ component: SweepComp, props });

// 연두 아이리스 — 중앙에서 원이 커지며 다음 씬을 연다
type IrisProps = Record<string, never>;
const IrisComp: React.FC<TransitionPresentationComponentProps<IrisProps>> = ({ children, presentationDirection, presentationProgress }) => {
  const { width, height } = useVideoConfig();
  const p = presentationProgress;
  const R = Math.sqrt(width * width + height * height) / 2 + 40;
  if (presentationDirection === "exiting") {
    return <AbsoluteFill style={{ transform: `scale(${1 + p * 0.06})` }}>{children}</AbsoluteFill>;
  }
  const r = p * R;
  const ring = 34;
  return (
    <AbsoluteFill style={{ clipPath: `circle(${r}px at 50% 50%)` }}>
      {children}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: r * 2 + ring,
          height: r * 2 + ring,
          borderRadius: 999,
          border: `${ring}px solid ${C.lime}`,
          transform: "translate(-50%,-50%)",
          opacity: interpolate(p, [0.75, 1], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          boxSizing: "border-box",
        }}
      />
    </AbsoluteFill>
  );
};
const iris = (): TransitionPresentation<IrisProps> => ({ component: IrisComp, props: {} });

// 줌 스루 — 앞 씬이 확대·블러되며 사라지고 다음 씬이 안에서 자라난다
type ZoomProps = Record<string, never>;
const ZoomComp: React.FC<TransitionPresentationComponentProps<ZoomProps>> = ({ children, presentationDirection, presentationProgress }) => {
  const p = presentationProgress;
  if (presentationDirection === "exiting") {
    return (
      <AbsoluteFill style={{ opacity: interpolate(p, [0, 0.75], [1, 0], { extrapolateRight: "clamp" }), transform: `scale(${1 + p * 0.45})`, filter: `blur(${p * 16}px)` }}>
        {children}
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{ opacity: interpolate(p, [0.15, 0.8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), transform: `scale(${0.86 + p * 0.14})`, filter: `blur(${(1 - p) * 10}px)` }}>
      {children}
    </AbsoluteFill>
  );
};
const zoomThrough = (): TransitionPresentation<ZoomProps> => ({ component: ZoomComp, props: {} });

/* ---------- 타임라인 (30fps · 690f = 23s) ---------- */
// 각 씬 길이에는 앞뒤 전환 겹침이 포함된다. 합계 − 전환 합계 = 690.
export const TIMELINE = [
  { id: "S1 훅", frames: 96 },
  { id: "S2 질문", frames: 100 },
  { id: "S3 리빌", frames: 112 },
  { id: "S4 분석", frames: 118 },
  { id: "S5 리포트", frames: 146 },
  { id: "S6 가치", frames: 130 },
  { id: "S7 CTA", frames: 122 },
] as const;
export const TRANSITIONS = [20, 24, 22, 22, 22, 24] as const;

export const Showreel: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: FONT_FAMILY, background: C.ivory }}>
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={TIMELINE[0].frames}>
        <Hook />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={sweep({ direction: "ltr" })} timing={linearTiming({ durationInFrames: TRANSITIONS[0], easing: easeInOut })} />

      <TransitionSeries.Sequence durationInFrames={TIMELINE[1].frames}>
        <Question />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={iris()} timing={linearTiming({ durationInFrames: TRANSITIONS[1], easing: Easing.out(Easing.cubic) })} />

      <TransitionSeries.Sequence durationInFrames={TIMELINE[2].frames}>
        <Reveal />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={zoomThrough()} timing={linearTiming({ durationInFrames: TRANSITIONS[2], easing: easeInOut })} />

      <TransitionSeries.Sequence durationInFrames={TIMELINE[3].frames}>
        <Analysis />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({ direction: "from-bottom" })} timing={springTiming({ config: { damping: 200 }, durationInFrames: TRANSITIONS[3] })} />

      <TransitionSeries.Sequence durationInFrames={TIMELINE[4].frames}>
        <Dashboard />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={sweep({ direction: "rtl" })} timing={linearTiming({ durationInFrames: TRANSITIONS[4], easing: easeInOut })} />

      <TransitionSeries.Sequence durationInFrames={TIMELINE[5].frames}>
        <Value />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={iris()} timing={linearTiming({ durationInFrames: TRANSITIONS[5], easing: Easing.out(Easing.cubic) })} />

      <TransitionSeries.Sequence durationInFrames={TIMELINE[6].frames}>
        <Cta />
      </TransitionSeries.Sequence>
    </TransitionSeries>
    <Grain opacity={0.04} />
  </AbsoluteFill>
);
