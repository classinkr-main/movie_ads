import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { LightStage } from "../components/Backgrounds";
import { WordPop } from "../components/Kinetic";
import { Rise } from "../components/Ui";
import { FONT_FAMILY } from "../lib/fonts";
import { useLayout } from "../lib/layout";
import { clamp, SOFT, sp } from "../lib/motion";
import { C } from "../lib/theme";

// S2 — 질문: "그 수업, 다 들어볼 수 있을까요?" + 뒤로 쌓이는 녹화본 카드 12장
export const S2Question: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u, isPortrait, width, height } = useLayout();
  const size = (isPortrait ? 104 : 150) * u;

  const cards = Array.from({ length: 12 }).map((_, i) => {
    const s = sp(frame - i * 2, fps, SOFT);
    const spread = (isPortrait ? 380 : 760) * u;
    const x = -spread + (spread * 2 * i) / 11 + (random(`cx${i}`) - 0.5) * 80 * u;
    const yTarget = (random(`cy${i}`) - 0.5) * (isPortrait ? 900 : 520) * u;
    const rot = (random(`cr${i}`) - 0.5) * 22;
    const y = interpolate(s, [0, 1], [height * 0.7, yTarget]);
    return { x, y, rot, s, key: i };
  });

  // "다" 흔들기 — 질문의 무게를 싣는다
  const shake = frame > 42 ? Math.sin((frame - 42) * 2.1) * 10 * u * Math.exp(-(frame - 42) / 7) : 0;

  return (
    <LightStage>
      {/* 녹화본 카드 더미 */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        {cards.map((c) => (
          <div
            key={c.key}
            style={{
              position: "absolute",
              width: 260 * u,
              height: 160 * u,
              borderRadius: 20 * u,
              background: C.white,
              border: `1.5px solid ${C.hairline}`,
              boxShadow: `0 ${20 * u}px ${50 * u}px rgba(17,17,16,0.08)`,
              transform: `translate(${c.x}px, ${c.y}px) rotate(${c.rot}deg)`,
              opacity: 0.9 * c.s,
              padding: 18 * u,
              display: "flex",
              flexDirection: "column",
              gap: 12 * u,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 * u }}>
              <div style={{ width: 10 * u, height: 10 * u, borderRadius: 999, background: C.brand }} />
              <div style={{ height: 8 * u, width: 90 * u, borderRadius: 999, background: C.surface100 }} />
            </div>
            <div style={{ height: 8 * u, width: "85%", borderRadius: 999, background: C.warmWhite }} />
            <div style={{ height: 8 * u, width: "65%", borderRadius: 999, background: C.warmWhite }} />
            <div style={{ height: 8 * u, width: "75%", borderRadius: 999, background: C.warmWhite }} />
          </div>
        ))}
        {/* 텍스트 가독용 베일 */}
        <AbsoluteFill style={{ background: `radial-gradient(ellipse 60% 55% at 50% 50%, rgba(250,250,248,0.92) 0%, rgba(250,250,248,0.5) 60%, rgba(250,250,248,0) 100%)` }} />
      </AbsoluteFill>

      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: 96 * u }}>
        <div
          style={{
            fontFamily: FONT_FAMILY,
            fontSize: size,
            fontWeight: 900,
            color: C.ink,
            letterSpacing: "-0.035em",
            lineHeight: 1.1,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "baseline",
            gap: `${0.06 * size}px ${0.24 * size}px`,
            textAlign: "center",
            maxWidth: Math.min(width - 160 * u, 1700 * u),
          }}
        >
          <WordPop delay={4}>그 수업,</WordPop>
          <WordPop delay={10} fromScale={3} rotate={8}>
            <span style={{ display: "inline-block", color: C.brand, fontSize: size * 1.25, transform: `translateX(${shake}px)` }}>다</span>
          </WordPop>
          <WordPop delay={15}>들어볼 수</WordPop>
          <WordPop delay={20}>있을까요?</WordPop>
        </div>
        <Rise delay={32} distance={30} style={{ marginTop: 40 * u }}>
          <div style={{ fontFamily: FONT_FAMILY, fontSize: 42 * u, fontWeight: 500, color: C.warmGray, letterSpacing: "-0.01em" }}>
            강사 열 명, 매일 열두 개의 수업.
          </div>
        </Rise>
      </AbsoluteFill>
    </LightStage>
  );
};
