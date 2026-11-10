import React from "react";
import { AbsoluteFill, Easing, interpolate, random, staticFile, useCurrentFrame } from "remotion";

export const clampX = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
export const easeOut = Easing.out(Easing.cubic);
export const easeIn = Easing.in(Easing.cubic);
export const easeInOut = Easing.inOut(Easing.cubic);
export const easeOutExpo = Easing.out(Easing.exp);
export const easeOutBack = Easing.out(Easing.back(1.7));

export const ramp = (f: number, a: number, b: number, from = 0, to = 1, easing = easeOut) =>
  interpolate(f, [a, b], [from, to], { ...clampX, easing });

/* ---------- SVG 필터 래퍼 ---------- */

// 방향성 모션블러 — feGaussianBlur의 x/y 표준편차를 따로 줘서 휩 팬 잔상을 만든다
export const DirBlur: React.FC<{ id: string; x: number; y: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ id, x, y, children, style }) => {
  if (x < 0.3 && y < 0.3) return <AbsoluteFill style={style}>{children}</AbsoluteFill>;
  return (
    <AbsoluteFill style={style}>
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <filter id={id} x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
          <feGaussianBlur stdDeviation={`${x.toFixed(2)} ${y.toFixed(2)}`} edgeMode="duplicate" />
        </filter>
      </svg>
      <AbsoluteFill style={{ filter: `url(#${id})` }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

// RGB 분리(색수차) — 임팩트·글리치 순간에만
export const RgbSplit: React.FC<{ id: string; amount: number; children: React.ReactNode; vertical?: boolean }> = ({ id, amount, children, vertical }) => {
  if (Math.abs(amount) < 0.4) return <AbsoluteFill>{children}</AbsoluteFill>;
  const dx = vertical ? 0 : amount;
  const dy = vertical ? amount : 0;
  return (
    <AbsoluteFill>
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <filter id={id} x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
          <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r" />
          <feOffset in="r" dx={dx} dy={dy} result="r2" />
          <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g" />
          <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b" />
          <feOffset in="b" dx={-dx} dy={-dy} result="b2" />
          <feBlend in="r2" in2="g" mode="screen" result="rg" />
          <feBlend in="rg" in2="b2" mode="screen" />
        </filter>
      </svg>
      <AbsoluteFill style={{ filter: `url(#${id})` }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------- 카메라 셰이크 ---------- */
export const shakeAt = (frame: number, start: number, amp: number, len = 12, seed = "s") => {
  const t = frame - start;
  if (t < 0 || t > len) return { x: 0, y: 0, r: 0 };
  const k = Math.pow(1 - t / len, 2);
  return {
    x: (random(`${seed}x${t}`) - 0.5) * 2 * amp * k,
    y: (random(`${seed}y${t}`) - 0.5) * 2 * amp * k,
    r: (random(`${seed}r${t}`) - 0.5) * 1.2 * k,
  };
};

/* ---------- 오버레이 ---------- */

// 필름 그레인 — 256px 노이즈 타일 4장을 프레임마다 위치를 바꿔 깐다
export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.09 }) => {
  const frame = useCurrentFrame();
  const i = Math.floor(frame / 2) % 4;
  const ox = Math.floor(random(`gx${frame}`) * 256);
  const oy = Math.floor(random(`gy${frame}`) * 256);
  return (
    <AbsoluteFill
      style={{
        backgroundImage: `url(${staticFile(`guangzhou/fx/grain${i}.png`)})`,
        backgroundSize: "320px 320px",
        backgroundPosition: `${ox}px ${oy}px`,
        mixBlendMode: "overlay",
        opacity,
        pointerEvents: "none",
      }}
    />
  );
};

export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.38 }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse 75% 62% at 50% 48%, rgba(0,0,0,0) 55%, rgba(0,0,0,${strength}) 100%)`, pointerEvents: "none" }} />
);

export const Flash: React.FC<{ opacity: number; color?: string }> = ({ opacity, color = "#FFFFFF" }) =>
  opacity > 0.002 ? <AbsoluteFill style={{ background: color, opacity, pointerEvents: "none" }} /> : null;

// 라이트 릭 — 따뜻한 빛번짐이 화면을 가로질러 흐른다 (screen 블렌드)
export const LightLeak: React.FC<{ start: number; len?: number; from?: "left" | "right"; hue?: "warm" | "lime" }> = ({ start, len = 22, from = "right", hue = "warm" }) => {
  const frame = useCurrentFrame();
  const t = frame - start;
  if (t < 0 || t > len) return null;
  const p = t / len;
  const a = Math.sin(Math.PI * p);
  const x = from === "right" ? 115 - p * 140 : -15 + p * 140;
  const c1 = hue === "warm" ? "255,154,60" : "200,240,90";
  const c2 = hue === "warm" ? "255,79,123" : "255,236,140";
  return (
    <AbsoluteFill style={{ mixBlendMode: "screen", opacity: 0.85 * a, pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 55% 38% at ${x}% ${38 + p * 12}%, rgba(${c1},0.9) 0%, rgba(${c1},0) 70%)` }} />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 40% 30% at ${x + 18}% ${62 - p * 10}%, rgba(${c2},0.65) 0%, rgba(${c2},0) 70%)` }} />
    </AbsoluteFill>
  );
};

/* ---------- 아이콘 ---------- */
export const PinIcon: React.FC<{ size?: number; color?: string; dot?: string }> = ({ size = 34, color = "#084734", dot = "#C8F05A" }) => (
  <svg width={size} height={size * 1.25} viewBox="0 0 24 30">
    <path d="M12 0C5.6 0 1 4.7 1 10.8 1 18.4 12 30 12 30s11-11.6 11-19.2C23 4.7 18.4 0 12 0z" fill={color} />
    <circle cx="12" cy="10.8" r="4.4" fill={dot} />
  </svg>
);

export const PlaneIcon: React.FC<{ size?: number; color?: string }> = ({ size = 56, color = "#FFFFFF" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d="M21.5 15.5v-2l-8-5V3a1.5 1.5 0 0 0-3 0v5.5l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5l-2-1.5v-6z" fill={color} />
  </svg>
);
