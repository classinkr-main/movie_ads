import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { DarkStage } from "../components/Backgrounds";
import { MaskText } from "../components/Kinetic";
import { Chip, Eyebrow, Pop, Rise } from "../components/Ui";
import { FONT_FAMILY } from "../lib/fonts";
import { useLayout } from "../lib/layout";
import { clamp, SNAP, sp } from "../lib/motion";
import { C } from "../lib/theme";

const IconMic: React.FC<{ size: number; frame: number }> = ({ size, frame }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" stroke={C.mint} strokeWidth="2.5" strokeLinecap="round">
    <rect x="18" y="6" width="12" height="22" rx="6" />
    <path d="M11 22a13 13 0 0 0 26 0" />
    <path d="M24 35v7M17 42h14" />
    {[0, 1, 2].map((i) => {
      const a = 0.2 + 0.8 * Math.abs(Math.sin(frame / 5 + i));
      return <path key={i} d={`M${36 + i * 4} ${18 - i * 2} q ${3} ${6 + i * 2} 0 ${12 + i * 4}`} opacity={a} />;
    })}
  </svg>
);

const IconDictation: React.FC<{ size: number; frame: number }> = ({ size, frame }) => {
  const w = interpolate(frame % 40, [0, 24], [0, 20], clamp);
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" stroke={C.mint} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="7" y="8" width="26" height="34" rx="3" />
      <path d={`M13 18h${Math.min(w, 14)}M13 25h${Math.min(w, 12)}M13 32h${Math.min(w, 8)}`} />
      <rect x="27" y="26" width="16" height="12" rx="2.5" fill={C.forest} />
      <circle cx="35" cy="32" r="3.2" />
      <path d="M31 26l1.5-2.5h5l1.5 2.5" />
    </svg>
  );
};

const IconRecite: React.FC<{ size: number; frame: number }> = ({ size, frame }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" stroke={C.mint} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <g style={{ transformOrigin: "24px 24px", transform: `rotate(${frame * 2}deg)` }}>
      <path d="M38 24a14 14 0 1 1-4.1-9.9" />
      <path d="M34 8v7h-7" />
    </g>
    <path d="M18 27v-5a3 3 0 0 1 3-3h0M28 27v-5a3 3 0 0 1 3-3h0" />
  </svg>
);

const CARDS = [
  { en: "Speaking", ko: "따라읽기", desc: "소리 내어 읽으면 AI가 발음을 분석해 즉시 점수와 피드백", score: 98, Icon: IconMic },
  { en: "Dictation", ko: "받아쓰기", desc: "듣고 공책에 적어 사진으로 제출하면 정확도를 자동 분석", score: 95, Icon: IconDictation },
  { en: "Recitation", ko: "외워말하기", desc: "본문을 외워 말하면 정확도를 평가하고 리포트로 기록", score: 97, Icon: IconRecite },
];

