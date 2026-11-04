import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { CardHeader, UiCard } from "../../components/Feature";
import { ClipReveal, RollingNumber } from "../../components/Flourish";
import { Chip } from "../../components/Ui";
import { clamp, SMOOTH, sp } from "../../lib/motion";
import { C } from "../../lib/theme";
import { TmLayout, tx } from "./TmLayout";

// 02 — 강사 관리: 강사별 평균·4주 추이 표 → 한 명을 고르면 '강점 먼저 · 개선점 하나' 면담 준비 노트가 열린다. (모두 예시)
type Status = "stable" | "growing" | "talk";
const TEACHERS: Array<{ name: string; cls: string; lessons: number; avg: number; trend: number[]; delta: number; status: Status }> = [
  { name: "이서윤", cls: "중2 국어", lessons: 16, avg: 88, trend: [84, 85, 87, 88], delta: 3, status: "stable" },
  { name: "박준호", cls: "고1 수학", lessons: 20, avg: 91, trend: [90, 91, 90, 91], delta: 1, status: "stable" },
  { name: "김하늘", cls: "초6 영어", lessons: 12, avg: 76, trend: [70, 72, 75, 76], delta: 6, status: "growing" },
  { name: "최민재", cls: "중3 과학", lessons: 14, avg: 83, trend: [83, 84, 82, 83], delta: 0, status: "stable" },
  { name: "정유진", cls: "중1 영어", lessons: 18, avg: 79, trend: [82, 81, 80, 79], delta: -3, status: "talk" },
];
const STATUS: Record<Status, { label: string; bg: string; color: string; border?: string }> = {
  stable: { label: "안정", bg: C.ivory2, color: C.gray },
  growing: { label: "성장 중", bg: C.lime, color: C.ink },
  talk: { label: "면담 추천", bg: C.limeSoft, color: C.limeInk, border: C.limeDeep },
};
const SELECT_AT = 104;
const NOTE_AT = 116;
const ROW_H = 58;
const SEL = 4;

const Sparkline: React.FC<{ values: number[]; delay: number; width: number; height: number; color: string }> = ({ values, delay, width, height, color }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = sp(frame - delay, fps, SMOOTH, 30);
  const min = Math.min(...values) - 2;
  const max = Math.max(...values) + 2;
  const pts = values.map((v, i) => [(i / (values.length - 1)) * (width - 8) + 4, height - 4 - ((v - min) / (max - min)) * (height - 8)] as const);
  const d = pts.map((pt, i) => `${i === 0 ? "M" : "L"}${pt[0].toFixed(1)},${pt[1].toFixed(1)}`).join(" ");
  const last = pts[pts.length - 1];
  const dotS = sp(frame - delay - 22, fps, SMOOTH, 10);
  return (
    <svg width={width} height={height} style={{ overflow: "visible" }}>
      <path d={d} stroke={color} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
      <circle cx={last[0]} cy={last[1]} r={5 * dotS} fill={color} />
    </svg>
  );
};

