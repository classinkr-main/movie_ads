import React from "react";
import { AbsoluteFill, Easing, Sequence, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import type { TransitionPresentation, TransitionPresentationComponentProps } from "@remotion/transitions";
import { Grain } from "./components/Backgrounds";
import { ChapterRail } from "./components/Feature";
import { FONT_FAMILY } from "./lib/fonts";
import { C } from "./lib/theme";
import { Opening } from "./scenes/Opening";
import { F01Eval } from "./scenes/F01Eval";
import { F02Script } from "./scenes/F02Script";
import { F03Homework } from "./scenes/F03Homework";
import { F04Subtitle } from "./scenes/F04Subtitle";
import { F05Agent } from "./scenes/F05Agent";
import { Cta } from "./scenes/Cta";

const easeInOut = Easing.inOut(Easing.cubic);
const easeOut = Easing.out(Easing.cubic);

/* ---------- 커스텀 프레젠테이션 ---------- */

// 연두 스윕
type SweepProps = { direction: "ltr" | "rtl" };
const SweepComp: React.FC<TransitionPresentationComponentProps<SweepProps>> = ({ children, presentationDirection, presentationProgress, passedProps }) => {
  const p = presentationProgress;
  if (presentationDirection === "exiting") {
    return <AbsoluteFill style={{ transform: `scale(${1 - p * 0.05})`, filter: `brightness(${1 - p * 0.1})` }}>{children}</AbsoluteFill>;
  }
  const skew = 6;
  const ltr = passedProps.direction === "ltr";
  const edge = ltr ? interpolate(p, [0, 1], [-skew, 100 + skew]) : interpolate(p, [0, 1], [100 + skew, -skew]);
  const clip = ltr ? `polygon(0 0, ${edge + skew}% 0, ${edge - skew}% 100%, 0 100%)` : `polygon(${edge + skew}% 0, 100% 0, 100% 100%, ${edge - skew}% 100%)`;
  const bandW = 9;
  const bandLeft = ltr ? edge - bandW : edge;
  return (
    <AbsoluteFill style={{ clipPath: clip }}>
      {children}
      <div style={{ position: "absolute", top: "-10%", bottom: "-10%", left: `${bandLeft}%`, width: `${bandW}%`, background: C.lime, transform: "skewX(-12deg)", opacity: interpolate(p, [0.85, 1], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }} />
    </AbsoluteFill>
  );
};
const sweep = (props: SweepProps): TransitionPresentation<SweepProps> => ({ component: SweepComp, props });

// 패럴랙스 푸시 — 기능 씬 사이: 앞 씬은 왼쪽으로 살짝 밀리며 사라지고, 다음 씬은 오른쪽에서 들어온다
type PushProps = Record<string, never>;
const PushComp: React.FC<TransitionPresentationComponentProps<PushProps>> = ({ children, presentationDirection, presentationProgress }) => {
  const p = presentationProgress;
  if (presentationDirection === "exiting") {
    return <AbsoluteFill style={{ transform: `translateX(${-p * 22}%) scale(${1 - p * 0.04})`, opacity: interpolate(p, [0, 0.8], [1, 0], { extrapolateRight: "clamp" }), filter: `blur(${p * 6}px)` }}>{children}</AbsoluteFill>;
  }
  return <AbsoluteFill style={{ transform: `translateX(${(1 - p) * 70}%)`, opacity: interpolate(p, [0, 0.35], [0, 1], { extrapolateRight: "clamp" }) }}>{children}</AbsoluteFill>;
};
const push = (): TransitionPresentation<PushProps> => ({ component: PushComp, props: {} });

// 연두 아이리스
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
      <div style={{ position: "absolute", left: "50%", top: "50%", width: r * 2 + ring, height: r * 2 + ring, borderRadius: 999, border: `${ring}px solid ${C.lime}`, transform: "translate(-50%,-50%)", opacity: interpolate(p, [0.75, 1], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), boxSizing: "border-box" }} />
    </AbsoluteFill>
  );
};
const iris = (): TransitionPresentation<IrisProps> => ({ component: IrisComp, props: {} });

