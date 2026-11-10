import React from "react";
import { Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, PUNCH, SMOOTH, sp } from "../lib/motion";
import { C } from "../lib/theme";
import { FONT_FAMILY } from "../lib/fonts";

export const Eyebrow: React.FC<{ children: React.ReactNode; color?: string; size?: number; style?: React.CSSProperties }> = ({
  children,
  color = C.limeInk,
  size = 24,
  style,
}) => (
  <div style={{ fontFamily: FONT_FAMILY, fontSize: size, fontWeight: 700, color, letterSpacing: "0.22em", textTransform: "uppercase", ...style }}>{children}</div>
);

// 알약 칩 — 스프링으로 튀어 들어온다
export const Chip: React.FC<{
  delay?: number;
  children: React.ReactNode;
  bg?: string;
  color?: string;
  size?: number;
  outline?: boolean;
  style?: React.CSSProperties;
  shadow?: boolean;
}> = ({ delay = 0, children, bg = C.limeSoft, color = C.limeInk, size = 26, outline = false, style, shadow = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = sp(frame - delay, fps, PUNCH);
  const opacity = interpolate(frame - delay, [0, 3], [0, 1], clamp);
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        fontFamily: FONT_FAMILY,
        fontSize: size,
        fontWeight: 700,
        color,
        background: outline ? "transparent" : bg,
        border: outline ? `2px solid ${color}` : "none",
        borderRadius: 999,
        padding: `${size * 0.36}px ${size * 0.85}px`,
        letterSpacing: "-0.01em",
        opacity,
        transform: `scale(${interpolate(s, [0, 1], [0.4, 1])})`,
        transformOrigin: "50% 50%",
        whiteSpace: "nowrap",
        boxShadow: shadow ? "0 10px 30px rgba(28,27,23,0.12)" : undefined,
        ...style,
      }}
    >
      {children}
    </span>
  );
};

// 스티커 — 살짝 기울어진 라벨
export const Sticker: React.FC<{ delay?: number; children: React.ReactNode; rotate?: number; bg?: string; color?: string; size?: number; style?: React.CSSProperties }> = ({
  delay = 0,
  children,
  rotate = -8,
  bg = C.lime,
  color = C.ink,
  size = 26,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = sp(frame - delay, fps, { damping: 10, stiffness: 260, mass: 0.7 });
  const opacity = interpolate(frame - delay, [0, 3], [0, 1], clamp);
  return (
    <span
      style={{
        display: "inline-block",
        fontFamily: FONT_FAMILY,
        fontSize: size,
        fontWeight: 800,
        color,
        background: bg,
        padding: `${size * 0.3}px ${size * 0.7}px`,
        borderRadius: size * 0.4,
        letterSpacing: "-0.01em",
        opacity,
        transform: `rotate(${rotate + interpolate(s, [0, 1], [-25, 0])}deg) scale(${interpolate(s, [0, 1], [0.2, 1])})`,
        boxShadow: "0 12px 30px rgba(28,27,23,0.14)",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </span>
  );
};

export const Pop: React.FC<{
  delay?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
  from?: number;
  config?: { damping: number; stiffness: number; mass: number };
  y?: number;
  x?: number;
  rotate?: number;
}> = ({ delay = 0, children, style, from = 0.6, config = PUNCH, y = 0, x = 0, rotate = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = sp(frame - delay, fps, config);
  const opacity = interpolate(frame - delay, [0, 4], [0, 1], clamp);
  return (
    <div
      style={{
        opacity,
        transform: `translate(${interpolate(s, [0, 1], [x, 0])}px, ${interpolate(s, [0, 1], [y, 0])}px) scale(${interpolate(s, [0, 1], [from, 1])}) rotate(${interpolate(s, [0, 1], [rotate, 0])}deg)`,
        transformOrigin: "50% 50%",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const Rise: React.FC<{ delay?: number; children: React.ReactNode; style?: React.CSSProperties; distance?: number; duration?: number }> = ({
  delay = 0,
  children,
  style,
  distance = 60,
  duration,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = sp(frame - delay, fps, SMOOTH, duration);
  const opacity = interpolate(frame - delay, [0, 8], [0, 1], clamp);
  return <div style={{ opacity, transform: `translateY(${interpolate(s, [0, 1], [distance, 0])}px)`, ...style }}>{children}</div>;
};

export const LogoMark: React.FC<{ height: number; style?: React.CSSProperties }> = ({ height, style }) => (
  <Img src={staticFile("brand/classin-mark.png")} style={{ height, width: "auto", display: "block", ...style }} />
);

export const LogoStacked: React.FC<{ height: number; style?: React.CSSProperties }> = ({ height, style }) => (
  <Img src={staticFile("brand/classin-logo-stacked.png")} style={{ height, width: "auto", display: "block", ...style }} />
);

export const Wordmark: React.FC<{ height: number; style?: React.CSSProperties }> = ({ height, style }) => (
  <Img src={staticFile("brand/classin-wordmark.png")} style={{ height, width: "auto", display: "block", ...style }} />
);