// S6 — AI 학습 활동 3종 (ClassIn 6.0.6)
export const S6Activities: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u, isPortrait } = useLayout();

  const cardW = (isPortrait ? 320 : 500) * u;
  const cardH = (isPortrait ? 560 : 520) * u;
  const k = isPortrait ? 0.78 : 1; // 글자 축척

  return (
    <DarkStage>
      <AbsoluteFill style={{ alignItems: "center", paddingTop: (isPortrait ? 190 : 80) * u }}>
        <Rise delay={0} distance={20}>
          <Eyebrow size={24 * u}>ClassIn 6.0.6 · AI 학습 활동</Eyebrow>
        </Rise>
        <div style={{ marginTop: 14 * u, fontFamily: FONT_FAMILY, fontSize: (isPortrait ? 80 : 100) * u, fontWeight: 900, color: C.page, letterSpacing: "-0.045em", lineHeight: 1.2 }}>
          <MaskText delay={2}>
            <span>AI가 바로 채점합니다</span>
          </MaskText>
        </div>
        <div style={{ marginTop: 16 * u, display: "flex", gap: 12 * u }}>
          {["정확도", "유창성", "완성도"].map((t, i) => (
            <Chip key={t} delay={34 + i * 4} size={24 * u} bg={C.page} color={C.forest}>
              {t}
            </Chip>
          ))}
        </div>
      </AbsoluteFill>

      {/* 카드 3장 — 3D 회전 진입 */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingTop: (isPortrait ? 120 : 150) * u, perspective: 1800 * u }}>
        <div style={{ display: "flex", gap: (isPortrait ? 24 : 60) * u }}>
          {CARDS.map((c, i) => {
            const start = 10 + i * 8;
            const s = sp(frame - start, fps, SNAP);
            const rotY = interpolate(s, [0, 1], [58, 0]);
            const tx = interpolate(s, [0, 1], [240 * u, 0]);
            const opacity = interpolate(frame - start, [0, 5], [0, 1], clamp);
            const scoreAt = 44 + i * 6;
            const burst = interpolate(frame - scoreAt, [0, 18], [0, 1], clamp);
            return (
              <div
                key={c.ko}
                style={{
                  width: cardW,
                  height: cardH,
                  borderRadius: 36 * u,
                  background: "rgba(255,255,255,0.07)",
                  border: "1.5px solid rgba(255,255,255,0.16)",
                  boxShadow: `0 ${40 * u}px ${90 * u}px rgba(0,0,0,0.35)`,
                  transform: `translateX(${tx}px) rotateY(${rotY}deg)`,
                  transformOrigin: "50% 50%",
                  opacity,
                  padding: 40 * u * k,
                  display: "flex",
                  flexDirection: "column",
                  gap: 14 * u,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <c.Icon size={92 * u * k} frame={frame} />
                <div style={{ fontFamily: FONT_FAMILY, fontSize: 22 * u * k, fontWeight: 700, color: C.mint, letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.8, marginTop: 8 * u }}>{c.en}</div>
                <div style={{ fontFamily: FONT_FAMILY, fontSize: 56 * u * k, fontWeight: 800, color: C.page, letterSpacing: "-0.04em", lineHeight: 1.1 }}>{c.ko}</div>
                <div style={{ fontFamily: FONT_FAMILY, fontSize: 26 * u * k, fontWeight: 500, color: C.surface100, opacity: 0.8, lineHeight: 1.45, letterSpacing: "-0.01em" }}>{c.desc}</div>
                {/* 점수 팝 */}
                <div style={{ position: "absolute", right: 36 * u * k, bottom: 30 * u * k, display: "flex", alignItems: "baseline", gap: 6 * u }}>
                  <Pop delay={scoreAt} from={0.2}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6 * u }}>
                      <span style={{ fontFamily: FONT_FAMILY, fontSize: 96 * u * k, fontWeight: 900, color: C.mint, letterSpacing: "-0.05em", lineHeight: 1 }}>{c.score}</span>
                      <span style={{ fontFamily: FONT_FAMILY, fontSize: 30 * u * k, fontWeight: 700, color: C.mint }}>점</span>
                    </div>
                  </Pop>
                </div>
                {burst > 0 && burst < 1 && (
                  <div
                    style={{
                      position: "absolute",
                      right: 10 * u,
                      bottom: -10 * u,
                      width: 220 * u * k,
                      height: 220 * u * k,
                      borderRadius: 999,
                      border: `${4 * u}px solid ${C.mint}`,
                      opacity: (1 - burst) * 0.7,
                      transform: `scale(${0.3 + burst * 1.3})`,
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>

      <div style={{ position: "absolute", bottom: (isPortrait ? 200 : 70) * u, left: 0, right: 0, textAlign: "center", padding: `0 ${80 * u}px` }}>
        <Rise delay={60} distance={24}>
          <div style={{ fontFamily: FONT_FAMILY, fontSize: (isPortrait ? 28 : 32) * u, fontWeight: 500, color: C.surface100, letterSpacing: "-0.01em" }}>
            교사는 채점 시간을 줄이고, 학생은 바로 피드백을 받습니다
          </div>
        </Rise>
      </div>
    </DarkStage>
  );
};
