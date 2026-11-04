import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { ChipDark, DarkStage, Reveal, td } from "../../components/Dark";
import { DrawLine, MaskText } from "../../components/Kinetic";
import { FONT_FAMILY } from "../../lib/fonts";
import { SMOOTH, sp } from "../../lib/motion";
import { D } from "../../lib/themeDark";

export const TMB_STEPS = [
  { n: "01", en: "Feedback Loop", ko: "피드백 루프" },
  { n: "02", en: "For Directors", ko: "원장" },
  { n: "03", en: "For Teachers", ko: "강사" },
] as const;

// 버전 B 공통 레이아웃 — 텍스트 컬럼(좌) + 비주얼 컬럼(우). 거대 아웃라인 번호 대신 가느다란 세로 눈금과 번호 라벨을 쓴다.
export const TmbLayout: React.FC<{
  step: 0 | 1 | 2;
  title: React.ReactNode;
  sub: React.ReactNode;
  bullets?: string[];
  children: React.ReactNode;
  textWidth?: number;
}> = ({ step, title, sub, bullets = [], children, textWidth = 640 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = TMB_STEPS[step];
  const tick = sp(frame - 2, fps, SMOOTH, 40);
  return (
    <DarkStage>
      <AbsoluteFill style={{ flexDirection: "row", padding: "0 100px 0 150px", gap: 40, alignItems: "stretch" }}>
        <div style={{ width: textWidth, flexShrink: 0, position: "relative", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ position: "absolute", left: -46, top: "18%", bottom: "18%", width: 1, background: `linear-gradient(180deg, transparent, ${D.limeDeep} 30%, ${D.limeDeep} 70%, transparent)`, transform: `scaleY(${tick})`, transformOrigin: "50% 0", opacity: 0.8 }} />
          <Reveal delay={4} distance={14}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ ...td(20, 800, "#0A1A14"), background: D.lime, borderRadius: 7, padding: "3px 10px", letterSpacing: "0.04em" }}>{s.n}</span>
              <span style={td(19, 700, D.lime, { letterSpacing: "0.22em", textTransform: "uppercase" })}>{s.en}</span>
            </div>
          </Reveal>
          <div style={{ marginTop: 26, fontFamily: FONT_FAMILY, fontSize: 80, fontWeight: 900, color: D.ink, letterSpacing: "-0.045em", lineHeight: 1.14, wordBreak: "keep-all" }}>
            <MaskText delay={7}>
              <span>{title}</span>
            </MaskText>
          </div>
          <div style={{ position: "relative", height: 2, marginTop: 28, width: 150 }}>
            <DrawLine delay={20} color={D.limeDeep} thickness={2} duration={16} />
          </div>
          <Reveal delay={26} distance={20} style={{ marginTop: 24 }}>
            <div style={{ fontFamily: FONT_FAMILY, fontSize: 27, fontWeight: 500, color: D.mute, letterSpacing: "-0.015em", lineHeight: 1.6, wordBreak: "keep-all" }}>{sub}</div>
          </Reveal>
          {bullets.length > 0 && (
            <div style={{ marginTop: 28, display: "flex", flexWrap: "wrap", gap: 10 }}>
              {bullets.map((b, i) => (
                <ChipDark key={b} delay={42 + i * 7} size={18}>
                  {b}
                </ChipDark>
              ))}
            </div>
          )}
        </div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-end" }}>{children}</div>
      </AbsoluteFill>
    </DarkStage>
  );
};
