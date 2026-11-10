import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { IvoryStage } from "../../../shared/brand/Backgrounds";
import { DrawLine, MaskText } from "../../../shared/brand/Kinetic";
import { Chip, Eyebrow, Rise } from "../../../shared/brand/Ui";
import { FONT_FAMILY } from "../../../shared/fonts";
import { SMOOTH, sp } from "../../../shared/motion";
import { C } from "../../../shared/brand/theme";

export const TMV_STEPS = [
  { n: "01", en: "Feedback Loop", ko: "피드백 루프" },
  { n: "02", en: "For Directors", ko: "원장님" },
  { n: "03", en: "For Teachers", ko: "강사" },
] as const;

// 가치 편 공통 레이아웃 — 텍스트 컬럼 + 비주얼 컬럼. 타이틀은 두 줄(lines)로만 받고 각 줄은 줄바꿈하지 않는다.
export const TmvLayout: React.FC<{
  step: 0 | 1 | 2;
  lines: [React.ReactNode, React.ReactNode];
  sub: React.ReactNode;
  bullets?: string[];
  children: React.ReactNode;
  side?: "right" | "left"; // 비주얼 위치
  variant?: "ivory" | "ivory2" | "white";
  titleSize?: number;
}> = ({ step, lines, sub, bullets = [], children, side = "right", variant = "ivory", titleSize = 72 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = TMV_STEPS[step];
  const wm = sp(frame, fps, SMOOTH, 48);
  const textCol = (
    <div style={{ width: 700, flexShrink: 0, position: "relative", display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <div
        style={{
          position: "absolute",
          left: -36,
          top: -135, // 번호가 2/3쯤 보이도록(절반에서 조금 내림)
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
      <Rise delay={3} distance={14}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontFamily: FONT_FAMILY, fontSize: 24, fontWeight: 800, color: C.ink, background: C.lime, borderRadius: 8, padding: "4px 12px", letterSpacing: "0.04em" }}>{s.n}</span>
          <Eyebrow size={21} color={C.limeInk}>
            {s.en}
          </Eyebrow>
        </div>
      </Rise>
      <div style={{ marginTop: 24, fontFamily: FONT_FAMILY, fontSize: titleSize, fontWeight: 900, color: C.ink, letterSpacing: "-0.045em", lineHeight: 1.16, whiteSpace: "nowrap" }}>
        <MaskText delay={7}>
          <span style={{ display: "block" }}>{lines[0]}</span>
        </MaskText>
        <br />
        <MaskText delay={11}>
          <span style={{ display: "block" }}>{lines[1]}</span>
        </MaskText>
      </div>
      <div style={{ position: "relative", height: 3, marginTop: 26, width: 160 }}>
        <DrawLine delay={20} color={C.limeDeep} thickness={3} duration={16} />
      </div>
      <Rise delay={26} distance={22} style={{ marginTop: 22 }}>
        <div style={{ fontFamily: FONT_FAMILY, fontSize: 27, fontWeight: 500, color: C.gray, letterSpacing: "-0.015em", lineHeight: 1.55, wordBreak: "keep-all" }}>{sub}</div>
      </Rise>
      {bullets.length > 0 && (
        <div style={{ marginTop: 26, display: "flex", flexWrap: "wrap", gap: 10 }}>
          {bullets.map((b, i) => (
            <Chip key={b} delay={42 + i * 7} size={20}>
              {b}
            </Chip>
          ))}
        </div>
      )}
    </div>
  );
  const visCol = <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: side === "right" ? "flex-end" : "flex-start" }}>{children}</div>;
  return (
    <IvoryStage variant={variant}>
      <AbsoluteFill style={{ flexDirection: "row", padding: side === "right" ? "0 100px 0 150px" : "0 150px 0 100px", gap: 36, alignItems: "stretch" }}>
        {side === "right" ? (
          <>
            {textCol}
            {visCol}
          </>
        ) : (
          <>
            {visCol}
            {textCol}
          </>
        )}
      </AbsoluteFill>
    </IvoryStage>
  );
};
