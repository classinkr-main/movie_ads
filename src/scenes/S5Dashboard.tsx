import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { LightStage } from "../components/Backgrounds";
import { CountUp } from "../components/Kinetic";
import { Chip, Eyebrow, Rise } from "../components/Ui";
import { FONT_FAMILY } from "../lib/fonts";
import { useLayout } from "../lib/layout";
import { SMOOTH, sp } from "../lib/motion";
import { C } from "../lib/theme";

// Notion "AI 채점 기준" — 4개 영역 11개 항목 (점수는 예시)
const AREAS = [
  { label: "수업 전달", score: 92, items: ["효과성", "흥미·몰입도", "스캐폴딩·안내"] },
  { label: "수업 분위기", score: 88, items: ["적극적 참여", "협업", "정서적 안전감"] },
  { label: "수업 상호작용", score: 85, items: ["공평성", "반응성·평등성", "자율성"] },
  { label: "언어 표현", score: 90, items: ["명료성·유창성", "표현력·전달력"] },
];
const OVERALL = 88;

// S5 — 리포트 대시보드: 종합 점수 링 + 4영역 바 + 11항목 칩
export const S5Dashboard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u, isPortrait, width } = useLayout();

  const ringSize = (isPortrait ? 300 : 380) * u;
  const stroke = 24 * u;
  const r = (ringSize - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const ringP = sp(frame - 16, fps, SMOOTH, 48) * (OVERALL / 100);

  const leftW = isPortrait ? width - 120 * u : 760 * u;

  return (
    <LightStage>
      <AbsoluteFill
        style={{
          flexDirection: isPortrait ? "column" : "row",
          padding: isPortrait ? `${180 * u}px ${60 * u}px` : `${110 * u}px ${110 * u}px`,
          gap: isPortrait ? 60 * u : 80 * u,
          alignItems: isPortrait ? "stretch" : "center",
        }}
      >
        {/* 좌: 헤드라인 + 종합 링 */}
        <div style={{ width: leftW, display: "flex", flexDirection: "column", gap: 28 * u }}>
          <Rise delay={0} distance={20}>
            <Eyebrow size={24 * u} color={C.brand}>
              AI 채점 기준 · Grading Criteria
            </Eyebrow>
          </Rise>
          <Rise delay={3} distance={40}>
            <div style={{ fontFamily: FONT_FAMILY, fontSize: (isPortrait ? 88 : 110) * u, fontWeight: 900, color: C.ink, letterSpacing: "-0.045em", lineHeight: 1.05 }}>
              <CountUp to={4} delay={6} duration={26} style={{ color: C.brand, minWidth: "0.7em" }} />
              개 영역 ·{" "}
              <CountUp to={11} delay={10} duration={30} style={{ color: C.brand, minWidth: "1.2em" }} />
              개 항목
            </div>
          </Rise>
          <Rise delay={14} distance={30}>
            <div style={{ fontFamily: FONT_FAMILY, fontSize: (isPortrait ? 30 : 34) * u, fontWeight: 500, color: C.warmGray, letterSpacing: "-0.01em", lineHeight: 1.4 }}>
              교사의 발화·상호작용·수업 분위기를
              <br />
              다각도로 분석해 점수와 개선 포인트를 남깁니다.
            </div>
          </Rise>

          <Rise delay={16} distance={40} style={{ display: "flex", alignItems: "center", gap: 36 * u, marginTop: 10 * u }}>
            <div style={{ position: "relative", width: ringSize, height: ringSize }}>
              <svg width={ringSize} height={ringSize} style={{ transform: "rotate(-90deg)" }}>
                <circle cx={ringSize / 2} cy={ringSize / 2} r={r} stroke="#E8E8E4" strokeWidth={stroke} fill="none" />
                <circle
                  cx={ringSize / 2}
                  cy={ringSize / 2}
                  r={r}
                  stroke={C.forest}
                  strokeWidth={stroke}
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={circ}
                  strokeDashoffset={circ * (1 - ringP)}
                />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <CountUp to={OVERALL} delay={16} duration={48} style={{ fontFamily: FONT_FAMILY, fontSize: ringSize * 0.34, fontWeight: 900, color: C.forest, letterSpacing: "-0.05em", lineHeight: 1 }} />
                <div style={{ fontFamily: FONT_FAMILY, fontSize: 22 * u, fontWeight: 600, color: C.warmGray, marginTop: 6 * u, letterSpacing: "0.04em" }}>종합 점수</div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 * u }}>
              <Chip delay={40} size={22 * u}>
                최근 수업 성과 요약
              </Chip>
              <Chip delay={46} size={22 * u}>
                세션별 상세 리포트
              </Chip>
              <Chip delay={52} size={22 * u}>
                PDF 다운로드
              </Chip>
            </div>
          </Rise>
        </div>

        {/* 우: 4영역 바 + 11항목 칩 */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: (isPortrait ? 26 : 34) * u }}>
          {AREAS.map((a, i) => {
            const start = 14 + i * 8;
            const fill = sp(frame - start, fps, SMOOTH, 36) * (a.score / 100);
            return (
              <Rise key={a.label} delay={start - 6} distance={40}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                  <div style={{ fontFamily: FONT_FAMILY, fontSize: (isPortrait ? 30 : 36) * u, fontWeight: 700, color: C.ink, letterSpacing: "-0.03em" }}>{a.label}</div>
                  <CountUp to={a.score} delay={start} duration={36} style={{ fontFamily: FONT_FAMILY, fontSize: (isPortrait ? 36 : 44) * u, fontWeight: 900, color: C.forest, letterSpacing: "-0.04em" }} />
                </div>
                <div style={{ marginTop: 10 * u, height: 22 * u, borderRadius: 999, background: "#E8E8E4", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${fill * 100}%`, borderRadius: 999, background: `linear-gradient(90deg, ${C.forest}, ${C.brandBright})` }} />
                </div>
                <div style={{ marginTop: 12 * u, display: "flex", gap: 10 * u, flexWrap: "wrap" }}>
                  {a.items.map((it, j) => (
                    <Chip key={it} delay={start + 14 + j * 4} size={(isPortrait ? 20 : 22) * u}>
                      {it}
                    </Chip>
                  ))}
                </div>
              </Rise>
            );
          })}
          <Rise delay={70} distance={10}>
            <div style={{ fontFamily: FONT_FAMILY, fontSize: 20 * u, fontWeight: 500, color: C.warmGray300, letterSpacing: "0.01em" }}>* 점수는 예시 화면입니다. 실제 리포트 표현은 업데이트에 따라 달라질 수 있습니다.</div>
          </Rise>
        </div>
      </AbsoluteFill>
    </LightStage>
  );
};
