import React from "react";
import { AbsoluteFill, interpolate, useVideoConfig } from "remotion";
import type { TransitionPresentation, TransitionPresentationComponentProps } from "@remotion/transitions";
import { C } from "../lib/theme";

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
export const sweep = (props: SweepProps): TransitionPresentation<SweepProps> => ({ component: SweepComp, props });

// 패럴랙스 푸시 — 기능 씬 사이: 앞 씬은 왼쪽으로 살짝 밀리며 사라지고, 다음 씬은 오른쪽에서 들어온다
type PushProps = Record<string, never>;
const PushComp: React.FC<TransitionPresentationComponentProps<PushProps>> = ({ children, presentationDirection, presentationProgress }) => {
  const p = presentationProgress;
  if (presentationDirection === "exiting") {
    return <AbsoluteFill style={{ transform: `translateX(${-p * 22}%) scale(${1 - p * 0.04})`, opacity: interpolate(p, [0, 0.8], [1, 0], { extrapolateRight: "clamp" }), filter: `blur(${p * 6}px)` }}>{children}</AbsoluteFill>;
  }
  return <AbsoluteFill style={{ transform: `translateX(${(1 - p) * 70}%)`, opacity: interpolate(p, [0, 0.35], [0, 1], { extrapolateRight: "clamp" }) }}>{children}</AbsoluteFill>;
};
export const push = (): TransitionPresentation<PushProps> => ({ component: PushComp, props: {} });

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
export const iris = (): TransitionPresentation<IrisProps> => ({ component: IrisComp, props: {} });

/* ---------- 시네마틱(브래그컷) ---------- */

const smooth = (x: number) => {
  const c = Math.min(1, Math.max(0, x));
  return c * c * (3 - 2 * c);
};

// 화이트 플래시 — 앞 씬이 하얗게 타오르다 끊기고, 다음 씬이 빛 속에서 드러난다(겹침 없음) + 아나모픽 빛줄기
type FlashProps = Record<string, never>;
const FlashComp: React.FC<TransitionPresentationComponentProps<FlashProps>> = ({ children, presentationDirection, presentationProgress }) => {
  const p = presentationProgress;
  if (presentationDirection === "exiting") {
    return <AbsoluteFill style={{ opacity: p < 0.5 ? 1 : 0, filter: `brightness(${1 + smooth(p * 2) * 1.6})`, transform: `scale(${1 + p * 0.06})` }}>{children}</AbsoluteFill>;
  }
  const white = 1 - Math.abs(p - 0.5) * 2;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: p >= 0.5 ? 1 : 0, transform: `scale(${1.04 - (p - 0.5) * 0.08})` }}>{children}</AbsoluteFill>
      <AbsoluteFill style={{ background: "#FFFDF4", opacity: smooth(white * 1.3) }} />
      <div style={{ position: "absolute", left: "-30%", right: "-30%", top: "50%", height: 8, transform: "translateY(-50%)", background: "linear-gradient(90deg, rgba(216,255,92,0) 0%, #FFFFFF 50%, rgba(216,255,92,0) 100%)", boxShadow: `0 0 80px 30px rgba(216,255,92,${0.6 * white})`, opacity: white }} />
    </AbsoluteFill>
  );
};
export const flash = (): TransitionPresentation<FlashProps> => ({ component: FlashComp, props: {} });

// 줌 스루 — 앞 씬 속으로 빨려 들어가며(확대·블러) 어둠으로 빠지고, 다음 씬이 가까이에서 물러나며 맞춰진다
type ZoomProps = Record<string, never>;
const ZoomComp: React.FC<TransitionPresentationComponentProps<ZoomProps>> = ({ children, presentationDirection, presentationProgress }) => {
  const p = presentationProgress;
  if (presentationDirection === "exiting") {
    return <AbsoluteFill style={{ opacity: 1 - smooth(p / 0.6), transform: `scale(${1 + p * 0.7})`, filter: `blur(${p * 26}px)` }}>{children}</AbsoluteFill>;
  }
  const q = smooth((p - 0.35) / 0.65);
  return <AbsoluteFill style={{ opacity: q, transform: `scale(${1.22 - q * 0.22})`, filter: q < 0.99 ? `blur(${(1 - q) * 18}px)` : undefined }}>{children}</AbsoluteFill>;
};
export const zoomThrough = (): TransitionPresentation<ZoomProps> => ({ component: ZoomComp, props: {} });

// 휩 팬 — 가로로 빠르게 쓸리는 카메라. 모션 블러와 함께 다음 씬이 옆에서 붙어 들어온다
type WhipProps = Record<string, never>;
const WhipComp: React.FC<TransitionPresentationComponentProps<WhipProps>> = ({ children, presentationDirection, presentationProgress }) => {
  const p = presentationProgress;
  const speed = 1 - Math.abs(p - 0.5) * 2; // 가운데에서 가장 빠름
  if (presentationDirection === "exiting") {
    return <AbsoluteFill style={{ transform: `translateX(${-p * 110}%) scaleX(${1 + speed * 0.12})`, filter: `blur(${speed * 34}px)` }}>{children}</AbsoluteFill>;
  }
  return (
    <AbsoluteFill style={{ transform: `translateX(${(1 - p) * 110}%) scaleX(${1 + speed * 0.12})`, filter: speed > 0.02 ? `blur(${speed * 34}px)` : undefined }}>
      {children}
      <AbsoluteFill style={{ background: `linear-gradient(90deg, rgba(200,240,90,${0.25 * speed}) 0%, rgba(200,240,90,0) 40%)`, mixBlendMode: "screen" }} />
    </AbsoluteFill>
  );
};
export const whip = (): TransitionPresentation<WhipProps> => ({ component: WhipComp, props: {} });
