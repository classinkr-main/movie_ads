import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { CardHeader, FeatureLayout, UiCard } from "../components/Feature";
import { ClipReveal, RollingNumber, TypeText } from "../components/Flourish";
import { Chip } from "../components/Ui";
import { FONT_FAMILY } from "../../../../shared/fonts";
import { clamp, PUNCH, SMOOTH, sp } from "../../../../shared/motion";
import { C } from "../theme";

const SWITCH = 84; // 학생 질문 → 교사 상담 탭 전환

const t = (size: number, weight: number, color: string, extra?: React.CSSProperties): React.CSSProperties => ({
  fontFamily: FONT_FAMILY,
  fontSize: size,
  fontWeight: weight,
  color,
  letterSpacing: "-0.01em",
  ...extra,
});

const Bubble: React.FC<{ delay: number; me?: boolean; who?: string; children: React.ReactNode; width?: number }> = ({ delay, me = false, who, children, width }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = sp(frame - delay, fps, PUNCH);
  const o = interpolate(frame - delay, [0, 4], [0, 1], clamp);
  if (frame < delay) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: me ? "flex-end" : "flex-start", opacity: o, transform: `translateY(${(1 - s) * 20}px) scale(${0.88 + s * 0.12})`, transformOrigin: me ? "100% 100%" : "0 100%" }}>
      {who && <span style={{ ...t(12, 700, C.gray300), marginBottom: 4, padding: "0 6px" }}>{who}</span>}
      <div
        style={{
          maxWidth: width ?? 470,
          width,
          background: me ? C.forest : C.ivory,
          color: me ? C.white : C.ink,
          borderRadius: 18,
          borderBottomRightRadius: me ? 6 : 18,
          borderBottomLeftRadius: me ? 18 : 6,
          padding: "12px 16px",
          ...t(17, 600, me ? C.white : C.ink),
          lineHeight: 1.5,
          wordBreak: "keep-all",
        }}
      >
        {children}
      </div>
    </div>
  );
};

const Typing: React.FC<{ from: number; to: number }> = ({ from, to }) => {
  const frame = useCurrentFrame();
  if (frame < from || frame >= to) return null;
  return (
    <div style={{ display: "flex", gap: 6, padding: "12px 16px", background: C.ivory, borderRadius: 18, width: 70 }}>
      {[0, 1, 2].map((i) => (
        <span key={i} style={{ width: 9, height: 9, borderRadius: 999, background: C.limeDeep, opacity: 0.35 + 0.65 * Math.abs(Math.sin(frame / 4 + i)) }} />
      ))}
    </div>
  );
};

const Field: React.FC<{ k: string; v: string; d: number }> = ({ k, v, d }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ marginTop: 12, opacity: interpolate(frame - d, [0, 6], [0, 1], clamp), transform: `translateY(${(1 - sp(frame - d, fps, SMOOTH, 14)) * 12}px)` }}>
      <div style={t(12, 700, C.gray300, { letterSpacing: "0.06em" })}>{k}</div>
      <div style={{ marginTop: 5, ...t(15, 700, C.ink), background: C.ivory, borderRadius: 10, padding: "8px 10px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6 }}>
        <span style={{ whiteSpace: "nowrap", overflow: "hidden" }}>{v}</span>
        <span style={{ color: C.gray300, flexShrink: 0 }}>⌄</span>
      </div>
    </div>
  );
};

const UNITS = [
  { u: "1단원", v: 72 },
  { u: "2단원", v: 78 },
  { u: "3단원", v: 90 },
];

