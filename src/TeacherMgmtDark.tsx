import React from "react";
import { AbsoluteFill, Easing, Sequence, interpolate, useCurrentFrame } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { Grain } from "./components/Backgrounds";
import { flare, slideUp } from "./components/TransitionsDark";
import { iris } from "./components/Transitions";
import { FONT_FAMILY } from "./lib/fonts";
import { FPS } from "./lib/theme";
import { D } from "./lib/themeDark";
import { HookB } from "./scenes/tmb/HookB";
import { LoopB } from "./scenes/tmb/LoopB";
import { DirectorB } from "./scenes/tmb/DirectorB";
import { TeacherB } from "./scenes/tmb/TeacherB";
import { CtaB } from "./scenes/tmb/CtaB";

const easeInOut = Easing.inOut(Easing.cubic);
const easeOut = Easing.out(Easing.cubic);

/* ---------- 타임라인 (30fps · 780f = 26s) ---------- */
// 씬 길이에는 앞뒤 전환 겹침이 포함된다. 합계 − 전환 합계 = 780.
export const TMB_TIMELINE = [
  { id: "S1 훅 — 매 수업 옆에 코치를", frames: 140 },
  { id: "01 피드백 루프", frames: 160 },
  { id: "02 원장은 편해집니다", frames: 200 },
  { id: "03 강사는 객관적으로 성장합니다", frames: 200 },
  { id: "S5 CTA", frames: 162 },
] as const;
export const TMB_TRANSITIONS = [22, 18, 18, 24] as const;
export const TMB_DURATION_FRAMES = TMB_TIMELINE.reduce((a, s) => a + s.frames, 0) - TMB_TRANSITIONS.reduce((a, t) => a + t, 0);
export const TMB_DURATION_SEC = TMB_DURATION_FRAMES / FPS;

const starts = TMB_TIMELINE.reduce<number[]>((acc, _s, i) => {
  const prev = i === 0 ? 0 : acc[i - 1] + TMB_TIMELINE[i - 1].frames - TMB_TRANSITIONS[i - 1];
  acc.push(prev);
  return acc;
}, []);

// 01–03 동안 고정되는 상단 라벨 · 카운터 · 예시 고지
const Overlay: React.FC = () => {
  const frame = useCurrentFrame();
  const first = starts[1] + 14;
  const last = starts[4] + 4;
  const visible = interpolate(frame, [first, first + 12, last, last + 10], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  let active = 1;
  for (let i = 1; i <= 3; i++) if (frame >= starts[i] + 10) active = i;
  return (
    <>
      <div style={{ position: "absolute", top: 44, left: 150, display: "flex", alignItems: "center", gap: 10, opacity: visible }}>
        <span style={{ width: 9, height: 9, borderRadius: 999, background: D.lime, boxShadow: `0 0 10px ${D.lime}` }} />
        <span style={{ fontFamily: FONT_FAMILY, fontSize: 18, fontWeight: 800, color: D.ink, letterSpacing: "0.18em", textTransform: "uppercase" }}>Classin AI</span>
        <span style={{ fontFamily: FONT_FAMILY, fontSize: 18, fontWeight: 600, color: D.faint, letterSpacing: "0.02em", marginLeft: 6 }}>강의 평가 · 원장과 강사</span>
      </div>
      <div style={{ position: "absolute", top: 42, right: 100, display: "flex", alignItems: "center", gap: 14, opacity: visible }}>
        <div style={{ display: "flex", gap: 6 }}>
          {[1, 2, 3].map((i) => (
            <span key={i} style={{ width: i === active ? 26 : 8, height: 8, borderRadius: 999, background: i <= active ? D.lime : D.line2 }} />
          ))}
        </div>
        <span style={{ fontFamily: FONT_FAMILY, fontSize: 18, fontWeight: 700, color: D.faint, letterSpacing: "0.16em", fontVariantNumeric: "tabular-nums" }}>{String(active).padStart(2, "0")} — 03</span>
      </div>
      <div style={{ position: "absolute", bottom: 34, right: 100, fontFamily: FONT_FAMILY, fontSize: 14, fontWeight: 600, color: D.faint, letterSpacing: "0.02em", opacity: visible * 0.9 }}>
        화면과 수치는 연출용 예시입니다
      </div>
    </>
  );
};

export const TeacherMgmtDark: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: FONT_FAMILY, background: D.bg0 }}>
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={TMB_TIMELINE[0].frames}>
        <HookB />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={flare()} timing={linearTiming({ durationInFrames: TMB_TRANSITIONS[0], easing: easeInOut })} />

      <TransitionSeries.Sequence durationInFrames={TMB_TIMELINE[1].frames}>
        <LoopB />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slideUp()} timing={linearTiming({ durationInFrames: TMB_TRANSITIONS[1], easing: easeOut })} />

      <TransitionSeries.Sequence durationInFrames={TMB_TIMELINE[2].frames}>
        <DirectorB />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slideUp()} timing={linearTiming({ durationInFrames: TMB_TRANSITIONS[2], easing: easeOut })} />

      <TransitionSeries.Sequence durationInFrames={TMB_TIMELINE[3].frames}>
        <TeacherB />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={iris()} timing={linearTiming({ durationInFrames: TMB_TRANSITIONS[3], easing: easeOut })} />

      <TransitionSeries.Sequence durationInFrames={TMB_TIMELINE[4].frames}>
        <CtaB />
      </TransitionSeries.Sequence>
    </TransitionSeries>
    <Sequence from={0} layout="none">
      <Overlay />
    </Sequence>
    <Grain opacity={0.05} />
  </AbsoluteFill>
);
