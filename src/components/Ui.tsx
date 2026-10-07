import React from "react";
import { Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, PUNCH, SMOOTH, sp } from "../lib/motion";
import { C } from "../lib/theme";
import { FONT_FAMILY } from "../lib/fonts";

export const Text: React.FC<{
  size: number;
  weight?: number;
  color?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
  tracking?: number; // em 단위
  lineHeight?: number;
}> = ({ size, weight = 700, color = C.page, style, children, tracking = -0.03, lineHeight = 1.05 }) => (
  <div
    style={{
      fontFamily: FONT_FAMILY,
      fontSize: size,
      fontWeight: weight,
      color,
      letterSpacing: `${tracking}em`,
      lineHeight,
      ...style,
    }}
  >
    {children}
  </div>
);

export const Eyebrow: React.FC<{ children: React.ReactNode; color?: string; size?: number; style?: React.CSSProperties }> = ({
  children,
  color = C.mint,
  size = 26,
  style,
}) => (
  <div
    style={{
      fontFamily: FONT_FAMILY,
      fontSize: size,
      fontWeight: 700,
      color,
      letterSpacing: "0.22em",
      textTransform: "uppercase",
      ...style,
    }}
  >
    {children}
  </div>
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
}> = ({ delay = 0, children, bg = C.surface50, color = C.forest, size = 26, outline = false, style }) => {
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
        fontWeight: 600,
        color,
        background: outline ? "transparent" : bg,
        border: outline ? `2px solid ${color}` : "none",
        borderRadius: 999,
        padding: `${size * 0.35}px ${size * 0.8}px`,
        letterSpacing: "-0.01em",
        opacity,
        transform: `scale(${interpolate(s, [0, 1], [0.4, 1])})`,
        transformOrigin: "50% 50%",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </span>
  );
};

// 스케일 팝 래퍼
export const Pop: React.FC<{
  delay?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
  from?: number;
  config?: { damping: number; stiffness: number; mass: number };
  y?: number;
}> = ({ delay = 0, children, style, from = 0.6, config = PUNCH, y = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = sp(frame - delay, fps, config);
  const opacity = interpolate(frame - delay, [0, 4], [0, 1], clamp);
  return (
    <div
      style={{
        opacity,
        transform: `translateY(${interpolate(s, [0, 1], [y, 0])}px) scale(${interpolate(s, [0, 1], [from, 1])})`,
        transformOrigin: "50% 50%",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// 부드럽게 올라오는 래퍼(오버슈트 없음)
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
  return (
    <div style={{ opacity, transform: `translateY(${interpolate(s, [0, 1], [distance, 0])}px)`, ...style }}>{children}</div>
  );
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

// 펄스 링 — CTA 버튼 뒤에서 퍼져 나간다
export const PulseRings: React.FC<{ color?: string; period?: number; count?: number; size: number; delay?: number }> = ({
  color = C.brand,
  period = 28,
  count = 2,
  size,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", pointerEvents: "none" }}>
      {Array.from({ length: count }).map((_, i) => {
        const f = frame - delay - i * (period / count);
        if (f < 0) return null;
        const t = (f % period) / period;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              width: size,
              height: size,
              borderRadius: 999,
              border: `3px solid ${color}`,
              opacity: (1 - t) * 0.55,
              transform: `scale(${1 + t * 0.9})`,
            }}
          />
        );
      })}
    </div>
  );
};
