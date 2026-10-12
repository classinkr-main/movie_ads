import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { IvoryStage } from "../components/Backgrounds";
import { GlassCard, Highlighter, RollingNumber } from "../components/Flourish";
import { Chip, Eyebrow, Rise, Sticker } from "../components/Ui";
import { FONT_FAMILY } from "../lib/fonts";
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

// S5 — 리포트 대시보드
export const Dashboard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ringSize = 400;
  const stroke = 26;
  const r = (ringSize - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const ringP = sp(frame - 20, fps, SMOOTH, 60) * (OVERALL / 100);

  return (
    <IvoryStage>
      <AbsoluteFill style={{ flexDirection: "row", padding: "96px 110px", gap: 90, alignItems: "center" }}>
        {/* 좌: 헤드라인 + 종합 링 */}
        <div style={{ width: 780, display: "flex", flexDirection: "column", gap: 26 }}>
          <Rise delay={0} distance={16}>
            <Eyebrow size={22}>AI 채점 기준 · Grading Criteria</Eyebrow>
          </Rise>
          <Rise delay={3} distance={40}>
            <div style={{ fontFamily: FONT_FAMILY, fontSize: 104, fontWeight: 900, color: C.ink, letterSpacing: "-0.045em", lineHeight: 1.08 }}>
              <span style={{ display: "inline-flex", alignItems: "baseline" }}>
                <RollingNumber to={4} delay={6} duration={30} size={104} color={C.forest} />개 영역 ·
              </span>
              <br />
              <Highlighter delay={30} inset={16}>
                <span style={{ display: "inline-flex", alignItems: "baseline" }}>
                  <RollingNumber to={11} delay={12} duration={36} size={104} color={C.forest} />개 항목
                </span>
              </Highlighter>
            </div>
          </Rise>
          <Rise delay={16} distance={30}>
            <div style={{ fontFamily: FONT_FAMILY, fontSize: 32, fontWeight: 500, color: C.gray, letterSpacing: "-0.01em", lineHeight: 1.45 }}>
              교사의 발화·상호작용·수업 분위기를 다각도로 분석해
              <br />
              점수와 개선 포인트를 남깁니다.
            </div>
          </Rise>

          <Rise delay={18} distance={40} style={{ display: "flex", alignItems: "center", gap: 40, marginTop: 6 }}>
            <div style={{ position: "relative", width: ringSize, height: ringSize }}>
              {/* 회전 눈금 */}
              <svg width={ringSize} height={ringSize} style={{ position: "absolute", inset: 0, transform: `rotate(${frame * 0.4}deg)`, opacity: 0.6 }}>
                {Array.from({ length: 60 }).map((_, i) => {
                  const a = (i / 60) * Math.PI * 2;
                  const R1 = ringSize / 2 - 2;
                  const R2 = R1 - (i % 5 === 0 ? 14 : 7);
                  return <line key={i} x1={ringSize / 2 + Math.cos(a) * R1} y1={ringSize / 2 + Math.sin(a) * R1} x2={ringSize / 2 + Math.cos(a) * R2} y2={ringSize / 2 + Math.sin(a) * R2} stroke={C.limeDeep} strokeWidth={2} />;
                })}
              </svg>
              <svg width={ringSize} height={ringSize} style={{ transform: "rotate(-90deg)" }}>
                <circle cx={ringSize / 2} cy={ringSize / 2} r={r - 24} stroke={C.ivory2} strokeWidth={stroke} fill="none" />
                <circle cx={ringSize / 2} cy={ringSize / 2} r={r - 24} stroke={C.lime} strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={2 * Math.PI * (r - 24)} strokeDashoffset={2 * Math.PI * (r - 24) * (1 - ringP)} />
                <circle cx={ringSize / 2} cy={ringSize / 2} r={r - 24} stroke={C.limeDeep} strokeWidth={6} fill="none" strokeLinecap="round" strokeDasharray={2 * Math.PI * (r - 24)} strokeDashoffset={2 * Math.PI * (r - 24) * (1 - ringP)} opacity={0.9} />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <RollingNumber to={OVERALL} delay={20} duration={60} size={132} color={C.forest} />
                <div style={{ fontFamily: FONT_FAMILY, fontSize: 22, fontWeight: 700, color: C.gray, marginTop: 2, letterSpacing: "0.06em" }}>종합 점수</div>
              </div>
              <div style={{ position: "absolute", right: -30, top: 10 }}>
                <Sticker delay={84} rotate={8} size={22}>
                  예시 리포트
                </Sticker>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Chip delay={50} size={22}>최근 수업 성과 요약</Chip>
              <Chip delay={56} size={22}>세션별 상세 리포트</Chip>
              <Chip delay={62} size={22}>PDF 다운로드</Chip>
            </div>
          </Rise>
        </div>

        {/* 우: 4영역 바 + 11항목 칩 */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 30 }}>
          {AREAS.map((a, i) => {
            const start = 16 + i * 10;
            const fill = sp(frame - start, fps, SMOOTH, 40) * (a.score / 100);
            return (
              <Rise key={a.label} delay={start - 6} distance={40}>
                <GlassCard padding={24} radius={24} style={{ boxShadow: "0 16px 40px rgba(28,27,23,0.07)" }}>
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                    <div style={{ fontFamily: FONT_FAMILY, fontSize: 34, fontWeight: 800, color: C.ink, letterSpacing: "-0.03em" }}>{a.label}</div>
                    <RollingNumber to={a.score} delay={start} duration={40} size={44} color={C.forest} />
                  </div>
                  <div style={{ marginTop: 12, height: 18, borderRadius: 999, background: C.ivory2, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${fill * 100}%`, borderRadius: 999, background: `linear-gradient(90deg, ${C.lime}, ${C.limeDeep})` }} />
                  </div>
                  <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {a.items.map((it, j) => (
                      <Chip key={it} delay={start + 18 + j * 5} size={21}>
                        {it}
                      </Chip>
                    ))}
                  </div>
                </GlassCard>
              </Rise>
            );
          })}
          <Rise delay={96} distance={10}>
            <div style={{ fontFamily: FONT_FAMILY, fontSize: 19, fontWeight: 500, color: C.gray300 }}>* 점수는 예시 화면입니다. 실제 리포트 표현은 업데이트에 따라 달라질 수 있습니다.</div>
          </Rise>
        </div>
      </AbsoluteFill>
    </IvoryStage>
  );
};
