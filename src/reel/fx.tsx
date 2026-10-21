import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp } from "../lib/motion";
import { FONT_FAMILY } from "../lib/fonts";
import { R } from "./theme";

// 필름 그레인 — 다크 톤 위에서도 보이도록 overlay 블렌드. 2프레임마다 시드를 바꿔 60fps에서도 필름 질감을 유지한다.
export const FilmGrain: React.FC<{ opacity?: number }> = ({ opacity = 0.07 }) => {
  const frame = useCurrentFrame();
  const seed = Math.floor(random(`grain${Math.floor(frame / 2)}`) * 1000);
  return (
    <AbsoluteFill
      style={{
        opacity,
        mixBlendMode: "overlay",
        pointerEvents: "none",
        backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='256' height='256'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' seed='${seed}' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`,
        backgroundSize: "256px 256px",
      }}
    />
  );
};

export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.5 }) => (
  <AbsoluteFill style={{ pointerEvents: "none", background: `radial-gradient(ellipse 75% 70% at 50% 50%, rgba(0,0,0,0) 50%, rgba(0,0,0,${strength}) 100%)` }} />
);

// 컷 플래시 — at 프레임에 정점, len 프레임 동안 빠진다
export const Flash: React.FC<{ at: number; len?: number; peak?: number; color?: string }> = ({ at, len = 10, peak = 0.55, color = "#FFFFFF" }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [at - 2, at, at + len], [0, peak, 0], clamp);
  if (o <= 0) return null;
  return <AbsoluteFill style={{ background: color, opacity: o, mixBlendMode: "screen", pointerEvents: "none" }} />;
};

// 광택 스윕 — 사선 빛줄기가 한 번 지나간다
export const LightSweep: React.FC<{ from: number; dur?: number; width?: number; opacity?: number; angle?: number }> = ({ from, dur = 40, width = 18, opacity = 0.35, angle = 20 }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - from, [0, dur], [-30, 130], clamp);
  if (frame < from || frame > from + dur) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          top: "-30%",
          bottom: "-30%",
          left: `${p}%`,
          width: `${width}%`,
          transform: `rotate(${angle}deg)`,
          background: `linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,${opacity}) 50%, rgba(255,255,255,0) 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};

// 모노 라벨 — HUD·캡션용 작은 대문자
export const Mono: React.FC<{ children: React.ReactNode; size?: number; color?: string; style?: React.CSSProperties }> = ({ children, size = 16, color = R.mute, style }) => (
  <span style={{ fontFamily: FONT_FAMILY, fontSize: size, fontWeight: 700, letterSpacing: "0.24em", textTransform: "uppercase", color, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap", ...style }}>{children}</span>
);

// 타임코드 HH:MM:SS:FF — 실제 60fps 프레임을 센다
export const Timecode: React.FC<{ offset?: number; size?: number; color?: string }> = ({ offset = 0, size = 16, color }) => {
  const frame = useCurrentFrame() + offset;
  const { fps } = useVideoConfig();
  const ff = frame % fps;
  const s = Math.floor(frame / fps);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <Mono size={size} color={color}>
      {pad(Math.floor(s / 3600))}:{pad(Math.floor(s / 60) % 60)}:{pad(s % 60)}:{pad(ff)}
    </Mono>
  );
};

// 뷰파인더 모서리 브래킷
export const Brackets: React.FC<{ inset?: number; len?: number; color?: string; thick?: number; opacity?: number }> = ({ inset = 48, len = 44, color = R.white, thick = 3, opacity = 0.85 }) => {
  const c = (pos: React.CSSProperties, bt: string, bl: string) => (
    <div style={{ position: "absolute", width: len, height: len, ...pos, borderTop: bt, borderLeft: bl, opacity }} />
  );
  const b = `${thick}px solid ${color}`;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {c({ left: inset, top: inset }, b, b)}
      <div style={{ position: "absolute", width: len, height: len, right: inset, top: inset, borderTop: b, borderRight: b, opacity }} />
      <div style={{ position: "absolute", width: len, height: len, right: inset, bottom: inset, borderBottom: b, borderRight: b, opacity }} />
      <div style={{ position: "absolute", width: len, height: len, left: inset, bottom: inset, borderBottom: b, borderLeft: b, opacity }} />
    </AbsoluteFill>
  );
};

// 녹화 표시 — 0.5초 간격으로 깜빡인다
export const RecDot: React.FC<{ size?: number; label?: string }> = ({ size = 20, label = "REC" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const on = Math.floor(frame / (fps / 2)) % 2 === 0;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: size * 0.5 }}>
      <span style={{ width: size * 0.7, height: size * 0.7, borderRadius: 999, background: "#FF4D3D", opacity: on ? 1 : 0.25, boxShadow: on ? "0 0 18px rgba(255,77,61,0.8)" : "none" }} />
      <Mono size={size} color={R.white}>
        {label}
      </Mono>
    </span>
  );
};
