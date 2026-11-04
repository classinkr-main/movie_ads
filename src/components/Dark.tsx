import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT_FAMILY } from "../lib/fonts";
import { clamp, SMOOTH, sp } from "../lib/motion";
import { D } from "../lib/themeDark";

export const td = (size: number, weight: number, color: string, extra?: React.CSSProperties): React.CSSProperties => ({
  fontFamily: FONT_FAMILY,
  fontSize: size,
  fontWeight: weight,
  color,
  letterSpacing: "-0.01em",
  ...extra,
});

// 다크 스테이지 — 딥 포레스트 그라데이션 + 헤어라인 그리드 + 천천히 떠다니는 연두 빛 + 비네트
export const DarkStage: React.FC<{ children?: React.ReactNode; drift?: boolean; glow?: number }> = ({ children, drift = true, glow = 1 }) => {
  const frame = useCurrentFrame();
  const gx = 74 + Math.sin(frame / 110) * 12;
  const gy = 28 + Math.cos(frame / 130) * 12;
  const g2x = 16 + Math.cos(frame / 140) * 10;
  const g2y = 80 + Math.sin(frame / 105) * 8;
  return (
    <AbsoluteFill style={{ background: `linear-gradient(160deg, ${D.bg1} 0%, ${D.bg0} 55%, #08140F 100%)` }}>
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${D.line} 1px, transparent 1px), linear-gradient(90deg, ${D.line} 1px, transparent 1px)`,
          backgroundSize: "96px 96px",
          backgroundPosition: `${(frame * 0.12) % 96}px 0`,
          opacity: 0.5,
        }}
      />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 36% 48% at ${gx}% ${gy}%, rgba(200,240,90,${0.16 * glow}) 0%, rgba(200,240,90,0) 70%)` }} />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 32% 42% at ${g2x}% ${g2y}%, rgba(0,144,96,${0.22 * glow}) 0%, rgba(0,144,96,0) 70%)` }} />
      <AbsoluteFill style={drift ? { transform: `scale(${1 + Math.min(frame, 180) * 0.0002}) translate(${Math.sin(frame / 90) * 4}px, ${Math.cos(frame / 105) * 3}px)`, transformOrigin: "50% 50%" } : undefined}>{children}</AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 80% 80% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%)", pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

// 유리 카드(다크) — 반투명 표면 + 상단 하이라이트 라인 + 깊은 그림자, 살짝 떠다니는 3D 틸트
export const GlassDark: React.FC<{ children: React.ReactNode; width: number; padding?: number; style?: React.CSSProperties; tilt?: number; radius?: number }> = ({ children, width, padding = 32, style, tilt = 1.2, radius = 32 }) => {
  const frame = useCurrentFrame();
  const rx = Math.sin(frame / 55) * tilt;
  const ry = Math.cos(frame / 70) * tilt;
  return (
    <div
      style={{
        width,
        position: "relative",
        background: `linear-gradient(180deg, ${D.glass2} 0%, ${D.glass} 100%)`,
        border: `1px solid ${D.line2}`,
        borderRadius: radius,
        boxShadow: "0 50px 120px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.12)",
        padding,
        transform: `perspective(1800px) rotateX(${rx}deg) rotateY(${ry}deg)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const CardHeaderDark: React.FC<{ title: string; right?: React.ReactNode }> = ({ title, right }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 16, borderBottom: `1px solid ${D.line}` }}>
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ display: "flex", gap: 6 }}>
        {[0, 1, 2].map((i) => (
          <span key={i} style={{ width: 9, height: 9, borderRadius: 999, background: i === 0 ? D.lime : D.line2 }} />
        ))}
      </div>
      <span style={td(21, 700, D.ink)}>{title}</span>
    </div>
    {right}
  </div>
);

// 빛이 스치는 텍스트 — 흰 글자 위로 연두 하이라이트가 한 번 지나간다
export const Shine: React.FC<{ children: React.ReactNode; delay?: number; duration?: number; base?: string; style?: React.CSSProperties }> = ({ children, delay = 0, duration = 40, base = D.ink, style }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame - delay, [0, duration], [-60, 160], clamp);
  return (
    <span
      style={{
        backgroundImage: `linear-gradient(100deg, ${base} 0%, ${base} ${t - 18}%, ${D.lime} ${t}%, ${base} ${t + 18}%, ${base} 100%)`,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
        display: "inline-block",
        ...style,
      }}
    >
      {children}
    </span>
  );
};

// 알약 칩(다크 기본값)
export const ChipDark: React.FC<{ delay?: number; children: React.ReactNode; tone?: "lime" | "solid" | "ghost" | "mute"; size?: number; style?: React.CSSProperties }> = ({ delay = 0, children, tone = "lime", size = 15, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = sp(frame - delay, fps, { damping: 16, stiffness: 200, mass: 0.7 });
  const o = interpolate(frame - delay, [0, 4], [0, 1], clamp);
  const look =
    tone === "solid"
      ? { background: D.lime, color: "#0A1A14", border: "1px solid transparent" }
      : tone === "ghost"
        ? { background: "transparent", color: D.ink, border: `1px solid ${D.line2}` }
        : tone === "mute"
          ? { background: D.glass2, color: D.mute, border: "1px solid transparent" }
          : { background: D.limeDim, color: D.lime, border: "1px solid rgba(200,240,90,0.25)" };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, ...td(size, 700, look.color), background: look.background, border: look.border, borderRadius: 999, padding: `${size * 0.38}px ${size * 0.85}px`, whiteSpace: "nowrap", opacity: o, transform: `scale(${0.5 + s * 0.5})`, ...style }}>
      {children}
    </span>
  );
};

// 다크 배경용 흰색 반전 로고
export const LogoStackedWhite: React.FC<{ height: number; style?: React.CSSProperties }> = ({ height, style }) => (
  <Img src={staticFile("brand/classin-logo-stacked.png")} style={{ height, width: "auto", display: "block", filter: "brightness(0) invert(1)", ...style }} />
);

// 공통 등장 — 아래에서 올라오며 블러가 걷힌다
export const Reveal: React.FC<{ delay?: number; children: React.ReactNode; style?: React.CSSProperties; distance?: number; duration?: number }> = ({ delay = 0, children, style, distance = 28, duration = 22 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = sp(frame - delay, fps, SMOOTH, duration);
  const o = interpolate(frame - delay, [0, 8], [0, 1], clamp);
  const b = interpolate(frame - delay, [0, 10], [10, 0], clamp);
  return <div style={{ opacity: o, transform: `translateY(${(1 - s) * distance}px)`, filter: b > 0.3 ? `blur(${b}px)` : undefined, ...style }}>{children}</div>;
};
