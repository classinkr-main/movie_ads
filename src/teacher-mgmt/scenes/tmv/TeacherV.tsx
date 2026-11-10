import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { CardHeader, UiCard } from "../../../shared/brand/Card";
import { ClipReveal, Highlighter, RollingNumber } from "../../../shared/brand/Flourish";
import { Chip, Rise, Sticker } from "../../../shared/brand/Ui";
import { clamp, SMOOTH, sp } from "../../../shared/motion";
import { C } from "../../../shared/brand/theme";
import { tx } from "../tm/TmLayout";
import { TmvLayout } from "./TmvLayout";

// 03 — 강사는 객관적으로 성장합니다: 내 수업 리포트(나만 보기) · 8주 추이 라인 차트 드로잉 · +12 스티커 · 이번 주 강점 · 다음 수업에서 해볼 한 가지(체크). (수치는 예시)
const WEEKS = [74, 76, 75, 79, 81, 83, 84, 86];
const CHART_W = 500;
const CHART_H = 220;
const DRAW_AT = 20;
const CHECK_AT = 112;

export const TeacherV: React.FC = () => {
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
    <TmvLayout
      step={2}
      lines={["강사는,", "객관적으로 성장합니다"]}
      sub={
        <>
          점수가 아니라 자기 수업을 봅니다.{" "}
          <Highlighter delay={40} duration={16} inset={14}>
            <span style={{ color: C.ink, fontWeight: 700 }}>내 리포트는 내가 먼저 보고,</span>
          </Highlighter>{" "}
          다음 수업에서 해볼 한 가지를 고릅니다. 감시가 아니라 성장입니다.
        </>
      }
      bullets={["내 리포트는 내가 먼저", "8주 추이", "다음 수업의 한 가지"]}
    >
      <ClipReveal delay={7} from="bottom" radius={36} duration={26}>
        <UiCard width={900} padding={28}>
          <CardHeader
            title="내 수업 리포트 · 정유진 선생님"
            right={
              <div style={{ display: "flex", gap: 8 }}>
                <Chip delay={14} size={14} bg={C.ivory2} color={C.gray}>
                  중1 영어 · 최근 8주
                </Chip>
                <Chip delay={20} size={14} bg={C.lime} color={C.ink}>
                  ● 나만 보기
                </Chip>
              </div>
            }
          />

          <div style={{ display: "flex", gap: 22, marginTop: 18 }}>
            <div style={{ width: CHART_W, flexShrink: 0, position: "relative" }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                <div>
                  <div style={tx(13, 700, C.gray300, { letterSpacing: "0.1em" })}>종합 점수 추이</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 4 }}>
                    <RollingNumber from={74} to={86} delay={DRAW_AT} duration={64} size={44} color={C.forest} />
                    <span style={tx(14, 600, C.gray)}>8주 전 74</span>
                  </div>
                </div>
                <span style={tx(13, 600, C.gray300)}>이번 주 수업 18회 반영</span>
              </div>
              <svg width={CHART_W} height={CHART_H} style={{ display: "block", marginTop: 6, overflow: "visible" }}>
                <defs>
                  <linearGradient id="areaGradV" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={C.lime} stopOpacity={0.6} />
                    <stop offset="100%" stopColor={C.lime} stopOpacity={0} />
                  </linearGradient>
                  <clipPath id="areaClipV">
                    <rect x={0} y={0} width={CHART_W * p} height={CHART_H} />
                  </clipPath>
                </defs>
                {[0, 1, 2, 3].map((i) => {
                  const y = CHART_H - 26 - (i / 3) * (CHART_H - 60);
                  return (
                    <g key={i}>
                      <line x1={0} x2={CHART_W} y1={y} y2={y} stroke={C.hairline} strokeWidth={1} />
                      <text x={CHART_W + 6} y={y + 4} fill={C.gray300} fontSize={11} fontFamily="Pretendard" fontWeight={600}>{Math.round(min + (i / 3) * (max - min))}</text>
                    </g>
                  );
                })}
                <path d={area} fill="url(#areaGradV)" clipPath="url(#areaClipV)" />
                <path d={line} stroke={C.forest} strokeWidth={3.5} fill="none" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
                {pts.map((q, i) => {
                  const on = p >= i / (WEEKS.length - 1) - 0.01;
                  return <circle key={i} cx={q[0]} cy={q[1]} r={on ? 4.5 : 0} fill={C.white} stroke={C.forest} strokeWidth={2.5} />;
                })}
                <circle cx={last[0]} cy={last[1]} r={10 + pulse * 6} fill="none" stroke={C.limeDeep} strokeWidth={2} opacity={lastS * (0.7 - pulse * 0.5)} />
                <circle cx={last[0]} cy={last[1]} r={7 * lastS} fill={C.limeDeep} />
                {WEEKS.map((_, i) => (
                  <text key={i} x={pts[i][0]} y={CHART_H - 2} fill={C.gray300} fontSize={11} fontFamily="Pretendard" fontWeight={600} textAnchor="middle">
                    {i === WEEKS.length - 1 ? "이번 주" : `${WEEKS.length - 1 - i}주 전`}
                  </text>
                ))}
              </svg>
              {/* +12 스티커 — 선이 다 그려지면 끝점 옆에 붙는다 */}
              <div style={{ position: "absolute", left: last[0] - 70, top: last[1] + 30 }}>
                <Sticker delay={DRAW_AT + 60} size={20} rotate={-8}>
                  8주 +12점
                </Sticker>
              </div>
            </div>

            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
              <Rise delay={46} distance={14}>
                <div style={{ background: C.limeSoft, borderRadius: 16, padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ ...tx(12, 800, C.ink), background: C.lime, borderRadius: 6, padding: "3px 8px" }}>이번 주 강점</span>
                    <span style={tx(14, 800, C.limeInk)}>수업 전달 90</span>
                  </div>
                  <div style={{ ...tx(16, 600, C.ink), marginTop: 8, lineHeight: 1.45, wordBreak: "keep-all" }}>개념 설명이 명확하고, 생활 속 예시가 구체적이에요.</div>
                </div>
              </Rise>
              <Rise delay={68} distance={14}>
                <div style={{ background: C.white, border: `1.5px solid ${check > 0.5 ? C.lime : C.hairline}`, borderRadius: 16, padding: "14px 16px", boxShadow: check > 0.5 ? "0 12px 30px rgba(200,240,90,0.35)" : "none" }}>
                  <span style={{ ...tx(12, 800, C.gray), background: C.ivory2, borderRadius: 6, padding: "3px 8px" }}>다음 수업에서 해볼 한 가지</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 10 }}>
                    <span style={{ width: 26, height: 26, borderRadius: 8, border: `2px solid ${check > 0.5 ? C.limeDeep : C.hairline}`, background: check > 0.5 ? C.lime : "transparent", display: "grid", placeItems: "center", ...tx(16, 900, C.forest), flexShrink: 0 }}>
                      <span style={{ transform: `scale(${check})`, display: "inline-block" }}>✓</span>
                    </span>
                    <span style={{ ...tx(16, 700, C.ink), lineHeight: 1.4, wordBreak: "keep-all" }}>뒷줄 학생에게 발문 2회 나누기</span>
                  </div>
                  <div style={{ marginTop: 10, display: "flex", gap: 6 }}>
                    <Chip delay={82} size={12} bg={C.forest} color={C.white}>
                      ▶ 근거 장면 · 10.30 08:15
                    </Chip>
                    <Chip delay={88} size={12} bg={C.ivory2} color={C.gray}>
                      상호작용 71 → 목표 78
                    </Chip>
                  </div>
                </div>
              </Rise>
            </div>
          </div>

          <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 12, borderTop: `1.5px solid ${C.hairline}`, paddingTop: 14, opacity: interpolate(frame - 98, [0, 10], [0, 1], clamp) }}>
            <span style={{ width: 9, height: 9, borderRadius: 999, background: C.limeDeep }} />
            <span style={tx(15, 800, C.ink)}>내 리포트는 내가 먼저 봅니다.</span>
            <span style={tx(15, 500, C.gray)}>점수가 아니라 추이로 이야기하고, 공유 범위는 좁게 시작합니다.</span>
          </div>
        </UiCard>
      </ClipReveal>
    </TmvLayout>
  );
};
