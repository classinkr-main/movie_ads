import React from "react";
import { AbsoluteFill, Easing, Sequence, interpolate, useCurrentFrame } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { Grain } from "./components/Backgrounds";
import { ChapterRail } from "./components/Feature";
import { iris, push, sweep } from "./components/Transitions";
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

/* ---------- 타임라인 (30fps · 900f = 30s) ---------- */
// 씬 길이에는 앞뒤 전환 겹침이 포함된다. 합계 − 전환 합계 = 900.
export const TIMELINE = [
  { id: "S1 오프닝", frames: 110 },
  { id: "01 강의 평가", frames: 150 },
  { id: "02 스크립트·요약", frames: 150 },
  { id: "03 숙제 출제·채점", frames: 160 },
  { id: "04 번역·자막", frames: 150 },
  { id: "05 에이전트", frames: 184 },
  { id: "S7 CTA", frames: 112 },
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
      <div style={{ position: "absolute", top: 34, left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 10, background: C.white, border: `1.5px solid ${C.hairline}`, borderRadius: 999, padding: "8px 18px", boxShadow: "0 8px 24px rgba(28,27,23,0.06)", opacity: visible }}>
        <span style={{ fontFamily: FONT_FAMILY, fontSize: 15, fontWeight: 800, color: C.ink, background: C.lime, borderRadius: 6, padding: "2px 8px" }}>예시 수업</span>
        <span style={{ fontFamily: FONT_FAMILY, fontSize: 17, fontWeight: 700, color: C.ink, letterSpacing: "-0.01em" }}>중2 국어 A반 · 3단원 비유와 상징 · 윤동주 「서시」</span>
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
