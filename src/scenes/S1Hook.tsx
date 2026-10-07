import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { DarkStage } from "../components/Backgrounds";
import { WordPop } from "../components/Kinetic";
import { Eyebrow, Pop, Rise } from "../components/Ui";
import { FONT_FAMILY } from "../lib/fonts";
import { useLayout } from "../lib/layout";
import { clamp, SMOOTH, sp } from "../lib/motion";
import { C } from "../lib/theme";

const pad2 = (n: number) => String(n).padStart(2, "0");

// S1 — 훅: "오늘도 수업 12개가 끝났습니다."
export const S1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u, isPortrait } = useLayout();
  const size = (isPortrait ? 108 : 150) * u;

  const count = Math.round(interpolate(sp(frame - 12, fps, SMOOTH, 34), [0, 1], [1, 12]));
  const totalSec = Math.round(interpolate(frame, [0, 72], [0, 12 * 3600], clamp));
  const tc = `${pad2(Math.floor(totalSec / 3600))}:${pad2(Math.floor((totalSec % 3600) / 60))}:${pad2(totalSec % 60)}`;
  const blink = frame % 20 < 12;

  return (
    <DarkStage>
      {/* REC 인디케이터 */}
      <div style={{ position: "absolute", top: 72 * u, left: 96 * u, display: "flex", alignItems: "center", gap: 18 * u }}>
        <Pop delay={0}>
          <div
            style={{
              width: 18 * u,
              height: 18 * u,
              borderRadius: 999,
              background: C.mint,
              opacity: blink ? 1 : 0.3,
              boxShadow: blink ? `0 0 ${26 * u}px ${C.mint}` : "none",
            }}
          />
        </Pop>
        <Rise delay={2} distance={20}>
          <Eyebrow size={24 * u}>LIVE · 수업 녹화 중</Eyebrow>
        </Rise>
      </div>

      {/* 타임코드 */}
      <div style={{ position: "absolute", top: 68 * u, right: 96 * u, textAlign: "right" }}>
        <Rise delay={4} distance={20}>
          <div
            style={{
              fontFamily: FONT_FAMILY,
              fontSize: 34 * u,
              fontWeight: 600,
              color: C.mint,
              opacity: 0.85,
              fontVariantNumeric: "tabular-nums",
              letterSpacing: "0.04em",
            }}
          >
            {tc}
          </div>
          <div style={{ fontFamily: FONT_FAMILY, fontSize: 20 * u, fontWeight: 500, color: C.surface100, opacity: 0.6, letterSpacing: "0.1em" }}>
            오늘 누적 녹화
          </div>
        </Rise>
      </div>

      {/* 중앙 카피 */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: 96 * u }}>
        <div
          style={{
            fontFamily: FONT_FAMILY,
            fontSize: size,
            fontWeight: 900,
            color: C.page,
            letterSpacing: "-0.035em",
            lineHeight: 1.1,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
            gap: `${0.08 * size}px ${0.22 * size}px`,
            textAlign: "center",
            maxWidth: 1700 * u,
          }}
        >
          <WordPop delay={2}>오늘도</WordPop>
          <WordPop delay={7}>수업</WordPop>
          <WordPop delay={12} fromScale={2.4} rotate={-7}>
            <span
              style={{
                display: "inline-block",
                background: C.brand,
                color: C.page,
                padding: `0 ${0.16 * size}px`,
                borderRadius: 0.16 * size,
                lineHeight: 1.18,
                fontVariantNumeric: "tabular-nums",
                boxShadow: `0 ${18 * u}px ${60 * u}px rgba(0,0,0,0.35)`,
                minWidth: 2.9 * size,
                textAlign: "center",
              }}
            >
              {count}개가
            </span>
          </WordPop>
          <WordPop delay={22}>끝났습니다.</WordPop>
        </div>
      </AbsoluteFill>

      {/* 하단 12개 틱 — 카운터와 함께 켜진다 */}
      <div
        style={{
          position: "absolute",
          bottom: 96 * u,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 10 * u,
          width: (isPortrait ? 900 : 1200) * u,
        }}
      >
        {Array.from({ length: 12 }).map((_, i) => {
          const on = i < count;
          return (
            <div
              key={i}
              style={{
                flex: 1,
                height: 10 * u,
                borderRadius: 999,
                background: on ? C.mint : "rgba(255,255,255,0.14)",
                boxShadow: on ? `0 0 ${18 * u}px rgba(110,231,183,0.6)` : "none",
                transform: `scaleY(${on ? 1 : 0.6})`,
              }}
            />
          );
        })}
      </div>
    </DarkStage>
  );
};
