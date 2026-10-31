import React from "react";
import { interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { RollingNumber } from "../../components/Flourish";
import { Chip } from "../../components/Ui";
import { MONO } from "../../lib/fonts";
import { clamp, SMOOTH, sp } from "../../lib/motion";
import { C } from "../../lib/theme";
import { Card, CardTop, CineFeature, DisplayNumber, ExampleTag, GiantType, mono, t } from "../Layout";
import { local } from "../timeline";

const L = {
  title: local("eval", "eval.title"),
  card: local("eval", "eval.card"),
  scanStart: local("eval", "eval.scanStart"),
  scanEnd: local("eval", "eval.scanEnd"),
  ring: local("eval", "eval.ring"),
  insight: local("eval", "eval.insight"),
};
// 예시 수업(v4와 동일): 중2 국어 A반 · 윤동주 「서시」 · 60분. 점수는 예시.
const AREAS = [
  { label: "수업 전달", score: 92 },
  { label: "수업 분위기", score: 88 },
  { label: "상호작용", score: 81 },
  { label: "언어 표현", score: 90 },
];
// 발문 위치(수업 진행 0–1)
const QUESTIONS = [0.12, 0.2, 0.24, 0.29, 0.33, 0.38, 0.43, 0.47, 0.52, 0.58, 0.63, 0.69, 0.74, 0.83];

// 01 — 수업을 분석하고
export const Eval: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inner = 952 - 80;
  const bars = 60;
  const gap = 5;
  const barW = (inner - gap * (bars - 1)) / bars;
  const scanT = interpolate(frame, [L.scanStart, L.scanEnd], [0, 1], clamp);
  const ringSize = 256;
  const r = 98;
  const circ = 2 * Math.PI * r;
  const ringP = sp(frame - L.ring, fps, SMOOTH, 30) * 0.88;
  const ins = sp(frame - L.insight, fps, SMOOTH, 14);

  return (
    <CineFeature
      index={0}
      titleAt={L.title}
      cardAt={L.card}
      sheenAt={L.ring + 10}
      lineA="수업을"
      lineB="분석하고,"
      sub="1시간 수업을 4개 영역으로 진단한 리포트"
      beamX={78}
      rest={{ rx: 7, ry: -11 }}
      backdrop={<GiantType text="88" at={L.ring} top={250} left={470} />}
    >
      <Card>
        <CardTop
          title="강의 평가 리포트"
          right={
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              {frame >= L.scanEnd && (
                <Chip delay={L.scanEnd} size={22} bg={C.lime} color={C.ink}>
                  분석 완료
                </Chip>
              )}
              <ExampleTag />
            </div>
          }
        />
        <div style={{ ...mono(22, 500, C.gray), marginTop: 16 }}>중2 국어 A반 · 60:00 · 이서윤 선생님</div>

        {/* 파형 + 스캐너 */}
        <div style={{ position: "relative", height: 84, marginTop: 16, display: "flex", alignItems: "center", gap }}>
          {Array.from({ length: bars }).map((_, i) => {
            const amp = 0.3 + 0.7 * random(`be${i}`);
            const wobble = 0.6 + 0.4 * Math.sin(frame * 0.3 + i * 0.5);
            const env = sp(frame - L.card - 4 - i * 0.2, fps, SMOOTH, 14);
            const passed = scanT > 0 && (i + 0.5) / bars <= scanT;
            return <div key={i} style={{ width: barW, height: Math.max(env > 0.02 ? 5 : 0, 80 * amp * wobble * env), borderRadius: barW, background: passed ? C.limeDeep : C.ivory2 }} />;
          })}
          <div style={{ position: "absolute", left: scanT * inner, top: -8, bottom: -8, width: 4, background: C.forest, boxShadow: `0 0 22px ${C.lime}`, opacity: interpolate(frame, [L.scanStart - 2, L.scanStart + 2, L.scanEnd - 4, L.scanEnd + 2], [0, 1, 1, 0], clamp) }} />
        </div>

        {/* 발문 위치 */}
        <div style={{ position: "relative", height: 30, marginTop: 8 }}>
          {QUESTIONS.map((q, i) => (
            <div key={i} style={{ position: "absolute", left: q * inner, top: 4, width: 14, height: 14, borderRadius: 3, transform: `translateX(-50%) rotate(45deg) scale(${scanT >= q ? 1 : 0})`, background: C.limeDeep }} />
          ))}
          <div style={{ position: "absolute", right: 0, top: -2, ...t(22, 800, C.limeInk), opacity: interpolate(frame - L.scanEnd, [0, 6], [0, 1], clamp) }}>◆ 발문 14회</div>
        </div>

        {/* 종합 링 + 영역 */}
        <div style={{ display: "flex", gap: 36, marginTop: 22, alignItems: "center" }}>
          <div style={{ position: "relative", width: ringSize, height: ringSize, flexShrink: 0 }}>
            <svg width={ringSize} height={ringSize} style={{ transform: "rotate(-90deg)" }}>
              {/* 다이얼과 같은 게이지 언어 — 바깥 분 눈금이 채워진 만큼 켜지고, 아크 끝에 빛나는 캡 */}
              {Array.from({ length: 60 }).map((_, i) => {
                const a = (i / 60) * Math.PI * 2;
                const major = i % 5 === 0;
                const r0 = r + 15;
                const r1 = r + (major ? 22 : 18);
                const on = i / 60 <= ringP;
                return <line key={i} x1={ringSize / 2 + Math.cos(a) * r0} y1={ringSize / 2 + Math.sin(a) * r0} x2={ringSize / 2 + Math.cos(a) * r1} y2={ringSize / 2 + Math.sin(a) * r1} stroke={on ? C.forest : C.gray300} strokeOpacity={on ? 0.9 : 0.45} strokeWidth={major ? 2 : 1.1} />;
              })}
              <circle cx={ringSize / 2} cy={ringSize / 2} r={r} stroke={C.ivory2} strokeWidth={20} fill="none" />
              <circle cx={ringSize / 2} cy={ringSize / 2} r={r} stroke={`url(#eval-arc)`} strokeWidth={20} fill="none" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - ringP)} />
              {ringP > 0.01 && <circle cx={ringSize / 2 + Math.cos(ringP * Math.PI * 2) * r} cy={ringSize / 2 + Math.sin(ringP * Math.PI * 2) * r} r={7} fill={C.white} stroke={C.forest} strokeWidth={3} />}
              <defs>
                <linearGradient id="eval-arc" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor={C.lime} />
                  <stop offset="1" stopColor={C.limeDeep} />
                </linearGradient>
              </defs>
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <DisplayNumber to={88} delay={L.ring} duration={28} size={112} color={C.forest} />
              <span style={mono(18, 600, C.gray, { letterSpacing: "0.14em" })}>OVERALL</span>
            </div>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
            {AREAS.map((a, i) => {
              const start = L.ring + 2 + i * 4;
              const fill = sp(frame - start, fps, SMOOTH, 24) * (a.score / 100);
              const low = a.score < 85;
              return (
                <div key={a.label} style={{ opacity: interpolate(frame - start + 4, [0, 6], [0, 1], clamp) }}>
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                    <span style={t(28, 800, C.ink)}>{a.label}</span>
                    <RollingNumber to={a.score} delay={start} duration={24} size={30} weight={600} color={low ? C.limeInk : C.forest} style={{ fontFamily: MONO, letterSpacing: "0" }} />
                  </div>
                  <div style={{ marginTop: 6, height: 12, borderRadius: 999, background: C.ivory2, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${fill * 100}%`, background: low ? C.limeDeep : `linear-gradient(90deg, ${C.lime}, ${C.limeDeep})`, borderRadius: 999 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 강점 */}
        <div style={{ marginTop: 24, background: C.limeSoft, borderRadius: 24, padding: "18px 24px", opacity: ins, transform: `translateY(${(1 - ins) * 20}px)` }}>
          <div style={mono(20, 700, C.limeInk, { letterSpacing: "0.1em" })}>강점 · 12:40</div>
          <div style={{ ...t(30, 700, C.ink), marginTop: 6, lineHeight: 1.4, wordBreak: "keep-all" }}>'상징'을 생활 속 예시로 풀어 이해를 도왔어요.</div>
        </div>
      </Card>
    </CineFeature>
  );
};
