import React from "react";
import { AbsoluteFill, Easing, Sequence, interpolate, useCurrentFrame } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { Grain } from "../shared/brand/Backgrounds";
import { iris, push, sweep } from "../shared/brand/Transitions";
import { FONT_FAMILY } from "../shared/fonts";
import { C, FPS } from "../shared/brand/theme";
import { HookV } from "./scenes/tmv/HookV";
import { LoopV } from "./scenes/tmv/LoopV";
import { PointV } from "./scenes/tmv/PointV";
import { DirectorV } from "./scenes/tmv/DirectorV";
import { TeacherV } from "./scenes/tmv/TeacherV";
import { CtaV } from "./scenes/tmv/CtaV";

const easeInOut = Easing.inOut(Easing.cubic);
const easeOut = Easing.out(Easing.cubic);

/* ---------- 타임라인 (30fps · 780f = 26s) ---------- */
// 씬 길이에는 앞뒤 전환 겹침이 포함된다. 합계 − 전환 합계 = 780.
export const TMV_TIMELINE = [
  { id: "S1 훅 — 매 수업 옆에 코치를", frames: 138 },
  { id: "01 피드백 루프", frames: 148 },
  { id: "포인트 — 원장님도, 강사도.", frames: 76 },
  { id: "02 원장님은 편해집니다", frames: 184 },
  { id: "03 강사는 객관적으로 성장합니다", frames: 184 },
  { id: "S6 CTA", frames: 148 },
] as const;
export const TMV_TRANSITIONS = [20, 18, 18, 18, 24] as const;
export const TMV_DURATION_FRAMES = TMV_TIMELINE.reduce((a, s) => a + s.frames, 0) - TMV_TRANSITIONS.reduce((a, t) => a + t, 0);
export const TMV_DURATION_SEC = TMV_DURATION_FRAMES / FPS;

const starts = TMV_TIMELINE.reduce<number[]>((acc, _s, i) => {
  const prev = i === 0 ? 0 : acc[i - 1] + TMV_TIMELINE[i - 1].frames - TMV_TRANSITIONS[i - 1];
  acc.push(prev);
  return acc;
}, []);

// 01 · 02 · 03 동안 고정되는 상단 라벨 · 진행 표시 · 예시 고지 (연두 포인트 씬과 훅·CTA에서는 숨긴다)
const Overlay: React.FC = () => {
  const frame = useCurrentFrame();
  const win = (from: number, to: number) => interpolate(frame, [from, from + 12, to, to + 10], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const visible = Math.max(win(starts[1] + 14, starts[2] - 2), win(starts[3] + 14, starts[5] + 4));
  const active = frame >= starts[4] + 10 ? 3 : frame >= starts[3] + 10 ? 2 : 1;
  return (
    <>
      <div style={{ position: "absolute", top: 44, left: 150, display: "flex", alignItems: "center", gap: 10, opacity: visible }}>
        <span style={{ width: 10, height: 10, borderRadius: 999, background: C.limeDeep }} />
        <span style={{ fontFamily: FONT_FAMILY, fontSize: 18, fontWeight: 800, color: C.ink, letterSpacing: "0.18em", textTransform: "uppercase" }}>Classin AI</span>
        <span style={{ fontFamily: FONT_FAMILY, fontSize: 18, fontWeight: 600, color: C.gray300, letterSpacing: "0.02em", marginLeft: 6 }}>강의 평가 · 원장님과 강사</span>
      </div>
      <div style={{ position: "absolute", top: 42, right: 100, display: "flex", alignItems: "center", gap: 14, opacity: visible }}>
        <div style={{ display: "flex", gap: 6 }}>
          {[1, 2, 3].map((i) => (
            <span key={i} style={{ width: i === active ? 26 : 8, height: 8, borderRadius: 999, background: i <= active ? C.limeDeep : C.hairline }} />
          ))}
        </div>
        <span style={{ fontFamily: FONT_FAMILY, fontSize: 18, fontWeight: 700, color: C.gray300, letterSpacing: "0.16em", fontVariantNumeric: "tabular-nums" }}>{String(active).padStart(2, "0")} — 03</span>
      </div>
      <div style={{ position: "absolute", bottom: 34, right: 100, fontFamily: FONT_FAMILY, fontSize: 14, fontWeight: 600, color: C.gray300, letterSpacing: "0.02em", opacity: visible * 0.9 }}>
        화면과 수치는 연출용 예시입니다
      </div>
    </>
  );
};

export const TeacherMgmtValue: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: FONT_FAMILY, background: C.ivory }}>
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={TMV_TIMELINE[0].frames}>
        <HookV />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={sweep({ direction: "ltr" })} timing={linearTiming({ durationInFrames: TMV_TRANSITIONS[0], easing: easeInOut })} />

      <TransitionSeries.Sequence durationInFrames={TMV_TIMELINE[1].frames}>
        <LoopV />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={sweep({ direction: "rtl" })} timing={linearTiming({ durationInFrames: TMV_TRANSITIONS[1], easing: easeInOut })} />

      <TransitionSeries.Sequence durationInFrames={TMV_TIMELINE[2].frames}>
        <PointV />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={push()} timing={linearTiming({ durationInFrames: TMV_TRANSITIONS[2], easing: easeOut })} />

      <TransitionSeries.Sequence durationInFrames={TMV_TIMELINE[3].frames}>
        <DirectorV />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={push()} timing={linearTiming({ durationInFrames: TMV_TRANSITIONS[3], easing: easeOut })} />

      <TransitionSeries.Sequence durationInFrames={TMV_TIMELINE[4].frames}>
        <TeacherV />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={iris()} timing={linearTiming({ durationInFrames: TMV_TRANSITIONS[4], easing: easeOut })} />

      <TransitionSeries.Sequence durationInFrames={TMV_TIMELINE[5].frames}>
        <CtaV />
      </TransitionSeries.Sequence>
    </TransitionSeries>
    <Sequence from={0} layout="none">
      <Overlay />
    </Sequence>
    <Grain opacity={0.035} />
  </AbsoluteFill>
);
