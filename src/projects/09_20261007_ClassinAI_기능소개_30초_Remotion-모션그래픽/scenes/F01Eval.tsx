import React from "react";
import { interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { CardHeader, FeatureLayout, UiCard } from "../components/Feature";
import { ClipReveal, RollingNumber } from "../components/Flourish";
import { Chip } from "../components/Ui";
import { FONT_FAMILY } from "../../../shared/fonts";
import { clamp, SMOOTH, sp } from "../../../shared/motion";
import { C } from "../theme";

// 예시 수업: 중2 국어 A반 · 3단원 비유와 상징 · 윤동주 「서시」 (45분). 점수는 예시.
const AREAS = [
  { label: "수업 전달", score: 92, items: "효과성 · 흥미·몰입도 · 스캐폴딩" },
  { label: "수업 분위기", score: 88, items: "적극적 참여 · 협업 · 정서적 안전감" },
  { label: "수업 상호작용", score: 81, items: "공평성 · 반응성·평등성 · 자율성" },
  { label: "언어 표현", score: 90, items: "명료성·유창성 · 표현력·전달력" },
];
const PHASES = [
  { label: "도입", min: 8 },
  { label: "전개", min: 28 },
  { label: "정리", min: 9 },
];
// 발문 14회의 위치(수업 진행 0–1)
const QUESTIONS = [0.12, 0.2, 0.24, 0.29, 0.33, 0.38, 0.43, 0.47, 0.52, 0.58, 0.63, 0.69, 0.74, 0.83];
const SCAN_START = 16;
const SCAN_END = 58;

const t = (size: number, weight: number, color: string, extra?: React.CSSProperties): React.CSSProperties => ({
  fontFamily: FONT_FAMILY,
  fontSize: size,
  fontWeight: weight,
  color,
  letterSpacing: "-0.01em",
  ...extra,
});

// 01 — AI 강의 평가
export const F01Eval: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inner = 940 - 64;
  const bars = 76;
  const gap = 4;
  const barW = (inner - gap * (bars - 1)) / bars;
  const scanT = interpolate(frame, [SCAN_START, SCAN_END], [0, 1], clamp);
  const ringSize = 176;
  const r = 74;
  const circ = 2 * Math.PI * r;
  const ringP = sp(frame - 36, fps, SMOOTH, 46) * 0.88;
  const phaseP = sp(frame - 20, fps, SMOOTH, 26);
  const ratioP = sp(frame - 72, fps, SMOOTH, 22);

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
      sub="45분 수업 녹화를 4개 영역 11개 항목으로 진단하고, 강점과 개선 포인트를 장면 단위로 짚어 줍니다."
      bullets={["4개 영역 · 11개 항목", "교사 개발 대시보드", "세션별 리포트"]}
    >
      <ClipReveal delay={8} radius={36}>
        <UiCard width={940} padding={32}>
          <CardHeader
            title="강의 평가 리포트"
            right={
              <Chip delay={60} size={17} bg={C.lime} color={C.ink}>
                분석 완료
              </Chip>
            }
          />
          <div style={{ ...t(17, 600, C.gray), marginTop: 12 }}>중2 국어 A반 · 3단원 비유와 상징 · 45:00 · 이서윤 선생님</div>

          {/* 파형 + 스캐너 */}
          <div style={{ position: "relative", height: 62, marginTop: 14, display: "flex", alignItems: "center", gap }}>
            {Array.from({ length: bars }).map((_, i) => {
              const amp = 0.3 + 0.7 * random(`e${i}`);
              const wobble = 0.55 + 0.45 * Math.sin(frame * 0.3 + i * 0.5);
              const env = sp(frame - 10 - i * 0.25, fps, SMOOTH, 14);
              const passed = scanT > 0 && (i + 0.5) / bars <= scanT;
              return <div key={i} style={{ width: barW, height: Math.max(env > 0.02 ? 4 : 0, 58 * amp * wobble * env), borderRadius: barW, background: passed ? C.limeDeep : C.ivory2 }} />;
            })}
            <div style={{ position: "absolute", left: scanT * inner, top: -6, bottom: -6, width: 3, background: C.forest, boxShadow: `0 0 18px ${C.lime}`, opacity: interpolate(frame, [SCAN_START - 2, SCAN_START + 2, SCAN_END - 4, SCAN_END + 2], [0, 1, 1, 0], clamp) }} />
          </div>

          {/* 발문 위치 */}
          <div style={{ position: "relative", height: 18, marginTop: 6 }}>
            {QUESTIONS.map((q, i) => {
              const on = scanT >= q;
              return <div key={i} style={{ position: "absolute", left: q * inner, top: 2, width: 10, height: 10, borderRadius: 3, transform: `translateX(-50%) rotate(45deg) scale(${on ? 1 : 0})`, background: C.limeDeep }} />;
            })}
            <div style={{ position: "absolute", right: 0, top: -2, ...t(14, 800, C.limeInk), opacity: interpolate(frame - SCAN_END, [0, 6], [0, 1], clamp) }}>◆ 발문 14회 · 개방형 6</div>
          </div>

          {/* 수업 단계 */}
          <div style={{ display: "flex", gap: 4, marginTop: 6, height: 30, transform: `scaleX(${phaseP})`, transformOrigin: "0 50%" }}>
            {PHASES.map((p, i) => (
              <div key={p.label} style={{ flex: p.min, borderRadius: 8, background: i === 1 ? C.lime : C.limeSoft, display: "flex", alignItems: "center", justifyContent: "center", ...t(14, 800, C.ink) }}>
                {p.label} · {p.min}분
              </div>
            ))}
          </div>

          {/* 종합 링 + 영역 */}
          <div style={{ display: "flex", gap: 30, marginTop: 20, alignItems: "center" }}>
            <div style={{ position: "relative", width: ringSize, height: ringSize, flexShrink: 0 }}>
              <svg width={ringSize} height={ringSize} style={{ transform: "rotate(-90deg)" }}>
                <circle cx={ringSize / 2} cy={ringSize / 2} r={r} stroke={C.ivory2} strokeWidth={16} fill="none" />
                <circle cx={ringSize / 2} cy={ringSize / 2} r={r} stroke={C.lime} strokeWidth={16} fill="none" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - ringP)} />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <RollingNumber to={88} delay={36} duration={46} size={62} color={C.forest} />
                <span style={{ ...t(14, 700, C.gray), letterSpacing: "0.06em" }}>종합 점수</span>
              </div>
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 11 }}>
              {AREAS.map((a, i) => {
                const start = 40 + i * 5;
                const fill = sp(frame - start, fps, SMOOTH, 30) * (a.score / 100);
                const low = a.score < 85;
                return (
                  <div key={a.label} style={{ opacity: interpolate(frame - start + 4, [0, 6], [0, 1], clamp) }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                      <span style={t(18, 800, C.ink)}>{a.label}</span>
                      <span style={{ ...t(13, 600, C.gray300), flex: 1 }}>{a.items}</span>
                      <RollingNumber to={a.score} delay={start} duration={30} size={22} color={low ? C.limeInk : C.forest} />
                    </div>
                    <div style={{ marginTop: 5, height: 8, borderRadius: 999, background: C.ivory2, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${fill * 100}%`, background: low ? C.limeDeep : `linear-gradient(90deg, ${C.lime}, ${C.limeDeep})`, borderRadius: 999 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 발화 비율 */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 18 }}>
            <span style={{ ...t(14, 800, C.gray), width: 64 }}>발화 비율</span>
            <div style={{ flex: 1, display: "flex", height: 26, borderRadius: 999, overflow: "hidden", background: C.ivory2 }}>
              <div style={{ width: `${62 * ratioP}%`, background: C.forest, display: "flex", alignItems: "center", paddingLeft: 12, ...t(13, 800, C.white), whiteSpace: "nowrap", overflow: "hidden", opacity: ratioP > 0.02 ? 1 : 0 }}>교사 62%</div>
              <div style={{ width: `${38 * ratioP}%`, background: C.lime, display: "flex", alignItems: "center", paddingLeft: 12, ...t(13, 800, C.ink), whiteSpace: "nowrap", overflow: "hidden", opacity: ratioP > 0.02 ? 1 : 0 }}>학생 38%</div>
            </div>
          </div>

          {/* 강점 · 개선 포인트 */}
          <div style={{ display: "flex", gap: 14, marginTop: 16 }}>
            {[
              { d: 82, tag: "강점 · 12:40", text: "'상징'을 태극기·비둘기 같은 생활 속 예시로 풀어 개념 이해를 도왔어요.", bg: C.limeSoft, border: "transparent" },
              { d: 90, tag: "개선 포인트 · 상호작용", text: "발문 14회 중 9회가 앞줄 학생에게 몰렸어요. 질문을 고르게 나눠 보세요.", bg: C.white, border: C.hairline },
            ].map((c) => {
              const s = sp(frame - c.d, fps, SMOOTH, 16);
              return (
                <div key={c.tag} style={{ flex: 1, background: c.bg, border: `1.5px solid ${c.border}`, borderRadius: 18, padding: "14px 16px", opacity: s, transform: `translateY(${(1 - s) * 20}px)` }}>
                  <div style={t(13, 800, C.limeInk, { letterSpacing: "0.02em" })}>{c.tag}</div>
                  <div style={{ ...t(16, 600, C.ink), marginTop: 6, lineHeight: 1.45, wordBreak: "keep-all" }}>{c.text}</div>
                </div>
              );
            })}
          </div>
        </UiCard>
      </ClipReveal>
    </FeatureLayout>
  );
};