/* ---------- 타임라인 (30fps · 750f = 25s) ---------- */
// 씬 길이에는 앞뒤 전환 겹침이 포함된다. 합계 − 전환 합계 = 750.
export const TIMELINE = [
  { id: "S1 오프닝", frames: 110 },
  { id: "01 강의 평가", frames: 130 },
  { id: "02 스크립트·요약", frames: 124 },
  { id: "03 숙제 출제·채점", frames: 124 },
  { id: "04 번역·자막", frames: 124 },
  { id: "05 에이전트", frames: 148 },
  { id: "S7 CTA", frames: 106 },
] as const;
export const TRANSITIONS = [20, 18, 18, 18, 18, 24] as const;

// 각 씬의 글로벌 시작 프레임
const starts = TIMELINE.reduce<number[]>((acc, s, i) => {
  const prev = i === 0 ? 0 : acc[i - 1] + TIMELINE[i - 1].frames - TRANSITIONS[i - 1];
  acc.push(prev);
  return acc;
}, []);

const RailOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const first = starts[1] + 14; // 01 씬 전환이 끝날 즈음
  const last = starts[6] + 4;
  const visible = interpolate(frame, [first, first + 10, last, last + 10], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  let active = 0;
  for (let i = 1; i <= 5; i++) if (frame >= starts[i] + 10) active = i - 1;
  return (
    <>
      <ChapterRail active={active} visible={visible} />
      <div style={{ position: "absolute", top: 44, left: 170, display: "flex", alignItems: "center", gap: 10, opacity: visible }}>
        <span style={{ width: 10, height: 10, borderRadius: 999, background: C.limeDeep }} />
        <span style={{ fontFamily: FONT_FAMILY, fontSize: 18, fontWeight: 800, color: C.ink, letterSpacing: "0.18em", textTransform: "uppercase" }}>Classin AI</span>
      </div>
      <div style={{ position: "absolute", top: 42, right: 100, fontFamily: FONT_FAMILY, fontSize: 18, fontWeight: 700, color: C.gray300, letterSpacing: "0.16em", fontVariantNumeric: "tabular-nums", opacity: visible }}>
        {String(active + 1).padStart(2, "0")} — 05
      </div>
    </>
  );
};

export const Showreel: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: FONT_FAMILY, background: C.ivory }}>
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={TIMELINE[0].frames}>
        <Opening />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={sweep({ direction: "ltr" })} timing={linearTiming({ durationInFrames: TRANSITIONS[0], easing: easeInOut })} />

      <TransitionSeries.Sequence durationInFrames={TIMELINE[1].frames}>
        <F01Eval />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={push()} timing={linearTiming({ durationInFrames: TRANSITIONS[1], easing: easeOut })} />

      <TransitionSeries.Sequence durationInFrames={TIMELINE[2].frames}>
        <F02Script />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={push()} timing={linearTiming({ durationInFrames: TRANSITIONS[2], easing: easeOut })} />

      <TransitionSeries.Sequence durationInFrames={TIMELINE[3].frames}>
        <F03Homework />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={push()} timing={linearTiming({ durationInFrames: TRANSITIONS[3], easing: easeOut })} />

      <TransitionSeries.Sequence durationInFrames={TIMELINE[4].frames}>
        <F04Subtitle />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={push()} timing={linearTiming({ durationInFrames: TRANSITIONS[4], easing: easeOut })} />

      <TransitionSeries.Sequence durationInFrames={TIMELINE[5].frames}>
        <F05Agent />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={iris()} timing={linearTiming({ durationInFrames: TRANSITIONS[5], easing: easeOut })} />

      <TransitionSeries.Sequence durationInFrames={TIMELINE[6].frames}>
        <Cta />
      </TransitionSeries.Sequence>
    </TransitionSeries>
    <Sequence from={0} layout="none">
      <RailOverlay />
    </Sequence>
    <Grain opacity={0.035} />
  </AbsoluteFill>
);
