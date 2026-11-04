import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT_FAMILY } from "../lib/fonts";
import { clamp, PUNCH, sp } from "../lib/motion";
import { C } from "../lib/theme";

// 오로라 오브 — 유리 뒤에서 천천히 흐르는 연두·브랜드 그린 빛. 글래스모피즘이 '유리'로 읽히려면 뒤에 색이 있어야 한다.
export const AuroraOrbs: React.FC<{ width: number; height: number; delay?: number; style?: React.CSSProperties }> = ({ width, height, delay = 0, style }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame - delay, [0, 20], [0, 1], clamp);
  const orbs = [
    { c: "rgba(200,240,90,0.95)", r: 230, x: 0.28 + Math.sin(frame / 70) * 0.08, y: 0.42 + Math.cos(frame / 90) * 0.1 },
    { c: "rgba(0,144,96,0.65)", r: 200, x: 0.72 + Math.cos(frame / 80) * 0.08, y: 0.5 + Math.sin(frame / 75) * 0.1 },
    { c: "rgba(216,255,92,0.9)", r: 170, x: 0.5 + Math.sin(frame / 55) * 0.12, y: 0.78 + Math.cos(frame / 65) * 0.08 },
    { c: "rgba(8,71,52,0.35)", r: 150, x: 0.56 + Math.cos(frame / 95) * 0.1, y: 0.2 + Math.sin(frame / 85) * 0.08 },
  ];
  return (
    <div style={{ position: "absolute", width, height, pointerEvents: "none", opacity: o, filter: "blur(38px)", ...style }}>
      {orbs.map((b, i) => (
        <div key={i} style={{ position: "absolute", left: b.x * width - b.r, top: b.y * height - b.r, width: b.r * 2, height: b.r * 2, borderRadius: 999, background: `radial-gradient(circle, ${b.c} 0%, rgba(255,255,255,0) 70%)` }} />
      ))}
    </div>
  );
};

// 글래스 버튼 — 반투명 유리 알약 + 흰 테두리 하이라이트 + 상단 광택 + 빛 스침 + 은은한 연두 글로우. 화살표는 연두 원 배지.
export const GlassButton: React.FC<{ label: string; width: number; height: number; delay?: number; fontSize?: number; style?: React.CSSProperties }> = ({ label, width, height, delay = 0, fontSize = 50, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = sp(frame - delay, fps, PUNCH);
  const o = interpolate(frame - delay, [0, 5], [0, 1], clamp);
  const float = Math.sin(frame / 26) * 3;
  const pulse = 0.5 + 0.5 * Math.sin(frame / 14);
  const sheen = ((frame - delay) % 84) / 84; // 84프레임마다 빛이 한 번 스친다
  const sheenX = interpolate(sheen, [0, 0.55, 1], [-60, 130, 130], clamp);
  const nudge = Math.max(0, Math.sin(frame / 5)) * 6;
  return (
    <div
      style={{
        position: "relative",
        width,
        height,
        borderRadius: 999,
        opacity: o,
        transform: `translateY(${interpolate(s, [0, 1], [40, 0]) + float}px) scale(${interpolate(s, [0, 1], [0.7, 1])})`,
        ...style,
      }}
    >
      {/* 글로우 */}
      <div style={{ position: "absolute", inset: -6, borderRadius: 999, boxShadow: `0 0 ${50 + pulse * 30}px rgba(200,240,90,${0.45 + pulse * 0.25}), 0 30px 70px rgba(8,71,52,0.18)`, pointerEvents: "none" }} />
      {/* 유리 */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 999,
          background: "linear-gradient(180deg, rgba(255,255,255,0.62) 0%, rgba(255,255,255,0.28) 100%)",
          backdropFilter: "blur(26px) saturate(1.5)",
          WebkitBackdropFilter: "blur(26px) saturate(1.5)",
          border: "1.5px solid rgba(255,255,255,0.85)",
          boxShadow: "inset 0 1.5px 0 rgba(255,255,255,0.95), inset 0 -18px 40px rgba(200,240,90,0.22), 0 1px 0 rgba(8,71,52,0.08)",
          overflow: "hidden",
        }}
      >
        {/* 상단 광택 */}
        <div style={{ position: "absolute", left: "6%", right: "6%", top: 6, height: height * 0.42, borderRadius: 999, background: "linear-gradient(180deg, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0) 100%)" }} />
        {/* 빛 스침 */}
        <div style={{ position: "absolute", top: -20, bottom: -20, left: `${sheenX}%`, width: "26%", background: "linear-gradient(100deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.85) 50%, rgba(255,255,255,0) 100%)", transform: "skewX(-18deg)", opacity: 0.8 }} />
      </div>
      {/* 내용 */}
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 22, fontFamily: FONT_FAMILY, fontSize, fontWeight: 800, color: C.forest, letterSpacing: "-0.02em", textShadow: "0 1px 0 rgba(255,255,255,0.8)" }}>
        {label}
        <span style={{ width: height * 0.5, height: height * 0.5, borderRadius: 999, background: C.lime, color: C.ink, display: "grid", placeItems: "center", fontSize: fontSize * 0.62, fontWeight: 600, boxShadow: "0 6px 18px rgba(139,201,38,0.45), inset 0 1px 0 rgba(255,255,255,0.7)", transform: `translateX(${nudge}px)` }}>→</span>
      </div>
    </div>
  );
};