// 05 — AI 에이전트
export const F05Agent: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tab = sp(frame - SWITCH, fps, SMOOTH, 12);
  const t1 = interpolate(frame, [SWITCH - 2, SWITCH + 4], [1, 0], clamp);
  const t2 = interpolate(frame, [SWITCH + 2, SWITCH + 8], [0, 1], clamp);

  return (
    <FeatureLayout
      index={4}
      title={
        <>
          원하는 AI 비서를
          <br />
          직접 세팅하세요
        </>
      }
      sub="역할·말투·근거 자료·모델을 골라 우리 반 전용 비서를 만듭니다. 학생에겐 강의를 근거로 답하고, 교사에겐 성취도와 상담 포인트를 정리해 줍니다."
      bullets={["강의 기반 질의응답", "학생 상태 평가 · 성취도 상담", "모델 선택 가능"]}
    >
      <ClipReveal delay={8} radius={36}>
        <div style={{ display: "flex", gap: 16, alignItems: "stretch" }}>
          {/* 비서 설정 */}
          <UiCard width={290} padding={22} tilt={1}>
            <div style={t(13, 800, C.limeInk, { letterSpacing: "0.14em" })}>AGENT SETUP</div>
            <div style={{ marginTop: 4, ...t(22, 800, C.ink) }}>비서 설정</div>
            <Field k="이름" v="A반 국어 코치" d={14} />
            <Field k="역할" v="중2 국어 학습 코치" d={19} />
            <Field k="말투" v="친근한 존댓말" d={24} />
            <Field k="근거 자료" v="A반 수업 녹화 · 교안 · 과제" d={29} />
            <div style={{ marginTop: 12, opacity: interpolate(frame - 34, [0, 6], [0, 1], clamp) }}>
              <div style={t(12, 700, C.gray300, { letterSpacing: "0.06em" })}>모델</div>
              <div style={{ marginTop: 5, display: "flex", flexDirection: "column", gap: 4 }}>
                {["기본 모델", "경량 모델 · 빠른 응답", "고급 모델 · 깊은 분석"].map((m, i) => {
                  const on = i === 0 ? frame < SWITCH : i === 2 ? frame >= SWITCH : false;
                  return (
                    <div key={m} style={{ display: "flex", alignItems: "center", gap: 8, ...t(14, 700, on ? C.ink : C.gray), background: on ? C.limeSoft : "transparent", borderRadius: 10, padding: "6px 8px" }}>
                      <span style={{ width: 13, height: 13, borderRadius: 999, border: `2px solid ${on ? C.limeDeep : C.hairline}`, background: on ? C.limeDeep : "transparent", flexShrink: 0 }} />
                      {m}
                    </div>
                  );
                })}
              </div>
            </div>
          </UiCard>

          {/* 채팅 */}
          <UiCard width={634} padding={26} tilt={1} style={{ height: 640 }}>
            <CardHeader
              title="A반 국어 코치"
              right={
                <div style={{ position: "relative", display: "flex", background: C.ivory2, borderRadius: 999, padding: 4 }}>
                  <div style={{ position: "absolute", top: 4, bottom: 4, left: 4, width: "calc(50% - 4px)", borderRadius: 999, background: C.lime, transform: `translateX(${tab * 100}%)` }} />
                  {["학생 질문", "교사 상담"].map((s, i) => (
                    <span key={s} style={{ position: "relative", ...t(15, 800, C.ink), padding: "5px 16px", opacity: (i === 0 ? 1 - tab : tab) * 0.6 + 0.4 }}>
                      {s}
                    </span>
                  ))}
                </div>
              }
            />
            <div style={{ position: "relative", marginTop: 16 }}>
              {/* 스레드 1 — 학생 질문 */}
              {t1 > 0 && (
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", gap: 12, opacity: t1 }}>
                  <Bubble delay={14} me who="김지민 학생">
                    <TypeText text="「서시」에서 '바람'은 왜 시련이에요?" delay={16} cps={1.8} caret={false} />
                  </Bubble>
                  <Typing from={30} to={38} />
                  <Bubble delay={38} who="A반 국어 코치" width={500}>
                    수업 21:05에서 선생님이 설명하셨어요. <b>'잎새에 이는 바람에도 나는 괴로워했다'</b>는 작은 흔들림에도 괴로워하는 화자의 마음, 곧 <span style={{ background: C.lime, borderRadius: 4, padding: "0 4px" }}>시련과 갈등</span>을 뜻해요.
                  </Bubble>
                  <div style={{ display: "flex", gap: 8, paddingLeft: 4 }}>
                    <Chip delay={52} size={14} bg={C.limeSoft} color={C.limeInk}>강의 근거 · 21:05</Chip>
                    <Chip delay={56} size={14} bg={C.forest} color={C.white}>▶ 그 장면 다시보기</Chip>
                    <Chip delay={60} size={14} bg={C.ivory2} color={C.gray}>교안 p.84</Chip>
                  </div>
                </div>
              )}

              {/* 스레드 2 — 교사 상담 */}
              {frame >= SWITCH && (
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", gap: 12, opacity: t2 }}>
                  <Bubble delay={SWITCH + 4} me who="이서윤 선생님">
                    <TypeText text="김지민 학생 3단원 성취도랑 상담 포인트 정리해 줘" delay={SWITCH + 6} cps={2} caret={false} />
                  </Bubble>
                  <Typing from={SWITCH + 22} to={SWITCH + 30} />
                  <Bubble delay={SWITCH + 30} who="A반 국어 코치" width={540}>
                    <div style={{ display: "flex", alignItems: "flex-end", gap: 18 }}>
                      <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 92 }}>
                        {UNITS.map((u, i) => {
                          const h = sp(frame - (SWITCH + 32 + i * 4), fps, SMOOTH, 16) * u.v;
                          const last = i === UNITS.length - 1;
                          return (
                            <div key={u.u} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, height: "100%", justifyContent: "flex-end" }}>
                              <span style={t(12, 800, last ? C.forest : C.gray)}>{Math.round(h)}</span>
                              <div style={{ width: 34, height: `${h * 0.62}%`, borderRadius: 6, background: last ? C.limeDeep : C.lime }} />
                              <span style={t(11, 700, C.gray)}>{u.u}</span>
                            </div>
                          );
                        })}
                      </div>
                      <div style={{ paddingBottom: 18 }}>
                        <div style={t(12, 800, C.gray, { letterSpacing: "0.04em" })}>단원 성취도</div>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                          <span style={t(30, 900, C.forest)}>↑</span>
                          <RollingNumber to={12} delay={SWITCH + 40} duration={20} size={34} color={C.forest} />
                          <span style={t(18, 800, C.forest)}>점</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 5 }}>
                      {[
                        { d: SWITCH + 46, m: "✓", s: "상징 해석 우수 — 형성평가 90점", c: C.limeInk },
                        { d: SWITCH + 51, m: "△", s: "서술형에서 시구 근거 제시 보완 필요", c: C.limeInk },
                        { d: SWITCH + 56, m: "·", s: "수업 참여 — 발언 3회 · 질문 1회", c: C.gray },
                      ].map((r) => (
                        <div key={r.s} style={{ display: "flex", gap: 8, ...t(16, 600, C.ink), opacity: interpolate(frame - r.d, [0, 5], [0, 1], clamp) }}>
                          <span style={{ color: r.c, fontWeight: 900, width: 16 }}>{r.m}</span>
                          {r.s}
                        </div>
                      ))}
                    </div>
                  </Bubble>
                  <div style={{ display: "flex", gap: 8, paddingLeft: 4, flexWrap: "wrap" }}>
                    <Chip delay={SWITCH + 62} size={14} bg={C.limeSoft} color={C.limeInk}>과제 제출률 92%</Chip>
                    <Chip delay={SWITCH + 66} size={14} bg={C.limeSoft} color={C.limeInk}>상담 포인트 2</Chip>
                    <Chip delay={SWITCH + 70} size={14} bg={C.lime} color={C.ink}>학부모 상담 초안 작성</Chip>
                  </div>
                </div>
              )}
            </div>
          </UiCard>
        </div>
      </ClipReveal>
    </FeatureLayout>
  );
};
