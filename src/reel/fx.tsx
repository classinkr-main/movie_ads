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

/* ---------- 시네마틱 장치 ---------- */

// 아나모픽 렌즈 플레어 — 수평 스트릭 + 코어 글로우 + 반대편 고스트. at 프레임에 정점.
export const AnaFlare: React.FC<{ at: number; x: number; y: number; len?: number; width?: number; strength?: number; ghosts?: boolean }> = ({ at, x, y, len = 34, width = 1900, strength = 1, ghosts: showGhosts = true }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [at - 6, at, at + len], [0, 1, 0], { ...clamp, easing: (t) => t });
  if (o <= 0) return null;
  const k = o * strength;
  const ghosts = showGhosts ? [-0.55, -0.25, 0.35] : [];
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen" }}>
      <div style={{ position: "absolute", left: x - (width * (0.7 + 0.3 * o)) / 2, top: y - 3, width: width * (0.7 + 0.3 * o), height: 6, borderRadius: 6, background: `linear-gradient(90deg, rgba(${R.accentRgb},0) 0%, rgba(${R.accentRgb},${0.55 * k}) 30%, rgba(255,255,255,${0.95 * k}) 50%, rgba(${R.accentRgb},${0.55 * k}) 70%, rgba(${R.accentRgb},0) 100%)`, filter: "blur(1.5px)" }} />
      <div style={{ position: "absolute", left: x - width / 2, top: y - 26, width, height: 52, background: `radial-gradient(ellipse 50% 50% at 50% 50%, rgba(${R.accentRgb},${0.28 * k}) 0%, rgba(${R.accentRgb},0) 100%)` }} />
      <div style={{ position: "absolute", left: x - 140, top: y - 140, width: 280, height: 280, borderRadius: 999, background: `radial-gradient(circle, rgba(255,255,255,${0.75 * k}) 0%, rgba(${R.accentRgb},${0.3 * k}) 30%, rgba(${R.accentRgb},0) 70%)` }} />
      {ghosts.map((g, i) => {
        const gx = 960 + (960 - x) * g * 2;
        const gy = 540 + (540 - y) * g * 2;
        const r = 40 + i * 34;
        return <div key={i} style={{ position: "absolute", left: gx - r, top: gy - r, width: r * 2, height: r * 2, borderRadius: 999, border: `2px solid rgba(${R.accentRgb},${0.18 * k})`, background: `radial-gradient(circle, rgba(${R.accentRgb},${0.1 * k}) 0%, rgba(${R.accentRgb},0) 70%)` }} />;
      })}
    </AbsoluteFill>
  );
};

// 라이트 릭 — 화면 가장자리에서 번지는 부드러운 빛(필름 노출 번짐). 민트·화이트 톤만 쓴다.
export const LightLeak: React.FC<{ at: number; len?: number; side?: "left" | "right" | "top"; peak?: number }> = ({ at, len = 40, side = "left", peak = 0.5 }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - at, [0, len], [0, 1], clamp);
  if (p <= 0 || p >= 1) return null;
  const o = Math.sin(p * Math.PI) * peak;
  const drift = (p - 0.5) * 30;
  const cx = side === "left" ? 8 + drift : side === "right" ? 92 - drift : 50 + drift;
  const cy = side === "top" ? 4 : 40 + drift * 0.4;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen", opacity: o }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 38% 60% at ${cx}% ${cy}%, rgba(255,255,255,0.85) 0%, rgba(${R.accentRgb},0.55) 30%, rgba(${R.accentRgb},0) 70%)` }} />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 22% 40% at ${cx + (side === "right" ? -14 : 14)}% ${cy + 18}%, rgba(255,246,226,0.5) 0%, rgba(255,246,226,0) 70%)` }} />
    </AbsoluteFill>
  );
};

// 먼지·보케 입자 — 빛 속을 천천히 떠다닌다(결정론적 난수)
export const Dust: React.FC<{ count?: number; seed?: string; opacity?: number }> = ({ count = 46, seed = "dust", opacity = 0.7 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen", opacity }}>
      {Array.from({ length: count }).map((_, i) => {
        const r1 = random(`${seed}x${i}`);
        const r2 = random(`${seed}y${i}`);
        const r3 = random(`${seed}s${i}`);
        const z = 0.3 + r3 * 0.7; // 깊이 — 가까울수록 크고 빠르고 흐리다
        const x = ((r1 * 2100 + frame * (0.25 + z * 0.9)) % 2100) - 90;
        const y = r2 * 1080 + Math.sin(frame / (40 + r3 * 50) + i) * 14 * z;
        const size = 2 + z * z * 16;
        const tw = 0.45 + 0.55 * Math.abs(Math.sin(frame / (22 + r1 * 30) + i * 1.7));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: size,
              height: size,
              borderRadius: 999,
              background: `radial-gradient(circle, rgba(255,255,255,${0.9 * tw}) 0%, rgba(${R.accentRgb},${0.35 * tw}) 45%, rgba(${R.accentRgb},0) 72%)`,
              filter: z > 0.8 ? `blur(${(z - 0.8) * 12}px)` : undefined,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// 임팩트 카메라 흔들림 — 지정 프레임에서 감쇠 진동(px). 가장자리가 비지 않도록 호출부에서 살짝 확대한다.
export const shakeAt = (frame: number, hits: readonly number[], amp = 7, len = 16) => {
  let x = 0;
  let y = 0;
  for (const h of hits) {
    const t = frame - h;
    if (t < 0 || t > len) continue;
    const decay = Math.exp(-t / (len / 4));
    x += Math.sin(t * 2.1 + h) * amp * decay;
    y += Math.cos(t * 2.7 + h * 0.7) * amp * 0.7 * decay;
  }
  return { x, y };
};

// 레터박스 — 2.39:1 바. open 0이면 바가 다 내려온 상태, 1이면 걷힌 상태.
export const Letterbox: React.FC<{ open: number; ratio?: number }> = ({ open, ratio = 2.39 }) => {
  const bar = ((1080 - 1920 / ratio) / 2) * (1 - open);
  if (bar <= 0.5) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: bar, background: "#000" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: bar, background: "#000" }} />
    </AbsoluteFill>
  );
};
