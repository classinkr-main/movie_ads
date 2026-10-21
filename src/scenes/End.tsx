import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Flash, Rings } from "../components/Fx";
import { LimeStage } from "../components/Stage";
import { MaskUp } from "../components/Type";
import { C, CUES, FONT, scene } from "../lib/theme";
import { clamp, ease, prog } from "../lib/motion";

// S10 엔드 (1200–1320f) — 파스텔 연두 위 공식 컬러 로고 → "수업 시스템 OS" → 쇼룸 CTA. HUD가 SAVED로 바뀐다.
const { from } = scene("end");
const E = {
  logo: CUES.end.logo - from,
  tagline: CUES.end.tagline - from,
  cta: CUES.end.cta - from,
};

export const End: React.FC = () => {
  const frame = useCurrentFrame();
  const mark = prog(frame, E.logo, E.logo + 14, ease.outQuint);
  const rule = prog(frame, E.tagline + 10, E.tagline + 26, ease.outQuint);
  const cta = prog(frame, E.cta, E.cta + 12, ease.outBack);
  const glow = interpolate(frame, [0, 120], [0.6, 1], clamp);
  return (
    <LimeStage>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 55% 50% at 50% 42%, rgba(255,255,255,${0.35 * glow}) 0%, rgba(255,255,255,0) 70%)` }} />
      <Rings start={E.logo} y={430} count={2} color="rgba(74,107,18,0.45)" maxR={1000} width={6} dur={40} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 330, display: "flex", justifyContent: "center", alignItems: "center", gap: 44 }}>
        <div style={{ clipPath: `inset(0 ${(1 - mark) * 100}% 0 0)`, transform: `translateX(${(1 - mark) * -40}px)` }}>
          <Img src={staticFile("brand/classin-mark.png")} style={{ height: 150, display: "block" }} />
        </div>
        <MaskUp start={E.logo + 4} dur={14}>
          <Img src={staticFile("brand/classin-wordmark.png")} style={{ height: 172, display: "block" }} />
        </MaskUp>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 560, display: "flex", justifyContent: "center" }}>
        <MaskUp start={E.tagline} dur={12}>
          <div style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 54, letterSpacing: "0.02em", color: C.ink }}>수업 시스템 OS</div>
        </MaskUp>
      </div>
      <div style={{ position: "absolute", left: 760, width: 400, top: 668, height: 3, background: C.ink, opacity: 0.3, transform: `scaleX(${rule})` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 712, display: "flex", flexDirection: "column", alignItems: "center", gap: 26, opacity: Math.min(1, cta * 1.5) }}>
        <div
          style={{
            padding: "20px 40px",
            borderRadius: 999,
            background: C.ink,
            color: C.white,
            fontFamily: FONT.sans,
            fontWeight: 700,
            fontSize: 38,
            letterSpacing: "-0.01em",
            transform: `scale(${0.85 + 0.15 * cta})`,
            boxShadow: `0 18px 40px ${C.shadow}`,
          }}
        >
          목동 쇼룸에서 실제 수업 흐름 보기 <span style={{ color: C.signal }}>→</span>
        </div>
        <div style={{ fontFamily: FONT.mono, fontWeight: 600, fontSize: 34, letterSpacing: "0.12em", color: C.ink }}>classin.co.kr</div>
      </div>
      <Flash at={E.logo} dur={10} max={0.9} />
    </LimeStage>
  );
};
