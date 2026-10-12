import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { IvoryStage } from "../components/Backgrounds";
import { Burst, Chars, Dots, GhostWord, Highlighter } from "../components/Flourish";
import { Eyebrow, LogoMark, Rise, Sticker } from "../components/Ui";
import { FONT_FAMILY } from "../lib/fonts";
import { clamp, sp } from "../lib/motion";
import { C } from "../lib/theme";

// S3 — 리빌: ClassIn AI 강의 분석
export const Reveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const drop = sp(frame, fps, { damping: 11, stiffness: 150, mass: 1 });
  const logoY = interpolate(drop, [0, 1], [-420, 0]);
  const squash = 1 + Math.max(0, Math.sin(Math.min(frame, 30) / 30 * Math.PI)) * 0.06 * (frame < 30 ? 1 : 0);
  const glow = 0.5 + 0.5 * Math.sin(frame / 12);

  return (
    <IvoryStage variant="white">
      <GhostWord text="LESSON ANALYSIS" size={260} top="74%" opacity={0.1} speed={1.6} />
      <Dots count={20} opacity={0.5} speed={0.9} seed="r" />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 40% 50% at 50% 42%, rgba(200,240,90,${0.25 + glow * 0.2}) 0%, rgba(200,240,90,0) 70%)` }} />

      <AbsoluteFill style={{ alignItems: "center", paddingTop: 120 }}>
        <div style={{ position: "relative", height: 130, display: "grid", placeItems: "center" }}>
          <Burst delay={9} size={520} color={C.limeDeep} lines={18} style={{ left: "50%", top: "50%", transform: "translate(-50%,-50%)" }} />
          <div style={{ transform: `translateY(${logoY}px) scaleX(${squash}) scaleY(${2 - squash})`, transformOrigin: "50% 100%" }}>
            <LogoMark height={120} />
          </div>
        </div>

        <Rise delay={12} distance={20} style={{ marginTop: 36 }}>
          <Eyebrow size={26}>ClassIn AI · Lesson Analysis</Eyebrow>
        </Rise>

        <div style={{ position: "relative", marginTop: 12, fontFamily: FONT_FAMILY, fontSize: 224, fontWeight: 900, color: C.ink, letterSpacing: "-0.05em", lineHeight: 1.15, display: "flex", alignItems: "baseline", gap: 44 }}>
          <Chars text="AI" delay={16} stagger={3} rotate={14} />
          <Highlighter delay={40} duration={16} inset={12}>
            <Chars text="강의 분석" delay={22} stagger={3} rotate={14} />
          </Highlighter>
          <div style={{ position: "absolute", right: -190, top: -46 }}>
            <Sticker delay={66} rotate={10} size={28}>
              NEW · 2026.04
            </Sticker>
          </div>
        </div>

        <Rise delay={48} distance={30} style={{ marginTop: 10 }}>
          <div style={{ fontFamily: FONT_FAMILY, fontSize: 50, fontWeight: 600, color: C.gray, letterSpacing: "-0.02em" }}>
            녹화만 하면, <span style={{ color: C.forest, fontWeight: 800 }}>AI가 수업을 읽습니다.</span>
          </div>
        </Rise>
      </AbsoluteFill>
    </IvoryStage>
  );
};
