import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, sp } from "../lib/motion";
import { R } from "./theme";

/*
 * 음영 아이콘 — 단색(화이트 → 민트) 글리프를 그라데이션 음영·반사광·바닥 그림자로만 입체감 있게 그린 미니멀 아이콘.
 * S2 녹화(camera) · 데이터(data) 비트의 카피 블록 위에 놓인다. at 프레임에 스프링으로 떠오르고 천천히 떠 있다.
 */
type Kind = "camera" | "data";

const Defs: React.FC<{ id: string }> = ({ id }) => (
  <defs>
    {/* 몸체: 위 왼쪽이 밝고 아래로 갈수록 민트 */}
    <linearGradient id={`${id}-body`} x1="0.2" y1="0" x2="0.75" y2="1">
      <stop offset="0%" stopColor="#FBFFFD" />
      <stop offset="55%" stopColor="#D5F8EA" />
      <stop offset="100%" stopColor={R.accent} />
    </linearGradient>
    {/* 아래쪽 그늘 */}
    <linearGradient id={`${id}-shade`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="45%" stopColor="#084734" stopOpacity={0} />
      <stop offset="100%" stopColor="#084734" stopOpacity={0.34} />
    </linearGradient>
    {/* 렌즈 링 · 유리 */}
    <linearGradient id={`${id}-ring`} x1="0.2" y1="0.1" x2="0.8" y2="1">
      <stop offset="0%" stopColor="#1C7A5B" />
      <stop offset="100%" stopColor="#042219" />
    </linearGradient>
    <radialGradient id={`${id}-glass`} cx="0.38" cy="0.32" r="0.75">
      <stop offset="0%" stopColor="#6EE7B7" />
      <stop offset="45%" stopColor="#13805C" />
      <stop offset="100%" stopColor="#041F17" />
    </radialGradient>
    <linearGradient id={`${id}-bar-side`} x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stopColor="#084734" stopOpacity={0} />
      <stop offset="100%" stopColor="#084734" stopOpacity={0.28} />
    </linearGradient>
  </defs>
);

const Camera: React.FC<{ id: string }> = ({ id }) => (
  <g>
    <rect x={36} y={20} width={34} height={20} rx={7} fill={`url(#${id}-body)`} />
    <rect x={12} y={33} width={96} height={66} rx={21} fill={`url(#${id}-body)`} />
    <rect x={12} y={33} width={96} height={66} rx={21} fill={`url(#${id}-shade)`} />
    <path d="M30 39.5 L90 39.5" stroke="#FFFFFF" strokeOpacity={0.85} strokeWidth={2.2} strokeLinecap="round" />
    <circle cx={60} cy={67} r={24} fill={`url(#${id}-ring)`} />
    <circle cx={60} cy={67} r={24} fill="none" stroke="#FFFFFF" strokeOpacity={0.35} strokeWidth={1.5} />
    <circle cx={60} cy={67} r={15.5} fill={`url(#${id}-glass)`} />
    <ellipse cx={54} cy={60.5} rx={5.2} ry={3.6} fill="#FFFFFF" fillOpacity={0.88} transform="rotate(-24 54 60.5)" />
    <circle cx={66} cy={74} r={2} fill="#FFFFFF" fillOpacity={0.35} />
    <circle cx={92} cy={48} r={5.6} fill="#FF5A4A" />
    <circle cx={90.5} cy={46.4} r={1.9} fill="#FFFFFF" fillOpacity={0.75} />
  </g>
);

const Data: React.FC<{ id: string }> = ({ id }) => {
  const bars = [
    { x: 18, h: 34 },
    { x: 48, h: 54 },
    { x: 78, h: 76 },
  ];
  return (
    <g>
      {bars.map((b) => (
        <g key={b.x}>
          <rect x={b.x} y={98 - b.h} width={24} height={b.h} rx={7} fill={`url(#${id}-body)`} />
          <rect x={b.x} y={98 - b.h} width={24} height={b.h} rx={7} fill={`url(#${id}-bar-side)`} />
          <rect x={b.x} y={98 - b.h} width={24} height={b.h} rx={7} fill={`url(#${id}-shade)`} />
          <path d={`M${b.x + 5} ${98 - b.h + 4.5} L${b.x + 16} ${98 - b.h + 4.5}`} stroke="#FFFFFF" strokeOpacity={0.9} strokeWidth={2} strokeLinecap="round" />
        </g>
      ))}
      <path d="M30 52 L60 33 L90 11" fill="none" stroke="#0B5E43" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
      {[
        [30, 52],
        [60, 33],
        [90, 11],
      ].map(([x, y]) => (
        <circle key={x} cx={x} cy={y} r={5.5} fill="#FFFFFF" stroke="#0B5E43" strokeWidth={3} />
      ))}
      <path d="M12 104 L108 104" stroke="#FFFFFF" strokeOpacity={0.45} strokeWidth={3} strokeLinecap="round" />
    </g>
  );
};

export const ShadedIcon: React.FC<{ kind: Kind; size?: number; at?: number }> = ({ kind, size = 116, at = 4 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const k = sp(f - at, fps, { damping: 13, stiffness: 170, mass: 0.8 });
  const o = interpolate(f - at, [0, 8], [0, 1], clamp);
  const float = Math.sin((f - at) / 22) * 3;
  const id = `si-${kind}`;
  return (
    <div style={{ position: "relative", width: size, height: size * 1.08, opacity: o, transform: `translateY(${(1 - k) * 26 + float}px) scale(${0.72 + 0.28 * k})`, transformOrigin: "50% 80%" }}>
      {/* 바닥 그림자 */}
      <div style={{ position: "absolute", left: size * 0.16, right: size * 0.16, bottom: 0, height: size * 0.1, borderRadius: "50%", background: "rgba(0,0,0,0.55)", filter: `blur(${size * 0.05}px)`, transform: `scaleX(${1 - float * 0.015})` }} />
      <svg width={size} height={size} viewBox="0 0 120 120" style={{ position: "absolute", left: 0, top: 0, filter: "drop-shadow(0 10px 12px rgba(0,0,0,0.45))" }}>
        <Defs id={id} />
        {kind === "camera" ? <Camera id={id} /> : <Data id={id} />}
      </svg>
    </div>
  );
};
