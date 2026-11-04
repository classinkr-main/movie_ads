import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { IvoryStage } from "../../components/Backgrounds";
import { DrawLine, MaskText } from "../../components/Kinetic";
import { Chip, Eyebrow, Rise } from "../../components/Ui";
import { FONT_FAMILY } from "../../lib/fonts";
import { SMOOTH, sp } from "../../lib/motion";
import { C } from "../../lib/theme";

export const TM_STEPS = [
  { n: "01", short: "AI 강의 평가", en: "AI Lesson Evaluation" },
  { n: "02", short: "강사 관리", en: "Teacher Management" },
] as const;

// 강사 관리 편 공통 레이아웃 — Showreel의 FeatureLayout과 같은 골격이지만 등장 간격을 넓혀 호흡을 느리게 한다.
export const TmLayout: React.FC<{
  step: 0 | 1;
  title: React.ReactNode;
  sub: string;
  bullets?: string[];
  children: React.ReactNode;
  variant?: "ivory" | "ivory2" | "white";
}> = ({ step, title, sub, bullets = [], children, variant = "ivory" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = TM_STEPS[step];
  const wm = sp(frame, fps, SMOOTH, 48);
  return (
    <IvoryStage variant={variant}>
      <AbsoluteFill style={{ flexDirection: "row", padding: "0 100px 0 150px", gap: 36, alignItems: "stretch" }}>
        <div style={{ width: 640, flexShrink: 0, position: "relative", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div
            style={{
              position: "absolute",
              left: -36,
              top: -200,
              fontFamily: FONT_FAMILY,
              fontSize: 400,
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: "-0.06em",
              color: "transparent",
              WebkitTextStroke: `2.5px ${C.limeDeep}`,
              opacity: 0.32 * wm,
              transform: `translateX(${(1 - wm) * -70}px) scale(${0.92 + wm * 0.08})`,
              transformOrigin: "0 50%",
              pointerEvents: "none",
            }}
          >
            {s.n}
          </div>
          <Rise delay={4} distance={14}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <span style={{ fontFamily: FONT_FAMILY, fontSize: 24, fontWeight: 800, color: C.ink, background: C.lime, borderRadius: 8, padding: "4px 12px", letterSpacing: "0.04em" }}>{s.n}</span>
              <Eyebrow size={21} color={C.limeInk}>
                {s.en}
              </Eyebrow>
            </div>
          </Rise>
          <div style={{ marginTop: 24, fontFamily: FONT_FAMILY, fontSize: 76, fontWeight: 900, color: C.ink, letterSpacing: "-0.045em", lineHeight: 1.16, wordBreak: "keep-all" }}>
            <MaskText delay={10}>
              <span>{title}</span>
            </MaskText>
          </div>
          <div style={{ position: "relative", height: 3, marginTop: 28, width: 160 }}>
            <DrawLine delay={24} color={C.limeDeep} thickness={3} duration={16} />
          </div>
          <Rise delay={28} distance={22} style={{ marginTop: 24 }}>
            <div style={{ fontFamily: FONT_FAMILY, fontSize: 28, fontWeight: 500, color: C.gray, letterSpacing: "-0.015em", lineHeight: 1.55, wordBreak: "keep-all" }}>{sub}</div>
          </Rise>
          {bullets.length > 0 && (
            <div style={{ marginTop: 28, display: "flex", flexWrap: "wrap", gap: 10 }}>
              {bullets.map((b, i) => (
                <Chip key={b} delay={44 + i * 7} size={21}>
                  {b}
                </Chip>
              ))}
            </div>
          )}
        </div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-end" }}>{children}</div>
      </AbsoluteFill>
    </IvoryStage>
  );
};

export const tx = (size: number, weight: number, color: string, extra?: React.CSSProperties): React.CSSProperties => ({
  fontFamily: FONT_FAMILY,
  fontSize: size,
  fontWeight: weight,
  color,
  letterSpacing: "-0.01em",
  ...extra,
});
