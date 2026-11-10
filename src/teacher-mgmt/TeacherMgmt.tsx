import React from "react";
import { AbsoluteFill, Easing, Sequence, interpolate, useCurrentFrame } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { Grain } from "../shared/brand/Backgrounds";
import { iris, push, sweep } from "../shared/brand/Transitions";
import { FONT_FAMILY } from "../shared/fonts";
import { FPS } from "../shared/brand/theme";
import { C } from "../shared/brand/theme";
import { Hook } from "./scenes/tm/Hook";
import { EvalAll } from "./scenes/tm/EvalAll";
import { Manage } from "./scenes/tm/Manage";
import { CtaTm } from "./scenes/tm/CtaTm";

const easeInOut = Easing.inOut(Easing.cubic);
const easeOut = Easing.out(Easing.cubic);

/* ---------- 타임라인 (30fps · 660f = 22s) ---------- */
// 씬 길이에는 앞뒤 전환 겹침이 포함된다. 합계 − 전환 합계 = 660.
export const TM_TIMELINE = [
  { id: "S1 훅 — 몇 개나 보셨나요?", frames: 150 },
  { id: "01 AI 강의 평가", frames: 200 },
  { id: "02 강사 관리", frames: 236 },
  { id: "S4 CTA", frames: 136 },
] as const;
export const TM_TRANSITIONS = [20, 18, 24] as const;
export const TM_DURATION_FRAMES = TM_TIMELINE.reduce((a, s) => a + s.frames, 0) - TM_TRANSITIONS.reduce((a, t) => a + t, 0);
export const TM_DURATION_SEC = TM_DURATION_FRAMES / FPS;

const starts = TM_TIMELINE.reduce<number[]>((acc, _s, i) => {
  const prev = i === 0 ? 0 : acc[i - 1] + TM_TIMELINE[i - 1].frames - TM_TRANSITIONS[i - 1];
  acc.push(prev);
  return acc;
}, []);

// 기능 씬(01–02) 동안 고정되는 상단 라벨과 하단 예시 고지
const Overlay: React.FC = () => {
  const frame = useCurrentFrame();
  const first = starts[1] + 14;
  const last = starts[3] + 4;
  const visible = interpolate(frame, [first, first + 12, last, last + 10], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const active = frame >= starts[2] + 10 ? 2 : 1;
  return (
    <>
      <div style={{ position: "absolute", top: 44, left: 150, display: "flex", alignItems: "center", gap: 10, opacity: visible }}>
        <span style={{ width: 10, height: 10, borderRadius: 999, background: C.limeDeep }} />
        <span style={{ fontFamily: FONT_FAMILY, fontSize: 18, fontWeight: 800, color: C.ink, letterSpacing: "0.18em", textTransform: "uppercase" }}>Classin AI</span>
        <span style={{ fontFamily: FONT_FAMILY, fontSize: 18, fontWeight: 600, color: C.gray300, letterSpacing: "0.02em", marginLeft: 6 }}>강의 평가 · 강사 관리</span>
      </div>
      <div style={{ position: "absolute", top: 42, right: 100, fontFamily: FONT_FAMILY, fontSize: 18, fontWeight: 700, color: C.gray300, letterSpacing: "0.16em", fontVariantNumeric: "tabular-nums", opacity: visible }}>
        {String(active).padStart(2, "0")} — 02
      </div>
      <div style={{ position: "absolute", bottom: 34, right: 100, fontFamily: FONT_FAMILY, fontSize: 14, fontWeight: 600, color: C.gray300, letterSpacing: "0.02em", opacity: visible * 0.9 }}>
        화면과 수치는 연출용 예시입니다
      </div>
    </>
  );
};

export const TeacherMgmt: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: FONT_FAMILY, background: C.ivory }}>
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={TM_TIMELINE[0].frames}>
        <Hook />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={sweep({ direction: "ltr" })} timing={linearTiming({ durationInFrames: TM_TRANSITIONS[0], easing: easeInOut })} />

      <TransitionSeries.Sequence durationInFrames={TM_TIMELINE[1].frames}>
        <EvalAll />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={push()} timing={linearTiming({ durationInFrames: TM_TRANSITIONS[1], easing: easeOut })} />

      <TransitionSeries.Sequence durationInFrames={TM_TIMELINE[2].frames}>
        <Manage />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={iris()} timing={linearTiming({ durationInFrames: TM_TRANSITIONS[2], easing: easeOut })} />

      <TransitionSeries.Sequence durationInFrames={TM_TIMELINE[3].frames}>
        <CtaTm />
      </TransitionSeries.Sequence>
    </TransitionSeries>
    <Sequence from={0} layout="none">
      <Overlay />
    </Sequence>
    <Grain opacity={0.035} />
  </AbsoluteFill>
);
