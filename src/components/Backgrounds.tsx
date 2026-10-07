import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { C } from "../lib/theme";

// 어두운 포레스트 배경 + 드리프트 도트 그리드 + 글로우 + 비네트
export const DarkStage: React.FC<{ children?: React.ReactNode; glow?: boolean }> = ({ children, glow = true }) => {
  const frame = useCurrentFrame();
  const drift = (frame * 0.35) % 64;
  const gx = 50 + Math.sin(frame / 70) * 18;
  const gy = 45 + Math.cos(frame / 95) * 14;
  return (
    <AbsoluteFill style={{ background: `linear-gradient(160deg, #0B5C43 0%, ${C.forest} 48%, ${C.forestDeep} 100%)` }}>
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(rgba(255,255,255,0.11) 1.4px, transparent 1.6px)`,
          backgroundSize: "64px 64px",
          backgroundPosition: `${drift}px ${drift * 0.6}px`,
          opacity: 0.9,
        }}
      />
      {glow && (
        <AbsoluteFill
          style={{
            background: `radial-gradient(ellipse 42% 55% at ${gx}% ${gy}%, rgba(0,168,112,0.34) 0%, rgba(0,168,112,0) 70%)`,
          }}
        />
      )}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 80% 80% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.42) 100%)" }} />
      {children}
    </AbsoluteFill>
  );
};

// 밝은 페이지 배경 + 헤어라인 그리드 + 떠다니는 민트 블롭
export const LightStage: React.FC<{ children?: React.ReactNode; blob?: boolean }> = ({ children, blob = true }) => {
  const frame = useCurrentFrame();
  const bx = 70 + Math.sin(frame / 60) * 10;
  const by = 40 + Math.cos(frame / 80) * 12;
  return (
    <AbsoluteFill style={{ background: C.page }}>
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${C.hairline} 1px, transparent 1px), linear-gradient(90deg, ${C.hairline} 1px, transparent 1px)`,
          backgroundSize: "96px 96px",
          opacity: 0.7,
        }}
      />
      {blob && (
        <AbsoluteFill
          style={{
            background: `radial-gradient(ellipse 36% 48% at ${bx}% ${by}%, ${C.surface100} 0%, rgba(209,250,229,0) 70%)`,
          }}
        />
      )}
      {children}
    </AbsoluteFill>
  );
};

// 브랜드 그린 풀블리드 — 밸류 라인용 강한 플래시 배경
export const BrandStage: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const drift = (frame * 0.5) % 80;
  return (
    <AbsoluteFill style={{ background: `linear-gradient(135deg, ${C.brandBright} 0%, ${C.brand} 55%, #007A52 100%)` }}>
      <AbsoluteFill
        style={{
          backgroundImage: `repeating-linear-gradient(-30deg, rgba(255,255,255,0.06) 0 2px, transparent 2px 80px)`,
          backgroundPosition: `${drift}px 0`,
        }}
      />
      {children}
    </AbsoluteFill>
  );
};

// 패널 와이프 — 두 장의 기울어진 패널이 연달아 화면을 쓸고 지나간다.
export const PanelWipe: React.FC<{
  colors?: [string, string];
  direction?: "ltr" | "rtl" | "ttb";
  duration?: number;
}> = ({ colors = [C.brand, C.surface100], direction = "ltr", duration = 16 }) => {
  const frame = useCurrentFrame();
  const panel = (offset: number, color: string, z: number) => {
    const p = interpolate(frame - offset, [0, duration - offset], [-1, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    // 중앙(0)에서 화면 전체를 덮도록 ease-in-out 곡선
    const eased = Math.sign(p) * Math.pow(Math.abs(p), 0.85);
    const horizontal = direction !== "ttb";
    const sign = direction === "rtl" ? -1 : 1;
    const t = eased * 150 * sign;
    const transform = horizontal
      ? `translateX(${t}%) skewX(-12deg) scaleX(1.4)`
      : `translateY(${eased * 150}%) skewY(-6deg) scaleY(1.4)`;
    return (
      <AbsoluteFill key={color} style={{ background: color, transform, zIndex: z, transformOrigin: "50% 50%" }} />
    );
  };
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {panel(0, colors[0], 2)}
      {panel(3, colors[1], 1)}
    </AbsoluteFill>
  );
};

// 미세 노이즈(필름 그레인) — 도트가 아닌 프레임마다 바뀌는 점묘
export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.05 }) => {
  const frame = useCurrentFrame();
  const seed = Math.floor(random(`g${frame}`) * 1000);
  return (
    <AbsoluteFill
      style={{
        opacity,
        mixBlendMode: "overlay",
        backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' seed='${seed}' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`,
        backgroundSize: "220px 220px",
      }}
    />
  );
};
