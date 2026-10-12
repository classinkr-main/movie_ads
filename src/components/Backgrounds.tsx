import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { C } from "../lib/theme";

// 아이보리 스테이지 — 따뜻한 베이스 + 헤어라인 그리드 + 천천히 떠다니는 연두 글로우
export const IvoryStage: React.FC<{ children?: React.ReactNode; variant?: "ivory" | "ivory2" | "white"; glow?: boolean; grid?: boolean; drift?: boolean }> = ({
  children,
  variant = "ivory",
  glow = true,
  grid = true,
  drift = true,
}) => {
  const frame = useCurrentFrame();
  const bg = variant === "white" ? C.white : variant === "ivory2" ? C.ivory2 : C.ivory;
  const gx = 72 + Math.sin(frame / 90) * 14;
  const gy = 30 + Math.cos(frame / 110) * 16;
  const g2x = 18 + Math.cos(frame / 120) * 10;
  const g2y = 78 + Math.sin(frame / 95) * 10;
  return (
    <AbsoluteFill style={{ background: bg }}>
      {grid && (
        <AbsoluteFill
          style={{
            backgroundImage: `linear-gradient(${C.hairline} 1px, transparent 1px), linear-gradient(90deg, ${C.hairline} 1px, transparent 1px)`,
            backgroundSize: "96px 96px",
            backgroundPosition: `${(frame * 0.15) % 96}px 0`,
            opacity: 0.55,
          }}
        />
      )}
      {glow && (
        <>
          <AbsoluteFill style={{ background: `radial-gradient(ellipse 34% 46% at ${gx}% ${gy}%, rgba(200,240,90,0.42) 0%, rgba(200,240,90,0) 70%)` }} />
          <AbsoluteFill style={{ background: `radial-gradient(ellipse 30% 40% at ${g2x}% ${g2y}%, rgba(234,247,192,0.9) 0%, rgba(234,247,192,0) 70%)` }} />
        </>
      )}
      <AbsoluteFill style={drift ? { transform: `scale(${1 + Math.min(frame, 160) * 0.00025}) translate(${Math.sin(frame / 80) * 4}px, ${Math.cos(frame / 95) * 3}px)`, transformOrigin: "50% 50%" } : undefined}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

// 연두 풀블리드 — 포인트 순간용
export const LimeStage: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const drift = (frame * 0.6) % 90;
  return (
    <AbsoluteFill style={{ background: `linear-gradient(135deg, ${C.limeBright} 0%, ${C.lime} 60%, #B9E84A 100%)` }}>
      <AbsoluteFill
        style={{
          backgroundImage: `repeating-linear-gradient(-30deg, rgba(255,255,255,0.18) 0 2px, transparent 2px 90px)`,
          backgroundPosition: `${drift}px 0`,
        }}
      />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 70% 70% at 50% 50%, rgba(255,255,255,0) 50%, rgba(60,107,18,0.10) 100%)" }} />
      {children}
    </AbsoluteFill>
  );
};

// 패널 와이프 — 씬 내부 비트 전환용(두 장의 기울어진 패널)
export const PanelWipe: React.FC<{ colors?: [string, string]; direction?: "ltr" | "rtl" | "ttb" | "btt"; duration?: number }> = ({
  colors = [C.lime, C.ivory],
  direction = "ltr",
  duration = 16,
}) => {
  const frame = useCurrentFrame();
  const panel = (offset: number, color: string, z: number) => {
    const p = interpolate(frame - offset, [0, duration - offset], [-1, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const eased = Math.sign(p) * Math.pow(Math.abs(p), 0.85);
    const horizontal = direction === "ltr" || direction === "rtl";
    const sign = direction === "rtl" || direction === "btt" ? -1 : 1;
    const transform = horizontal
      ? `translateX(${eased * 150 * sign}%) skewX(-12deg) scaleX(1.4)`
      : `translateY(${eased * 150 * sign}%) skewY(-6deg) scaleY(1.4)`;
    return <AbsoluteFill key={color + z} style={{ background: color, transform, zIndex: z }} />;
  };
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {panel(0, colors[0], 2)}
      {panel(3, colors[1], 1)}
    </AbsoluteFill>
  );
};

export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.05 }) => {
  const frame = useCurrentFrame();
  const seed = Math.floor(random(`g${frame}`) * 1000);
  return (
    <AbsoluteFill
      style={{
        opacity,
        mixBlendMode: "multiply",
        backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' seed='${seed}' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`,
        backgroundSize: "220px 220px",
      }}
    />
  );
};
