import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { IvoryStage } from "../../../shared/brand/Backgrounds";
import { FEATURES } from "../components/Feature";
import { Burst, Chars, Highlighter } from "../../../shared/brand/Flourish";
import { Eyebrow, LogoMark, Pop, Rise } from "../../../shared/brand/Ui";
import { FONT_FAMILY } from "../../../shared/fonts";
import { clamp, SMOOTH, sp } from "../../../shared/motion";
import { C } from "../theme";

// S1 — 오프닝: "Classin AI로, 수업을 업그레이드." + 5개 기능 목차
export const Opening: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const bgAI = sp(frame, fps, SMOOTH, 70);
  const drop = sp(frame, fps, { damping: 11, stiffness: 150, mass: 1 });

  return (
    <IvoryStage variant="white">
      {/* 배경 거대 "AI" 아웃라인 */}
      <div
        style={{
          position: "absolute",
          right: -40,
          top: -140,
          fontFamily: FONT_FAMILY,
          fontSize: 980,
          fontWeight: 900,
          lineHeight: 1,
          letterSpacing: "-0.08em",
          color: "transparent",
          WebkitTextStroke: `2.5px ${C.limeDeep}`,
          opacity: 0.22 * bgAI,
          transform: `translateX(${(1 - bgAI) * 160}px) scale(${0.92 + bgAI * 0.08})`,
          transformOrigin: "100% 0",
        }}
      >
        AI
      </div>

      <div style={{ position: "absolute", left: 150, top: 150 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 22, position: "relative" }}>
          <Burst delay={10} size={300} color={C.limeDeep} lines={14} style={{ left: 36, top: 36, transform: "translate(-50%,-50%)" }} />
          <div style={{ transform: `translateY(${interpolate(drop, [0, 1], [-300, 0])}px)` }}>
            <LogoMark height={72} />
          </div>
          <Rise delay={10} distance={14}>
            <Eyebrow size={28} color={C.forest}>
              Classin AI
            </Eyebrow>
          </Rise>
        </div>

        <div style={{ marginTop: 56, fontFamily: FONT_FAMILY, fontSize: 164, fontWeight: 900, color: C.ink, letterSpacing: "-0.05em", lineHeight: 1.04 }}>
          <Chars text="Classin AI로," delay={14} stagger={2} rotate={8} />
          <br />
          <span style={{ display: "inline-flex", alignItems: "baseline", gap: 40 }}>
            <Chars text="수업을" delay={32} stagger={2} rotate={8} />
            <Highlighter delay={58} duration={16} inset={12}>
              <Chars text="업그레이드." delay={42} stagger={2} rotate={8} style={{ color: C.forest }} />
            </Highlighter>
          </span>
        </div>

        <Rise delay={64} distance={22} style={{ marginTop: 34 }}>
          <div style={{ fontFamily: FONT_FAMILY, fontSize: 40, fontWeight: 500, color: C.gray, letterSpacing: "-0.015em" }}>
            평가부터 번역, 숙제, 에이전트까지 — <span style={{ color: C.ink, fontWeight: 700 }}>수업의 모든 순간에 AI가 붙습니다.</span>
          </div>
        </Rise>
      </div>

      {/* 목차 스트립 */}
      <div style={{ position: "absolute", left: 150, right: 150, bottom: 84, display: "flex", gap: 0, borderTop: `1.5px solid ${C.hairline}`, paddingTop: 26 }}>
        {FEATURES.map((f, i) => {
          const d = 70 + i * 5;
          const s = sp(frame - d, fps, SMOOTH, 18);
          const o = interpolate(frame - d, [0, 6], [0, 1], clamp);
          return (
            <div key={f.n} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10, opacity: o, transform: `translateY(${(1 - s) * 30}px)`, borderLeft: i === 0 ? "none" : `1.5px solid ${C.hairline}`, paddingLeft: i === 0 ? 0 : 26 }}>
              <span style={{ fontFamily: FONT_FAMILY, fontSize: 18, fontWeight: 800, color: C.limeInk, letterSpacing: "0.08em" }}>{f.n}</span>
              <span style={{ fontFamily: FONT_FAMILY, fontSize: 24, fontWeight: 700, color: C.ink, letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>{f.short}</span>
              <span style={{ fontFamily: FONT_FAMILY, fontSize: 15, fontWeight: 600, color: C.gray300, letterSpacing: "0.1em", textTransform: "uppercase" }}>{f.en}</span>
            </div>
          );
        })}
      </div>
    </IvoryStage>
  );
};
