import React from "react";
import { AbsoluteFill, Img, random, staticFile, useCurrentFrame } from "remotion";
import { C, H, W } from "../lib/theme";

type Children = { children?: React.ReactNode };

const gridLines = (minor: string, major: string, size = 32, majorEvery = 5): React.CSSProperties => ({
  backgroundImage: [
    `linear-gradient(${major} 1.5px, transparent 1.5px)`,
    `linear-gradient(90deg, ${major} 1.5px, transparent 1.5px)`,
    `linear-gradient(${minor} 1px, transparent 1px)`,
    `linear-gradient(90deg, ${minor} 1px, transparent 1px)`,
  ].join(","),
  backgroundSize: `${size * majorEvery}px ${size * majorEvery}px, ${size * majorEvery}px ${size * majorEvery}px, ${size}px ${size}px, ${size}px ${size}px`,
});

// 모눈종이 지면 — Vox식 해설 장면의 바탕(밝은 파스텔 연두). height로 세로로 긴 지면(카메라 이동용)을 만든다.
export const GraphPaper: React.FC<Children & { height?: number }> = ({ children, height = H }) => (
  <div style={{ position: "absolute", left: 0, top: 0, width: W, height, background: C.limeLight, overflow: "hidden" }}>
    <div style={{ position: "absolute", inset: 0, ...gridLines(C.grid, C.gridMajor) }} />
    {Array.from({ length: Math.ceil(height / H) }, (_, i) => (
      <Img key={i} src={staticFile("textures/paper.jpg")} style={{ position: "absolute", left: 0, top: i * H, width: W, height: H, mixBlendMode: "multiply", opacity: 0.32 }} />
    ))}
    {children}
  </div>
);

// 파스텔 연두 무대 — 드롭·패널·지도·수치·엔드의 바탕. 가운데가 살짝 밝다
export const LimeStage: React.FC<Children & { grid?: boolean; style?: React.CSSProperties }> = ({ children, grid = true, style }) => (
  <AbsoluteFill style={{ background: C.lime, ...style }}>
    {grid && <AbsoluteFill style={gridLines(C.grid, C.gridMajor)} />}
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 70% 65% at 50% 45%, rgba(255,255,255,0.42) 0%, rgba(255,255,255,0) 70%)" }} />
    {children}
  </AbsoluteFill>
);

export const limeGrid = (size = 32) => gridLines(C.grid, C.gridMajor, size);

// 필름 그레인 — 512px 타일 4장을 2프레임마다 바꾸고 위치를 흔든다
export const Grain: React.FC<{ opacity?: number; blend?: React.CSSProperties["mixBlendMode"] }> = ({ opacity = 0.1, blend = "overlay" }) => {
  const frame = useCurrentFrame();
  const step = Math.floor(frame / 2);
  const idx = step % 4;
  const ox = Math.floor(random(`gx${step}`) * 512);
  const oy = Math.floor(random(`gy${step}`) * 512);
  const tiles = [];
  for (let y = 0; y < 4; y++) for (let x = 0; x < 5; x++) tiles.push([x, y]);
  return (
    <AbsoluteFill style={{ opacity, mixBlendMode: blend, pointerEvents: "none", overflow: "hidden" }}>
      {tiles.map(([x, y]) => (
        <Img key={`${x}-${y}`} src={staticFile(`textures/grain-${idx}.png`)} style={{ position: "absolute", left: x * 512 - ox, top: y * 512 - oy, width: 512, height: 512 }} />
      ))}
    </AbsoluteFill>
  );
};

// 비네트 — 연두 지면이 탁해지지 않도록 올리브 톤으로 가장자리만 살짝 누른다
export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.2 }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse 75% 70% at 50% 50%, rgba(36,52,8,0) 55%, rgba(36,52,8,${strength}) 100%)`, pointerEvents: "none" }} />
);

// 카메라 — 장면 전체에 이동·확대·회전·흐림을 건다
export const Camera: React.FC<Children & { x?: number; y?: number; scale?: number; rotate?: number; blur?: number; originX?: number; originY?: number }> = ({
  children,
  x = 0,
  y = 0,
  scale = 1,
  rotate = 0,
  blur = 0,
  originX = W / 2,
  originY = H / 2,
}) => (
  <AbsoluteFill
    style={{
      transform: `translate(${x}px, ${y}px) scale(${scale}) rotate(${rotate}deg)`,
      transformOrigin: `${originX}px ${originY}px`,
      filter: blur > 0.05 ? `blur(${blur}px)` : undefined,
    }}
  >
    {children}
  </AbsoluteFill>
);
