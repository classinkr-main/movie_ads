import React from "react";
import { AbsoluteFill, random, staticFile, useCurrentFrame } from "remotion";
import { P } from "./theme";

/** 스케치북 종이 — 바탕색 + 옅은 도트 그리드 */
export const Paper: React.FC<{ children?: React.ReactNode; color?: string; dots?: boolean; dotColor?: string }> = ({ children, color = P.paper, dots = true, dotColor = "rgba(42,40,35,0.13)" }) => (
  <AbsoluteFill style={{ background: color, isolation: "isolate" }}>
    {dots && (
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(${dotColor} 1.6px, transparent 2.2px)`,
          backgroundSize: "48px 48px",
          backgroundPosition: "24px 24px",
        }}
      />
    )}
    {children}
  </AbsoluteFill>
);

/** 화면 전체에 덮는 종이 결·비네트·필름 그레인. 그림 위에 곱해져서 모든 색이 종이에 스민 것처럼 보인다 */
export const PaperFinish: React.FC = () => {
  const frame = useCurrentFrame();
  const step = Math.floor(frame / 3);
  const ox = Math.floor(random(`px${step}`) * 6);
  const oy = Math.floor(random(`py${step}`) * 6);
  const seed = Math.floor(random(`g${step}`) * 1000);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill
        style={{
          backgroundImage: `url(${staticFile("textures/paper.jpg")})`,
          backgroundSize: "768px 768px",
          backgroundPosition: `${ox}px ${oy}px`,
          mixBlendMode: "multiply",
          opacity: 0.9,
        }}
      />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 78% 78% at 50% 48%, rgba(120,100,60,0) 62%, rgba(120,100,60,0.13) 100%)" }} />
      <AbsoluteFill
        style={{
          opacity: 0.05,
          mixBlendMode: "multiply",
          backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' seed='${seed}' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`,
          backgroundSize: "240px 240px",
        }}
      />
    </AbsoluteFill>
  );
};

/** 촬영대 카메라의 미세한 흔들림 — 3프레임마다 아주 조금 움직인다 */
export const Rostrum: React.FC<{ children: React.ReactNode; amount?: number }> = ({ children, amount = 1 }) => {
  const frame = useCurrentFrame();
  const step = Math.floor(frame / 3);
  const tx = (random(`rx${step}`) - 0.5) * 1.6 * amount;
  const ty = (random(`ry${step}`) - 0.5) * 1.6 * amount;
  const rot = (random(`rr${step}`) - 0.5) * 0.06 * amount;
  return <AbsoluteFill style={{ transform: `translate(${tx}px, ${ty}px) rotate(${rot}deg) scale(1.004)` }}>{children}</AbsoluteFill>;
};

/** 풀스크린 SVG 캔버스(1920×1080 좌표) */
export const Canvas: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", ...style }}>
    {children}
  </svg>
);
