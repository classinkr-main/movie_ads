import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { DarkStage } from "../components/Backgrounds";
import { MaskText } from "../components/Kinetic";
import { Chip, Eyebrow, LogoMark, Pop, Rise } from "../components/Ui";
import { FONT_FAMILY } from "../lib/fonts";
import { useLayout } from "../lib/layout";
import { clamp, SMOOTH, sp } from "../lib/motion";
import { C } from "../lib/theme";

const TITLE = "AI 강의 분석";
const TAGS: Array<{ label: string; at: number }> = [
  { label: "발화", at: 38 },
  { label: "상호작용", at: 50 },
  { label: "수업 분위기", at: 62 },
  { label: "언어 표현", at: 74 },
];
const SCAN_START = 30;
const SCAN_END = 84;

// S3 — 리빌: ClassIn AI 강의 분석 + 음성 파형 스캔
export const S3Reveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u, isPortrait, width } = useLayout();
  const titleSize = (isPortrait ? 150 : 210) * u;

  const waveW = Math.min(width - 160 * u, 1560 * u);
  const waveH = (isPortrait ? 240 : 200) * u;
  const bars = isPortrait ? 44 : 72;
  const barGap = 6 * u;
  const barW = (waveW - barGap * (bars - 1)) / bars;
  const scanT = interpolate(frame, [SCAN_START, SCAN_END], [0, 1], clamp);
  const scanX = scanT * waveW;
  const scanOpacity = interpolate(frame, [SCAN_START - 2, SCAN_START + 4, SCAN_END - 4, SCAN_END + 4], [0, 1, 1, 0], clamp);

  return (
    <DarkStage>
      {/* 상단 텍스트 블록 */}
      <AbsoluteFill style={{ alignItems: "center", paddingTop: (isPortrait ? 200 : 88) * u }}>
        <Pop delay={0} from={0.2}>
          <LogoMark height={(isPortrait ? 90 : 96) * u} />
        </Pop>
        <Rise delay={10} distance={24} style={{ marginTop: 38 * u }}>
          <Eyebrow size={26 * u}>ClassIn AI · Lesson Analysis</Eyebrow>
        </Rise>
        <div
          style={{
            marginTop: 18 * u,
            fontFamily: FONT_FAMILY,
            fontSize: titleSize,
            fontWeight: 900,
            color: C.page,
            letterSpacing: "-0.045em",
            lineHeight: 1.12,
            display: "flex",
            whiteSpace: "pre",
          }}
        >
          {Array.from(TITLE).map((ch, i) =>
            ch === " " ? (
              <span key={i} style={{ display: "inline-block", width: 0.26 * titleSize }} />
            ) : (
              <MaskText key={i} delay={14 + i * 3}>
                <span>{ch}</span>
              </MaskText>
            ),
          )}
        </div>
        <Rise delay={36} distance={30} style={{ marginTop: 14 * u }}>
          <div style={{ fontFamily: FONT_FAMILY, fontSize: (isPortrait ? 38 : 46) * u, fontWeight: 500, color: C.surface100, letterSpacing: "-0.01em", textAlign: "center", padding: `0 ${80 * u}px` }}>
            수업 녹화본에서 강의 품질을 자동으로 진단합니다
          </div>
        </Rise>
      </AbsoluteFill>

      {/* 파형 + 스캐너 + 태그 */}
      <div style={{ position: "absolute", bottom: (isPortrait ? 200 : 76) * u, left: "50%", transform: "translateX(-50%)", width: waveW, height: waveH + 120 * u }}>
        {/* 태그 — 스캐너가 지나간 자리에 남는다 */}
        {TAGS.map((t) => {
          const x = ((t.at - SCAN_START) / (SCAN_END - SCAN_START)) * waveW;
          return (
            <div key={t.label} style={{ position: "absolute", left: Math.min(Math.max(x, 90 * u), waveW - 90 * u), top: 0, transform: "translateX(-50%)" }}>
              <Chip delay={t.at} size={isPortrait ? 22 * u : 26 * u} bg={C.page} color={C.forest} style={{ boxShadow: `0 ${8 * u}px ${30 * u}px rgba(0,0,0,0.3)` }}>
                {t.label}
              </Chip>
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "100%",
                  width: 2 * u,
                  height: interpolate(sp(frame - t.at, fps, SMOOTH, 12), [0, 1], [0, 40 * u]),
                  background: C.page,
                  opacity: 0.6,
                }}
              />
            </div>
          );
        })}
        {/* 파형 */}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: waveH, display: "flex", alignItems: "center", gap: barGap }}>
          {Array.from({ length: bars }).map((_, i) => {
            const amp = 0.28 + 0.72 * random(`wf${i}`);
            const wobble = 0.55 + 0.45 * Math.sin(frame * 0.33 + i * 0.57) * Math.cos(frame * 0.11 + i * 0.21);
            const env = sp(frame - 18 - i * 0.45, fps, SMOOTH, 20);
            const h = Math.max(env > 0.02 ? 6 * u : 0, waveH * amp * wobble * env);
            const barX = i * (barW + barGap) + barW / 2;
            const passed = scanT > 0 && barX <= scanX;
            return (
              <div
                key={i}
                style={{
                  width: barW,
                  height: h,
                  borderRadius: barW,
                  background: passed ? C.mint : "rgba(255,255,255,0.34)",
                  boxShadow: passed ? `0 0 ${14 * u}px rgba(110,231,183,0.45)` : "none",
                }}
              />
            );
          })}
        </div>
        {/* 스캐너 */}
        <div
          style={{
            position: "absolute",
            left: scanX,
            bottom: -20 * u,
            width: 3 * u,
            height: waveH + 60 * u,
            background: C.page,
            boxShadow: `0 0 ${30 * u}px ${C.mint}, 0 0 ${80 * u}px rgba(110,231,183,0.6)`,
            opacity: scanOpacity,
            transform: "translateX(-50%)",
          }}
        />
      </div>
    </DarkStage>
  );
};
