import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { CardHeaderDark, ChipDark, GlassDark, Reveal, td } from "../../components/Dark";
import { ClipReveal, RollingNumber } from "../../components/Flourish";
import { clamp, SMOOTH, sp } from "../../lib/motion";
import { D } from "../../lib/themeDark";
import { TmbLayout } from "./TmbLayout";

// 03 — 강사는 객관적으로 성장합니다: 내 수업 리포트(나만 보기) · 8주 추이 · 이번 주 강점 · 다음 수업에서 해볼 한 가지. (수치는 예시)
const WEEKS = [74, 76, 75, 79, 81, 83, 84, 86];
const CHART_W = 520;
const CHART_H = 230;
const DRAW_AT = 22;
const CHECK_AT = 118;

export const TeacherB: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = sp(frame - DRAW_AT, fps, SMOOTH, 64);
  const min = 70;
  const max = 90;
  const pts = WEEKS.map((v, i) => [12 + (i / (WEEKS.length - 1)) * (CHART_W - 24), CHART_H - 26 - ((v - min) / (max - min)) * (CHART_H - 60)] as const);
  const line = pts.map((q, i) => `${i === 0 ? "M" : "L"}${q[0].toFixed(1)},${q[1].toFixed(1)}`).join(" ");
  const area = `${line} L${pts[pts.length - 1][0].toFixed(1)},${CHART_H - 20} L${pts[0][0].toFixed(1)},${CHART_H - 20} Z`;
  const last = pts[pts.length - 1];
  const lastS = sp(frame - (DRAW_AT + 56), fps, { damping: 12, stiffness: 220, mass: 0.7 });
  const check = sp(frame - CHECK_AT, fps, { damping: 11, stiffness: 260, mass: 0.6 });
  const pulse = 0.5 + 0.5 * Math.sin(frame / 7);

  return (
    <TmbLayout
      step={2}
      title={
        <>
          강사는,
          <br />
          객관적으로 성장합니다
        </>
      }
      sub={
        <>
          점수가 아니라 자기 수업을 봅니다. <span style={{ color: D.ink, fontWeight: 700 }}>내 리포트는 내가 먼저 보고,</span> 다음 수업에서 해볼 한 가지를 고릅니다. 감시가 아니라 성장입니다.
        </>
      }
      bullets={["내 리포트는 내가 먼저", "8주 추이", "다음 수업의 한 가지"]}
    >
      <ClipReveal delay={7} radius={32} duration={26}>
        <GlassDark width={930} padding={28}>
          <CardHeaderDark
            title="내 수업 리포트 · 정유진 선생님"
            right={
              <div style={{ display: "flex", gap: 8 }}>
                <ChipDark delay={16} tone="mute" size={14}>
                  중1 영어 · 최근 8주
                </ChipDark>
                <ChipDark delay={22} tone="lime" size={14}>
                  ● 나만 보기
                </ChipDark>
              </div>
            }
          />

          <div style={{ display: "flex", gap: 22, marginTop: 18 }}>
            {/* 추이 차트 */}
            <div style={{ width: CHART_W, flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                <div>
                  <div style={td(13, 700, D.faint, { letterSpacing: "0.1em" })}>종합 점수 추이</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 4 }}>
                    <RollingNumber from={74} to={86} delay={DRAW_AT} duration={64} size={44} color={D.ink} />
                    <span style={{ ...td(20, 800, D.lime), opacity: lastS }}>▲ 12</span>
                    <span style={td(14, 600, D.mute)}>8주 전 74</span>
                  </div>
                </div>
                <span style={{ ...td(13, 600, D.faint) }}>이번 주 수업 18회 반영</span>
              </div>
              <svg width={CHART_W} height={CHART_H} style={{ display: "block", marginTop: 6, overflow: "visible" }}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={D.lime} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={D.lime} stopOpacity={0} />
                  </linearGradient>
                  <clipPath id="areaClip">
                    <rect x={0} y={0} width={CHART_W * p} height={CHART_H} />
                  </clipPath>
                </defs>
                {[0, 1, 2, 3].map((i) => {
                  const y = CHART_H - 26 - (i / 3) * (CHART_H - 60);
                  return (
                    <g key={i}>
                      <line x1={0} x2={CHART_W} y1={y} y2={y} stroke={D.line} strokeWidth={1} />
                      <text x={CHART_W + 6} y={y + 4} fill={D.faint} fontSize={11} fontFamily="Pretendard">{Math.round(min + (i / 3) * (max - min))}</text>
                    </g>
                  );
                })}
                <path d={area} fill="url(#areaGrad)" clipPath="url(#areaClip)" />
                <path d={line} stroke={D.lime} strokeWidth={3.5} fill="none" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
                {pts.map((q, i) => {
                  const on = p >= i / (WEEKS.length - 1) - 0.01;
                  return <circle key={i} cx={q[0]} cy={q[1]} r={on ? 4 : 0} fill="#0A1A14" stroke={D.lime} strokeWidth={2} />;
                })}
                <circle cx={last[0]} cy={last[1]} r={10 + pulse * 6} fill="none" stroke={D.lime} strokeWidth={1.5} opacity={lastS * (0.6 - pulse * 0.4)} />
                <circle cx={last[0]} cy={last[1]} r={6 * lastS} fill={D.lime} />
                {WEEKS.map((_, i) => (
                  <text key={i} x={pts[i][0]} y={CHART_H - 2} fill={D.faint} fontSize={11} fontFamily="Pretendard" textAnchor="middle">
                    {i === WEEKS.length - 1 ? "이번 주" : `${WEEKS.length - 1 - i}주 전`}
                  </text>
                ))}
              </svg>
            </div>

            {/* 우측 — 강점 · 다음 한 가지 */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
              <Reveal delay={48} distance={14}>
                <div style={{ background: D.glass, border: `1px solid ${D.line}`, borderRadius: 16, padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ ...td(12, 800, "#0A1A14"), background: D.lime, borderRadius: 6, padding: "3px 8px" }}>이번 주 강점</span>
                    <span style={td(14, 800, D.lime)}>수업 전달 90</span>
                  </div>
                  <div style={{ ...td(16, 600, D.ink), marginTop: 8, lineHeight: 1.45, wordBreak: "keep-all" }}>개념 설명이 명확하고, 생활 속 예시가 구체적이에요.</div>
                </div>
              </Reveal>
              <Reveal delay={70} distance={14}>
                <div style={{ background: D.glass, border: `1px solid ${check > 0.5 ? D.lime : D.line}`, borderRadius: 16, padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ ...td(12, 800, D.ink), background: D.glass2, border: `1px solid ${D.line2}`, borderRadius: 6, padding: "3px 8px" }}>다음 수업에서 해볼 한 가지</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 10 }}>
                    <span style={{ width: 26, height: 26, borderRadius: 8, border: `2px solid ${check > 0.5 ? D.lime : D.line2}`, background: check > 0.5 ? D.lime : "transparent", display: "grid", placeItems: "center", ...td(16, 900, "#0A1A14"), flexShrink: 0 }}>
                      <span style={{ transform: `scale(${check})`, display: "inline-block" }}>✓</span>
                    </span>
                    <span style={{ ...td(16, 700, D.ink), lineHeight: 1.4, wordBreak: "keep-all" }}>뒷줄 학생에게 발문 2회 나누기</span>
                  </div>
                  <div style={{ marginTop: 10, display: "flex", gap: 6 }}>
                    <ChipDark delay={84} tone="ghost" size={12}>
                      ▶ 근거 장면 · 10.30 08:15
                    </ChipDark>
                    <ChipDark delay={90} tone="mute" size={12}>
                      상호작용 71 → 목표 78
                    </ChipDark>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>

          {/* 하단 — 열람 원칙 */}
          <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 12, borderTop: `1px solid ${D.line}`, paddingTop: 14, opacity: interpolate(frame - 100, [0, 10], [0, 1], clamp) }}>
            <span style={{ width: 8, height: 8, borderRadius: 999, background: D.lime, boxShadow: `0 0 12px ${D.lime}` }} />
            <span style={td(15, 700, D.ink)}>내 리포트는 내가 먼저 봅니다.</span>
            <span style={td(15, 500, D.mute)}>점수가 아니라 추이로 이야기하고, 공유 범위는 좁게 시작합니다.</span>
          </div>
        </GlassDark>
      </ClipReveal>
    </TmbLayout>
  );
};
