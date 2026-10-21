import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { IvoryStage } from "../../../shared/brand/Backgrounds";
import { DrawLine, MaskText } from "../../../shared/brand/Kinetic";
import { Chip, Eyebrow, Rise } from "../../../shared/brand/Ui";
import { FONT_FAMILY } from "../../../shared/fonts";
import { SMOOTH, sp } from "../../../shared/motion";
import { C } from "../../../shared/brand/theme";

export const FEATURES = [
  { n: "01", short: "AI 강의 평가", en: "Lesson Evaluation" },
  { n: "02", short: "AI 스크립트 · 강의 요약", en: "Transcript & Summary" },
  { n: "03", short: "AI 숙제 출제 · 채점", en: "Homework & Grading" },
  { n: "04", short: "AI 자동 번역 · 실시간 자막", en: "Live Translation" },
  { n: "05", short: "AI 에이전트", en: "AI Agent" },
] as const;

// 기능 씬 공통 레이아웃 — 텍스트 컬럼 + 카드 컬럼, 거대 아웃라인 인덱스 워터마크
export const FeatureLayout: React.FC<{
  index: number; // 0-based
  title: React.ReactNode; // 줄바꿈은 <br/>
  sub: string;
  bullets?: string[];
  side?: "right" | "left"; // 카드 위치
  children: React.ReactNode; // 카드
  variant?: "ivory" | "ivory2" | "white";
}> = ({ index, title, sub, bullets = [], side = "right", children, variant = "ivory" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = FEATURES[index];
  const wm = sp(frame, fps, SMOOTH, 40);
  const textCol = (
    <div style={{ width: 660, flexShrink: 0, position: "relative", display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <div
        style={{
          position: "absolute",
          left: -40,
          top: -210,
          fontFamily: FONT_FAMILY,
          fontSize: 420,
          fontWeight: 900,
          lineHeight: 1,
          letterSpacing: "-0.06em",
          color: "transparent",
          WebkitTextStroke: `2.5px ${C.limeDeep}`,
          opacity: 0.35 * wm,
          transform: `translateX(${(1 - wm) * -80}px) scale(${0.9 + wm * 0.1})`,
          transformOrigin: "0 50%",
          pointerEvents: "none",
        }}
      >
        {f.n}
      </div>
      <Rise delay={2} distance={14}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontFamily: FONT_FAMILY, fontSize: 24, fontWeight: 800, color: C.ink, background: C.lime, borderRadius: 8, padding: "4px 12px", letterSpacing: "0.04em" }}>{f.n}</span>
          <Eyebrow size={22} color={C.limeInk}>
            {f.en}
          </Eyebrow>
        </div>
      </Rise>
      <div style={{ marginTop: 22, fontFamily: FONT_FAMILY, fontSize: 78, fontWeight: 900, color: C.ink, letterSpacing: "-0.045em", lineHeight: 1.14, wordBreak: "keep-all" }}>
        <MaskText delay={6}>
          <span>{title}</span>
        </MaskText>
      </div>
      <div style={{ position: "relative", height: 3, marginTop: 26, width: 160 }}>
        <DrawLine delay={16} color={C.limeDeep} thickness={3} duration={14} />
      </div>
      <Rise delay={18} distance={24} style={{ marginTop: 22 }}>
        <div style={{ fontFamily: FONT_FAMILY, fontSize: 29, fontWeight: 500, color: C.gray, letterSpacing: "-0.015em", lineHeight: 1.5, wordBreak: "keep-all" }}>{sub}</div>
      </Rise>
      {bullets.length > 0 && (
        <div style={{ marginTop: 26, display: "flex", flexWrap: "wrap", gap: 10 }}>
          {bullets.map((b, i) => (
            <Chip key={b} delay={28 + i * 5} size={22}>
              {b}
            </Chip>
          ))}
        </div>
      )}
    </div>
  );
  const cardCol = <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: side === "right" ? "flex-end" : "flex-start" }}>{children}</div>;
  return (
    <IvoryStage variant={variant}>
      <AbsoluteFill style={{ flexDirection: "row", padding: "0 100px 0 170px", gap: 40, alignItems: "stretch" }}>
        {side === "right" ? (
          <>
            {textCol}
            {cardCol}
          </>
        ) : (
          <>
            {cardCol}
            {textCol}
          </>
        )}
      </AbsoluteFill>
    </IvoryStage>
  );
};

// 챕터 레일 — 기능 씬 동안 좌측에 고정되는 01–05 인덱스
export const ChapterRail: React.FC<{ active: number; visible: number }> = ({ active, visible }) => {
  return (
    <div style={{ position: "absolute", left: 56, top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 18, opacity: visible }}>
      {FEATURES.map((f, i) => {
        const on = i === active;
        const past = i < active;
        return (
          <div key={f.n} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
            <div style={{ position: "relative", width: 44, height: 44, display: "grid", placeItems: "center" }}>
              <div style={{ position: "absolute", inset: 0, borderRadius: 999, background: on ? C.lime : "transparent", border: on ? "none" : `1.5px solid ${past ? C.limeDeep : C.hairline}`, transform: `scale(${on ? 1 : 0.7})` }} />
              <span style={{ position: "relative", fontFamily: FONT_FAMILY, fontSize: 16, fontWeight: 800, color: on ? C.ink : past ? C.limeInk : C.gray300, letterSpacing: "0.02em" }}>{f.n}</span>
            </div>
            {i < FEATURES.length - 1 && <div style={{ width: 2, height: 26, background: past || on ? C.limeDeep : C.hairline, opacity: past || on ? 0.8 : 1 }} />}
          </div>
        );
      })}
    </div>
  );
};

export { CardHeader, Stamp, UiCard } from "../../../shared/brand/Card";
export type { StampKind } from "../../../shared/brand/Card";
