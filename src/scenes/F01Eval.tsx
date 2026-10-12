import React from "react";
import { interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { CardHeader, FeatureLayout, UiCard } from "../components/Feature";
import { ClipReveal, RollingNumber } from "../components/Flourish";
import { Chip } from "../components/Ui";
import { FONT_FAMILY } from "../lib/fonts";
import { clamp, SMOOTH, sp } from "../lib/motion";
import { C } from "../lib/theme";

const AREAS = [
  { label: "수업 전달", score: 92 },
  { label: "수업 분위기", score: 88 },
  { label: "수업 상호작용", score: 85 },
  { label: "언어 표현", score: 90 },
];

// 01 — AI 강의 평가
export const F01Eval: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const bars = 56;
  const waveW = 780;
  const gap = 5;
  const barW = (waveW - gap * (bars - 1)) / bars;
  const scanT = interpolate(frame, [22, 70], [0, 1], clamp);
  const ringSize = 220;
  const r = 92;
  const circ = 2 * Math.PI * r;
  const ringP = sp(frame - 40, fps, SMOOTH, 50) * 0.88;

  return (
    <FeatureLayout
      index={0}
      title={
        <>
          녹화된 수업을
          <br />
          AI가 평가합니다
        </>
      }
      sub="교사의 발화·상호작용·수업 분위기를 4개 영역 11개 항목으로 진단하고 점수와 개선 포인트를 남깁니다."
      bullets={["4개 영역 · 11개 항목", "교사 개발 대시보드", "세션별 리포트"]}
    >
      <ClipReveal delay={8} radius={36}>
        <UiCard width={860}>
          <CardHeader
            title="강의 평가 리포트"
            right={
              <Chip delay={74} size={18} bg={C.lime} color={C.ink}>
                분석 완료
              </Chip>
            }
          />
          {/* 파형 + 스캐너 */}
          <div style={{ position: "relative", height: 96, marginTop: 22, display: "flex", alignItems: "center", gap }}>
            {Array.from({ length: bars }).map((_, i) => {
              const amp = 0.3 + 0.7 * random(`e${i}`);
              const wobble = 0.55 + 0.45 * Math.sin(frame * 0.3 + i * 0.5);
              const env = sp(frame - 12 - i * 0.3, fps, SMOOTH, 16);
              const passed = scanT > 0 && (i + 0.5) / bars <= scanT;
              return <div key={i} style={{ width: barW, height: Math.max(env > 0.02 ? 4 : 0, 90 * amp * wobble * env), borderRadius: barW, background: passed ? C.limeDeep : C.ivory2 }} />;
            })}
            <div style={{ position: "absolute", left: scanT * waveW, top: -8, bottom: -8, width: 3, background: C.forest, boxShadow: `0 0 18px ${C.lime}`, opacity: interpolate(frame, [20, 24, 68, 74], [0, 1, 1, 0], clamp) }} />
          </div>

          <div style={{ display: "flex", gap: 34, marginTop: 24, alignItems: "center" }}>
            {/* 종합 링 */}
            <div style={{ position: "relative", width: ringSize, height: ringSize, flexShrink: 0 }}>
              <svg width={ringSize} height={ringSize} style={{ transform: "rotate(-90deg)" }}>
                <circle cx={ringSize / 2} cy={ringSize / 2} r={r} stroke={C.ivory2} strokeWidth={18} fill="none" />
                <circle cx={ringSize / 2} cy={ringSize / 2} r={r} stroke={C.lime} strokeWidth={18} fill="none" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - ringP)} />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <RollingNumber to={88} delay={40} duration={50} size={72} color={C.forest} />
                <span style={{ fontFamily: FONT_FAMILY, fontSize: 15, fontWeight: 700, color: C.gray, letterSpacing: "0.08em" }}>종합 · 예시</span>
              </div>
            </div>
            {/* 영역 바 */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
              {AREAS.map((a, i) => {
                const start = 44 + i * 6;
                const fill = sp(frame - start, fps, SMOOTH, 34) * (a.score / 100);
                return (
                  <div key={a.label}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <span style={{ fontFamily: FONT_FAMILY, fontSize: 20, fontWeight: 700, color: C.ink }}>{a.label}</span>
                      <RollingNumber to={a.score} delay={start} duration={34} size={24} color={C.forest} />
                    </div>
                    <div style={{ marginTop: 6, height: 10, borderRadius: 999, background: C.ivory2, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${fill * 100}%`, background: `linear-gradient(90deg, ${C.lime}, ${C.limeDeep})`, borderRadius: 999 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </UiCard>
      </ClipReveal>
    </FeatureLayout>
  );
};
