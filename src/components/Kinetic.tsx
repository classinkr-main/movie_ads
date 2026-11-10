import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, PUNCH, SMOOTH, sp } from "../lib/motion";

type PopProps = {
  delay?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
  fromScale?: number;
  rotate?: number;
  blur?: boolean;
  config?: { damping: number; stiffness: number; mass: number };
  exitAt?: number; // 로컬 프레임 기준 사라지기 시작하는 시점
};

// 단어 단위 펀치 인 — 크게 들어와서 제자리에 꽂힌다.
export const WordPop: React.FC<PopProps> = ({
  delay = 0,
  children,
  style,
  fromScale = 1.7,
  rotate = 0,
  blur = true,
  config = PUNCH,
  exitAt,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - delay;
  const s = sp(f, fps, config);
  const scale = interpolate(s, [0, 1], [fromScale, 1]);
  const rot = interpolate(s, [0, 1], [rotate, 0]);
  const opacityIn = interpolate(f, [0, 3], [0, 1], clamp);
  const b = blur ? interpolate(f, [0, 6], [14, 0], clamp) : 0;
  let opacity = opacityIn;
  let exitScale = 1;
  let exitY = 0;
  if (exitAt !== undefined) {
    const e = frame - exitAt;
    opacity *= interpolate(e, [0, 6], [1, 0], clamp);
    exitScale = interpolate(e, [0, 6], [1, 0.9], clamp);
    exitY = interpolate(e, [0, 6], [0, -24], clamp);
  }
  return (
    <span
      style={{
        display: "inline-block",
        opacity,
        transform: `translateY(${exitY}px) scale(${scale * exitScale}) rotate(${rot}deg)`,
        filter: b > 0.2 ? `blur(${b}px)` : undefined,
        transformOrigin: "50% 60%",
        willChange: "transform, opacity",
        ...style,
      }}
    >
      {children}
    </span>
  );
};

type MaskProps = {
  delay?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
  duration?: number;
  direction?: "up" | "down";
};

// 마스크 리빌 — 보이지 않는 선 아래에서 글자가 올라온다.
export const MaskText: React.FC<MaskProps> = ({ delay = 0, children, style, direction = "up" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - delay;
  const s = sp(f, fps, SMOOTH);
  const y = interpolate(s, [0, 1], [direction === "up" ? 115 : -115, 0]);
  return (
    <span style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom", ...style }}>
      <span style={{ display: "inline-block", transform: `translateY(${y}%)`, willChange: "transform" }}>{children}</span>
    </span>
  );
};

// 숫자 카운트업
export const CountUp: React.FC<{
  to: number;
  from?: number;
  delay?: number;
  duration?: number;
  style?: React.CSSProperties;
  suffix?: string;
}> = ({ to, from = 0, delay = 0, duration = 30, style, suffix = "" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = sp(frame - delay, fps, SMOOTH, duration);
  const v = Math.round(interpolate(s, [0, 1], [from, to]));
  return (
    <span style={{ display: "inline-block", fontVariantNumeric: "tabular-nums", ...style }}>
      {v}
      {suffix}
    </span>
  );
};

// 라인 드로우(가로줄) — 취소선·밑줄 연출
export const DrawLine: React.FC<{
  delay?: number;
  color: string;
  thickness?: number;
  style?: React.CSSProperties;
  duration?: number;
}> = ({ delay = 0, color, thickness = 10, style, duration = 12 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = sp(frame - delay, fps, SMOOTH, duration);
  return (
    <span
      style={{
        position: "absolute",
        left: 0,
        height: thickness,
        width: `${s * 100}%`,
        background: color,
        borderRadius: thickness,
        ...style,
      }}
    />
  );
};