export const Manage: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sel = sp(frame - SELECT_AT, fps, SMOOTH, 14);
  const pulse = frame >= SELECT_AT ? 0.5 + 0.5 * Math.sin((frame - SELECT_AT) / 6) : 0;

  return (
    <TmLayout
      step={1}
      variant="ivory2"
      title={
        <>
          강사 관리는,
          <br />
          느낌 대신 근거로
        </>
      }
      sub="강사별 점수와 4주 추이를 한눈에 보고, 강점 먼저 · 개선점은 하나로 면담을 준비합니다. 감시가 아니라, 강사의 성장을 위해서요."
      bullets={["강사별 추이", "우리 학원 기준으로 평가", "면담 준비 노트"]}
    >
      <ClipReveal delay={10} radius={36} duration={26}>
        <UiCard width={960} padding={28}>
          <CardHeader
            title="강사 관리 · 교사 개발"
            right={
              <Chip delay={14} size={15} bg={C.ivory2} color={C.gray}>
                10월 · 최근 4주 추이
              </Chip>
            }
          />

          {/* 표 머리 */}
          <div style={{ display: "grid", gridTemplateColumns: "230px 80px 100px 190px 90px 1fr", alignItems: "center", padding: "14px 14px 8px", borderBottom: `1.5px solid ${C.hairline}`, opacity: interpolate(frame - 12, [0, 8], [0, 1], clamp) }}>
            {["강사", "수업", "평균 점수", "4주 추이", "변화", "상태"].map((h) => (
              <span key={h} style={tx(12, 800, C.gray300, { letterSpacing: "0.1em" })}>
                {h}
              </span>
            ))}
          </div>

          {/* 강사 행 */}
          <div style={{ position: "relative" }}>
            {TEACHERS.map((t, i) => {
              const d = 18 + i * 8;
              const s = sp(frame - d, fps, SMOOTH, 18);
              const o = interpolate(frame - d, [0, 7], [0, 1], clamp);
              const isSel = i === SEL;
              const st = STATUS[t.status];
              const low = t.avg < 80;
              const lineColor = t.delta > 0 ? C.limeDeep : t.delta < 0 ? C.limeInk : C.gray300;
              return (
                <div
                  key={t.name}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "230px 80px 100px 190px 90px 1fr",
                    alignItems: "center",
                    height: ROW_H,
                    padding: "0 14px",
                    borderRadius: 14,
                    background: isSel ? `rgba(234,247,192,${sel})` : "transparent",
                    boxShadow: isSel && sel > 0.1 ? `inset 4px 0 0 ${C.limeDeep}` : undefined,
                    borderBottom: i < TEACHERS.length - 1 ? `1px solid ${C.hairline}` : "none",
                    opacity: o,
                    transform: `translateY(${(1 - s) * 16}px)`,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ width: 34, height: 34, borderRadius: 999, background: isSel && sel > 0.5 ? C.lime : C.ivory2, display: "grid", placeItems: "center", ...tx(14, 800, C.ink), flexShrink: 0 }}>{t.name.slice(0, 1)}</span>
                    <div>
                      <div style={tx(17, 800, C.ink)}>{t.name} 선생님</div>
                      <div style={tx(12, 600, C.gray)}>{t.cls}</div>
                    </div>
                  </div>
                  <span style={tx(16, 600, C.gray, { fontVariantNumeric: "tabular-nums" })}>{t.lessons}회</span>
                  <RollingNumber to={t.avg} delay={d + 4} duration={34} size={26} color={low ? C.limeInk : C.forest} />
                  <Sparkline values={t.trend} delay={d + 6} width={150} height={34} color={lineColor} />
                  <span style={tx(16, 800, lineColor, { fontVariantNumeric: "tabular-nums" })}>{t.delta > 0 ? `▲ ${t.delta}` : t.delta < 0 ? `▼ ${-t.delta}` : "—"}</span>
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <Chip delay={d + 14} size={14} bg={st.bg} color={st.color} style={st.border ? { border: `2px solid ${st.border}`, padding: "3px 11px" } : undefined}>
                      {st.label}
                    </Chip>
                  </div>
                </div>
              );
            })}
            {/* 선택 펄스 링 */}
            {frame >= SELECT_AT && frame < NOTE_AT + 10 && (
              <div style={{ position: "absolute", left: -4, right: -4, top: SEL * ROW_H - 4, height: ROW_H + 8, borderRadius: 18, border: `2px solid ${C.limeDeep}`, opacity: (1 - interpolate(frame, [SELECT_AT, NOTE_AT + 10], [0, 1], clamp)) * 0.8, transform: `scale(${1 + pulse * 0.008})`, pointerEvents: "none" }} />
            )}
          </div>

          {/* 면담 준비 노트 */}
          <div style={{ marginTop: 14 }}>
            <ClipReveal delay={NOTE_AT} radius={20} duration={26}>
              <div style={{ background: C.ivory, border: `1.5px solid ${C.lime}`, borderRadius: 20, padding: "16px 20px 18px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ ...tx(14, 800, C.ink), background: C.lime, borderRadius: 7, padding: "4px 10px" }}>면담 준비 노트</span>
                    <span style={tx(18, 800, C.ink)}>정유진 선생님 · 중1 영어 · 10월</span>
                  </div>
                  <span style={tx(13, 600, C.gray300)}>AI가 수업 데이터로 정리했어요</span>
                </div>

                {[
                  { d: NOTE_AT + 14, tag: "강점 먼저", tagBg: C.forest, tagColor: C.white, area: "수업 전달 90", text: "개념 설명이 명확하고 생활 속 예시가 구체적이에요.", ref: "근거 · 10.28 수업 14:20" },
                  { d: NOTE_AT + 32, tag: "개선점 하나", tagBg: C.lime, tagColor: C.ink, area: "수업 상호작용 71", text: "학생 발화가 22%예요. 뒷줄 학생에게도 발문을 나눠 보세요.", ref: "근거 · 10.30 수업 08:15" },
                ].map((r) => {
                  const rs = sp(frame - r.d, fps, SMOOTH, 18);
                  return (
                    <div key={r.tag} style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 14, opacity: interpolate(frame - r.d, [0, 7], [0, 1], clamp), transform: `translateY(${(1 - rs) * 14}px)` }}>
                      <span style={{ ...tx(13, 800, r.tagColor), background: r.tagBg, borderRadius: 999, padding: "6px 12px", flexShrink: 0, whiteSpace: "nowrap" }}>{r.tag}</span>
                      <span style={{ ...tx(16, 800, C.forest), flexShrink: 0, whiteSpace: "nowrap" }}>{r.area}</span>
                      <span style={{ ...tx(16, 600, C.ink), flex: 1, lineHeight: 1.4, wordBreak: "keep-all" }}>{r.text}</span>
                      <Chip delay={r.d + 8} size={12} bg={C.white} color={C.limeInk} style={{ border: `1.5px solid ${C.lime}` }}>
                        {r.ref}
                      </Chip>
                    </div>
                  );
                })}

                <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                  <Chip delay={NOTE_AT + 52} size={15} bg={C.forest} color={C.white} shadow>
                    1:1 면담 일정 잡기 →
                  </Chip>
                  <Chip delay={NOTE_AT + 58} size={15} bg={C.white} color={C.ink} style={{ border: `1.5px solid ${C.hairline}` }}>
                    ▶ 수업 장면 바로 보기
                  </Chip>
                  <Chip delay={NOTE_AT + 64} size={15} bg={C.white} color={C.gray} style={{ border: `1.5px solid ${C.hairline}` }}>
                    강사에게 리포트 공유
                  </Chip>
                </div>
              </div>
            </ClipReveal>
          </div>
        </UiCard>
      </ClipReveal>
    </TmLayout>
  );
};
