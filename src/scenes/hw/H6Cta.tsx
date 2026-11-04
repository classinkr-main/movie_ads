import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { BottomShade, Fade, Lines, Plate, Spec, t, Vignette } from "../../components/Cine";
import { LogoStacked } from "../../components/Ui";
import { clamp, PUNCH, SMOOTH, sp } from "../../lib/motion";
import { H } from "../../lib/hwTheme";

const CTA_URL = "classin.co.kr/contact";

// S6 — 라인업 + CTA
export const H6Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const btn = sp(frame - 44, fps, PUNCH);
  const nudge = Math.max(0, Math.sin(frame / 5)) * 8;
  const logo = sp(frame - 8, fps, SMOOTH, 24);
  return (
    <AbsoluteFill style={{ background: H.bg }}>
      <Plate src="hw/lineup.jpg" w={1408} h={768} zoom={[1.16, 1.04]} focus={[0.5, 0.55]} over={166} grade="brightness(0.6) contrast(1.08) saturate(0.85)" />
      <Vignette strength={0.7} />
      <BottomShade height={760} opacity={1} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(7,9,8,0.55) 0%, rgba(7,9,8,0) 40%)" }} />

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: 150 }}>
        <div style={{ opacity: logo, transform: `translateY(${(1 - logo) * 20}px)` }}>
          <LogoStacked height={120} />
        </div>
        <Lines lines={["교실의 기준이 되는 보드"]} delay={18} size={84} style={{ marginTop: 26, alignItems: "center", textAlign: "center" }} />
        <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
          {["S65", "S75", "S86", "S110"].map((m, i) => (
            <Spec key={m} value={m} delay={30 + i * 4} size={18} />
          ))}
        </div>
        <div style={{ marginTop: 32, opacity: interpolate(frame - 44, [0, 4], [0, 1], clamp), transform: `scale(${0.7 + btn * 0.3})` }}>
          <div style={{ height: 112, padding: "0 64px", borderRadius: 999, background: H.green, color: H.white, ...t(44, 800, H.white, { letterSpacing: "-0.02em" }), display: "flex", alignItems: "center", gap: 20, boxShadow: "0 24px 70px rgba(0,163,108,0.45)" }}>
            지금 문의하기
            <span style={{ display: "inline-block", transform: `translateX(${nudge}px)`, fontWeight: 400 }}>→</span>
          </div>
        </div>
        <Fade delay={56} y={10} style={{ marginTop: 24 }}>
          <div style={t(34, 700, H.mint, { letterSpacing: "0" })}>{CTA_URL}</div>
        </Fade>
        <Fade delay={66} y={10} style={{ marginTop: 12 }}>
          <div style={t(20, 500, H.dim)}>데모 신청 · 설치와 교사 온보딩 포함 · 30일 만족 보장</div>
        </Fade>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
