import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { C, FONT } from "../lib/theme";
import { clamp, ease } from "../lib/motion";

// 플래시 — 히트 순간 화면 전체가 번쩍였다가 빠진다(광과민 기준을 고려해 큰 히트에만 쓴다)
export const Flash: React.FC<{ at: number; dur?: number; color?: string; max?: number }> = ({ at, dur = 8, color = C.white, max = 1 }) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  if (t < 0 || t > dur) return null;
  return <AbsoluteFill style={{ background: color, opacity: max * (1 - t / dur) ** 1.6, pointerEvents: "none" }} />;
};

// 동심원 링 — 중심에서 퍼져 나간다
export const Rings: React.FC<{ start: number; x?: number; y?: number; count?: number; color?: string; maxR?: number; dur?: number; width?: number }> = ({
  start,
  x = 960,
  y = 540,
  count = 3,
  color = C.signal,
  maxR = 900,
  dur = 30,
  width = 10,
}) => {
  const frame = useCurrentFrame();
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
      {Array.from({ length: count }, (_, i) => {
        const t = frame - start - i * 5;
        if (t < 0 || t > dur) return null;
        const p = interpolate(t, [0, dur], [0, 1], { ...clamp, easing: ease.outExpo });
        return <circle key={i} cx={x} cy={y} r={40 + p * maxR} fill="none" stroke={color} strokeWidth={width * (1 - p) + 1} opacity={1 - p} />;
      })}
    </svg>
  );
};

// 방사형 스피드 라인 — 드롭 순간의 폭발
export const SpeedLines: React.FC<{ start: number; dur?: number; count?: number; color?: string; x?: number; y?: number }> = ({ start, dur = 22, count = 42, color = "rgba(255,255,255,0.55)", x = 960, y = 540 }) => {
  const frame = useCurrentFrame();
  const t = frame - start;
  if (t < 0 || t > dur) return null;
  const p = t / dur;
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
      {Array.from({ length: count }, (_, i) => {
        const a = random(`sl${i}`) * Math.PI * 2;
        const r0 = 260 + random(`sr${i}`) * 300 + p * 900;
        const len = 120 + random(`sL${i}`) * 260;
        return (
          <line
            key={i}
            x1={x + Math.cos(a) * r0}
            y1={y + Math.sin(a) * r0}
            x2={x + Math.cos(a) * (r0 + len)}
            y2={y + Math.sin(a) * (r0 + len)}
            stroke={color}
            strokeWidth={2 + random(`sw${i}`) * 5}
            strokeLinecap="round"
            opacity={(1 - p) ** 1.2}
          />
        );
      })}
    </svg>
  );
};

// 라이트 릭 — 오렌지·코발트 빛이 화면을 가로지른다
export const LightLeak: React.FC<{ start: number; dur?: number; color?: string; opacity?: number }> = ({ start, dur = 60, color = "255,90,31", opacity = 0.55 }) => {
  const frame = useCurrentFrame();
  const t = frame - start;
  if (t < 0 || t > dur) return null;
  const p = t / dur;
  const x = interpolate(p, [0, 1], [-30, 130]);
  const a = Math.sin(p * Math.PI) * opacity;
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 45% 80% at ${x}% 40%, rgba(${color},${a}) 0%, rgba(${color},0) 70%)`,
        mixBlendMode: "screen",
        pointerEvents: "none",
      }}
    />
  );
};

// 마퀴 — 화면을 가로질러 흐르는 대형 아웃라인 텍스트. offset은 Sequence 안에서 바깥 마퀴와 위치를 이어 붙일 때의 시작 프레임
export const Marquee: React.FC<{ text: string; y: number; size?: number; speed?: number; outline?: boolean; color?: string; opacity?: number; offset?: number }> = ({
  text,
  y,
  size = 300,
  speed = 9,
  outline = true,
  color = C.white,
  opacity = 1,
  offset = 0,
}) => {
  const frame = useCurrentFrame() + offset;
  const unit = `${text}  `;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: y,
        whiteSpace: "nowrap",
        transform: `translateX(${-frame * speed}px)`,
        fontFamily: FONT.num,
        fontSize: size,
        lineHeight: 1,
        letterSpacing: "0.01em",
        color: outline ? "transparent" : color,
        WebkitTextStroke: outline ? `3px ${color}` : undefined,
        opacity,
      }}
    >
      {unit.repeat(6)}
    </div>
  );
};
