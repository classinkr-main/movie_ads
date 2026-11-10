import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT_FAMILY } from "../fonts";
import { clamp, sp } from "../motion";
import { C } from "./theme";

// 카드 공통 셸
export const UiCard: React.FC<{ children: React.ReactNode; width: number; style?: React.CSSProperties; padding?: number; tilt?: number }> = ({ children, width, style, padding = 36, tilt = 1.5 }) => {
  const frame = useCurrentFrame();
  const rx = Math.sin(frame / 50) * tilt;
  const ry = Math.cos(frame / 65) * tilt;
  return (
    <div
      style={{
        width,
        background: C.white,
        border: `1.5px solid ${C.hairline}`,
        borderRadius: 36,
        boxShadow: "0 40px 100px rgba(28,27,23,0.12), 0 2px 8px rgba(28,27,23,0.04)",
        padding,
        transform: `perspective(1800px) rotateX(${rx}deg) rotateY(${ry}deg)`,
        position: "relative",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// 카드 헤더 — 창 점 3개 + 제목
export const CardHeader: React.FC<{ title: string; right?: React.ReactNode }> = ({ title, right }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 18, borderBottom: `1.5px solid ${C.hairline}` }}>
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ display: "flex", gap: 6 }}>
        {[0, 1, 2].map((i) => (
          <span key={i} style={{ width: 10, height: 10, borderRadius: 999, background: i === 0 ? C.lime : C.ivory2 }} />
        ))}
      </div>
      <span style={{ fontFamily: FONT_FAMILY, fontSize: 22, fontWeight: 700, color: C.ink, letterSpacing: "-0.01em" }}>{title}</span>
    </div>
    {right}
  </div>
);

export type StampKind = "ok" | "partial" | "wrong";
export const Stamp: React.FC<{ delay: number; kind: StampKind; size?: number }> = ({ delay, kind, size = 34 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = sp(frame - delay, fps, { damping: 9, stiffness: 300, mass: 0.6 });
  const o = interpolate(frame - delay, [0, 2], [0, 1], clamp);
  const bg = kind === "ok" ? C.lime : kind === "partial" ? C.limeSoft : C.ivory2;
  const color = kind === "ok" ? C.ink : kind === "partial" ? C.limeInk : C.gray;
  const glyph = kind === "ok" ? "✓" : kind === "partial" ? "△" : "✗";
  return (
    <span
      style={{
        display: "inline-grid",
        placeItems: "center",
        width: size,
        height: size,
        borderRadius: 999,
        background: bg,
        border: kind === "partial" ? `2px solid ${C.limeDeep}` : "none",
        boxSizing: "border-box",
        color,
        fontFamily: FONT_FAMILY,
        fontSize: size * 0.52,
        fontWeight: 900,
        opacity: o,
        transform: `scale(${interpolate(s, [0, 1], [2.4, 1])}) rotate(${interpolate(s, [0, 1], [-30, 0])}deg)`,
      }}
    >
      {glyph}
    </span>
  );
};
