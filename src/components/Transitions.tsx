import React from "react";
import { AbsoluteFill, interpolate, useVideoConfig } from "remotion";
import type { TransitionPresentation, TransitionPresentationComponentProps } from "@remotion/transitions";
import { C } from "../lib/theme";

/* ---------- 커스텀 프레젠테이션 — Showreel(v4)과 TeacherMgmt가 함께 쓴다 ---------- */

// 연두 스윕 — 기울어진 연두 띠가 지나가며 다음 씬이 드러난다
export type SweepProps = { direction: "ltr" | "rtl" };
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
export const sweep = (props: SweepProps): TransitionPresentation<SweepProps> => ({ component: SweepComp, props });

// 패럴랙스 푸시 — 앞 씬은 왼쪽으로 살짝 밀리며 사라지고, 다음 씬은 오른쪽에서 들어온다
type PushProps = Record<string, never>;
const PushComp: React.FC<TransitionPresentationComponentProps<PushProps>> = ({ children, presentationDirection, presentationProgress }) => {
  const p = presentationProgress;
  if (presentationDirection === "exiting") {
    return <AbsoluteFill style={{ transform: `translateX(${-p * 22}%) scale(${1 - p * 0.04})`, opacity: interpolate(p, [0, 0.8], [1, 0], { extrapolateRight: "clamp" }), filter: `blur(${p * 6}px)` }}>{children}</AbsoluteFill>;
  }
  return <AbsoluteFill style={{ transform: `translateX(${(1 - p) * 70}%)`, opacity: interpolate(p, [0, 0.35], [0, 1], { extrapolateRight: "clamp" }) }}>{children}</AbsoluteFill>;
};
export const push = (): TransitionPresentation<PushProps> => ({ component: PushComp, props: {} });

// 연두 아이리스 — 가운데서 원이 커지며 다음 씬이 열린다
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
export const iris = (): TransitionPresentation<IrisProps> => ({ component: IrisComp, props: {} });
