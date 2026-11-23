import React from "react";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT_FAMILY } from "./fonts";
import { cl } from "./fx";
import { K, rgba } from "./theme";

const SOFT = { damping: 200, stiffness: 130, mass: 0.9 };

/** 자간 넓은 소형 라벨 */
export const Tracked: React.FC<{ children: React.ReactNode; size?: number; color?: string; spacing?: number; weight?: number; style?: React.CSSProperties }> = ({
  children,
  size = 18,
  color = K.mint,
  spacing = 0.32,
  weight = 600,
  style,
}) => (
  <div style={{ fontFamily: FONT_FAMILY, fontSize: size, fontWeight: weight, color, letterSpacing: `${spacing}em`, textTransform: "uppercase", whiteSpace: "nowrap", ...style }}>{children}</div>
);

/** 마스크 리빌 — 줄 단위로 아래에서 올라온다(+블러 인) */
export const LineUp: React.FC<{ at: number; children: React.ReactNode; style?: React.CSSProperties; dur?: number; pad?: number }> = ({ at, children, style, dur = 22, pad = 0.14 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - at, fps, config: SOFT, durationInFrames: dur });
  const blur = interpolate(frame - at, [0, 9], [10, 0], cl);
  return (
    <div style={{ overflow: "hidden", paddingBottom: `${pad}em`, marginBottom: `-${pad}em`, paddingTop: "0.06em", ...style }}>
      <div style={{ transform: `translateY(${(1 - s) * 112}%)`, filter: blur > 0.3 ? `blur(${blur}px)` : undefined, opacity: frame < at ? 0 : 1 }}>{children}</div>
    </div>
  );
};

/** 페이드 + 살짝 이동 */
export const FadeIn: React.FC<{ at: number; children: React.ReactNode; style?: React.CSSProperties; y?: number; x?: number; dur?: number }> = ({ at, children, style, y = 16, x = 0, dur = 14 }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame - at, [0, dur], [0, 1], { ...cl, easing: Easing.out(Easing.cubic) });
  return <div style={{ opacity: t, transform: `translate(${(1 - t) * x}px, ${(1 - t) * y}px)`, ...style }}>{children}</div>;
};

/** 스페큘러 스윕이 지나가는 글자 */
export const SweepText: React.FC<{ children: React.ReactNode; at: number; dur?: number; from?: string; to?: string; style?: React.CSSProperties }> = ({ children, at, dur = 26, from = K.mint, to = K.mintHot, style }) => {
  const frame = useCurrentFrame();
  const pos = interpolate(frame - at, [0, dur], [100, 0], { ...cl, easing: Easing.inOut(Easing.cubic) });
  return (
    <span
      style={{
        display: "inline-block",
        backgroundImage: `linear-gradient(105deg, ${from} 0%, ${to} 36%, #ffffff 50%, ${to} 64%, ${from} 100%)`,
        backgroundSize: "320% 100%",
        backgroundPosition: `${pos}% 0`,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
        WebkitTextFillColor: "transparent",
        filter: `drop-shadow(0 0 26px ${rgba(K.mint, 0.35)})`,
        ...style,
      }}
    >
      {children}
    </span>
  );
};

/** 가로로 그려지는 헤어라인 */
export const Hairline: React.FC<{ at: number; width: number; color?: string; dur?: number; style?: React.CSSProperties; origin?: "left" | "center" | "right" }> = ({ at, width, color = K.mint, dur = 20, style, origin = "left" }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame - at, [0, dur], [0, 1], { ...cl, easing: Easing.out(Easing.exp) });
  return <div style={{ width, height: 1.5, background: `linear-gradient(90deg, ${color}, ${rgba(color, 0.15)})`, transform: `scaleX(${t})`, transformOrigin: origin, ...style }} />;
};

/** 숫자 롤 — at 부터 dur 프레임 동안 0→to */
export const Roll: React.FC<{ to: number; at: number; dur?: number; comma?: boolean }> = ({ to, at, dur = 14, comma = false }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame - at, [0, dur], [0, 1], { ...cl, easing: Easing.out(Easing.exp) });
  const v = frame - at >= dur ? to : Math.round(to * t);
  return <span style={{ fontVariantNumeric: "tabular-nums" }}>{comma ? v.toLocaleString("en-US") : v}</span>;
};

export const FONT = FONT_FAMILY;
