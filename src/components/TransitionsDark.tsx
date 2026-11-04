import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import type { TransitionPresentation, TransitionPresentationComponentProps } from "@remotion/transitions";
import { D } from "../lib/themeDark";

// 플레어 디졸브 — 앞 씬은 커지며 흐려지고, 가운데서 연두 빛이 한 번 부풀었다 가라앉으며 다음 씬이 드러난다
type FlareProps = Record<string, never>;
const FlareComp: React.FC<TransitionPresentationComponentProps<FlareProps>> = ({ children, presentationDirection, presentationProgress }) => {
  const p = presentationProgress;
  if (presentationDirection === "exiting") {
    return <AbsoluteFill style={{ transform: `scale(${1 + p * 0.06})`, opacity: interpolate(p, [0, 0.65], [1, 0], { extrapolateRight: "clamp" }), filter: `blur(${p * 10}px)` }}>{children}</AbsoluteFill>;
  }
  const flare = Math.sin(Math.min(1, Math.max(0, p)) * Math.PI);
  return (
    <AbsoluteFill style={{ opacity: interpolate(p, [0.25, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), transform: `scale(${1.03 - p * 0.03})` }}>
      {children}
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 55% 70% at 50% 50%, rgba(200,240,90,${0.55 * flare}) 0%, rgba(200,240,90,0) 70%)`, pointerEvents: "none", mixBlendMode: "screen" }} />
    </AbsoluteFill>
  );
};
export const flare = (): TransitionPresentation<FlareProps> => ({ component: FlareComp, props: {} });

// 슬라이드 업 — 앞 씬은 위로 빠지고 다음 씬이 아래에서 올라온다
type SlideProps = Record<string, never>;
const SlideUpComp: React.FC<TransitionPresentationComponentProps<SlideProps>> = ({ children, presentationDirection, presentationProgress }) => {
  const p = presentationProgress;
  if (presentationDirection === "exiting") {
    return <AbsoluteFill style={{ transform: `translateY(${-p * 9}%) scale(${1 - p * 0.03})`, opacity: interpolate(p, [0, 0.95], [1, 0], { extrapolateRight: "clamp" }), filter: `blur(${p * 6}px)` }}>{children}</AbsoluteFill>;
  }
  return (
    <AbsoluteFill style={{ transform: `translateY(${(1 - p) * 12}%)`, opacity: interpolate(p, [0, 0.4], [0, 1], { extrapolateRight: "clamp" }) }}>
      {children}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 2, background: D.lime, opacity: (1 - p) * 0.9, boxShadow: `0 0 24px ${D.lime}` }} />
    </AbsoluteFill>
  );
};
export const slideUp = (): TransitionPresentation<SlideProps> => ({ component: SlideUpComp, props: {} });
