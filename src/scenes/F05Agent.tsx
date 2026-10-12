import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { CardHeader, FeatureLayout, UiCard } from "../components/Feature";
import { ClipReveal, SkeletonLine, TypeText } from "../components/Flourish";
import { Chip, Pop } from "../components/Ui";
import { FONT_FAMILY } from "../lib/fonts";
import { clamp, PUNCH, SMOOTH, sp } from "../lib/motion";
import { C } from "../lib/theme";

const Bubble: React.FC<{ delay: number; me?: boolean; children: React.ReactNode }> = ({ delay, me = false, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = sp(frame - delay, fps, PUNCH);
  const o = interpolate(frame - delay, [0, 4], [0, 1], clamp);
  return (
    <div style={{ display: "flex", justifyContent: me ? "flex-end" : "flex-start", opacity: o, transform: `translateY(${(1 - s) * 24}px) scale(${0.85 + s * 0.15})`, transformOrigin: me ? "100% 100%" : "0 100%" }}>
      <div
        style={{
          maxWidth: "82%",
          background: me ? C.forest : C.ivory,
          color: me ? C.white : C.ink,
          borderRadius: 20,
          borderBottomRightRadius: me ? 6 : 20,
          borderBottomLeftRadius: me ? 20 : 6,
          padding: "14px 18px",
          fontFamily: FONT_FAMILY,
          fontSize: 20,
          fontWeight: 600,
          lineHeight: 1.4,
          letterSpacing: "-0.01em",
        }}
      >
        {children}
      </div>
    </div>
  );
};

const Typing: React.FC<{ from: number; to: number }> = ({ from, to }) => {
  const frame = useCurrentFrame();
  if (frame < from || frame > to) return null;
  return (
    <div style={{ display: "flex", gap: 6, padding: "12px 16px", background: C.ivory, borderRadius: 20, width: 70 }}>
      {[0, 1, 2].map((i) => (
        <span key={i} style={{ width: 9, height: 9, borderRadius: 999, background: C.limeDeep, opacity: 0.35 + 0.65 * Math.abs(Math.sin(frame / 4 + i)) }} />
      ))}
    </div>
  );
};

// 05 — AI 에이전트
export const F05Agent: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const chart = [42, 58, 51, 70, 76, 88];

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
      sub="역할·말투·모델을 골라 우리 학원만의 에이전트를 만듭니다. 강의 내용을 근거로 답하고, 학생 상태를 평가해 성취도 상담까지 돕습니다."
      bullets={["강의 기반 질의응답", "학생 상태 평가 · 성취도 상담", "모델 선택 가능"]}
    >
      <ClipReveal delay={8} radius={36}>
        <div style={{ display: "flex", gap: 18, alignItems: "stretch" }}>
          {/* 비서 설정 패널 */}
          <UiCard width={300} padding={24} tilt={1}>
            <div style={{ fontFamily: FONT_FAMILY, fontSize: 15, fontWeight: 800, color: C.limeInk, letterSpacing: "0.14em" }}>AGENT SETUP</div>
            <div style={{ marginTop: 6, fontFamily: FONT_FAMILY, fontSize: 24, fontWeight: 800, color: C.ink, letterSpacing: "-0.02em" }}>비서 설정</div>
            {[
              { k: "역할", v: "학습 코치", d: 20 },
              { k: "말투", v: "친근하게", d: 26 },
              { k: "근거", v: "우리 강의 녹화·자료", d: 32 },
            ].map((row) => (
              <div key={row.k} style={{ marginTop: 16, opacity: interpolate(frame - row.d, [0, 6], [0, 1], clamp), transform: `translateY(${(1 - sp(frame - row.d, fps, SMOOTH, 14)) * 14}px)` }}>
                <div style={{ fontFamily: FONT_FAMILY, fontSize: 14, fontWeight: 700, color: C.gray300, letterSpacing: "0.06em" }}>{row.k}</div>
                <div style={{ marginTop: 6, fontFamily: FONT_FAMILY, fontSize: 18, fontWeight: 700, color: C.ink, background: C.ivory, borderRadius: 12, padding: "10px 12px", display: "flex", justifyContent: "space-between" }}>
                  {row.v}
                  <span style={{ color: C.gray300 }}>⌄</span>
                </div>
              </div>
            ))}
            <div style={{ marginTop: 16, opacity: interpolate(frame - 38, [0, 6], [0, 1], clamp) }}>
              <div style={{ fontFamily: FONT_FAMILY, fontSize: 14, fontWeight: 700, color: C.gray300, letterSpacing: "0.06em" }}>모델</div>
              <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 6 }}>
                {["기본 모델", "경량 모델", "고급 모델"].map((m, i) => {
                  const on = i === 0 ? frame < 56 : i === 2 ? frame >= 56 : false;
                  return (
                    <div key={m} style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: FONT_FAMILY, fontSize: 17, fontWeight: 700, color: on ? C.ink : C.gray, background: on ? C.limeSoft : "transparent", borderRadius: 10, padding: "8px 10px" }}>
                      <span style={{ width: 14, height: 14, borderRadius: 999, border: `2px solid ${on ? C.limeDeep : C.hairline}`, background: on ? C.limeDeep : "transparent" }} />
                      {m}
                    </div>
                  );
                })}
              </div>
            </div>
          </UiCard>

          {/* 채팅 패널 */}
          <UiCard width={550} padding={28} tilt={1}>
            <CardHeader
              title="우리 학원 AI 비서"
              right={
                <Chip delay={14} size={15} bg={C.lime} color={C.ink}>
                  ● 온라인
                </Chip>
              }
            />
            <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 12, minHeight: 400 }}>
              <Bubble delay={16} me>
                <TypeText text="지난 수업에서 다룬 핵심 개념 정리해 줘" delay={18} cps={1.8} caret={false} />
              </Bubble>
              <Typing from={32} to={42} />
              {frame >= 42 && (
                <Bubble delay={42}>
                  <div style={{ fontFamily: FONT_FAMILY, fontSize: 14, fontWeight: 800, color: C.limeInk, letterSpacing: "0.1em", marginBottom: 8 }}>강의 근거 · 11:20 / 24:05</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, width: 360 }}>
                    <SkeletonLine width={90} delay={44} height={11} color={C.limeDeep} />
                    <SkeletonLine width={70} delay={48} height={11} color="#DDD8CB" />
                    <SkeletonLine width={80} delay={52} height={11} color="#DDD8CB" />
                  </div>
                </Bubble>
              )}
              <Bubble delay={60} me>
                <TypeText text="민수 학생 최근 성취도는 어때?" delay={62} cps={1.8} caret={false} />
              </Bubble>
              <Typing from={74} to={82} />
              {frame >= 82 && (
                <Bubble delay={82}>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 70 }}>
                    {chart.map((v, i) => {
                      const h = sp(frame - 84 - i * 3, fps, SMOOTH, 16) * v;
                      return <div key={i} style={{ width: 22, height: `${h}%`, borderRadius: 6, background: i === chart.length - 1 ? C.limeDeep : C.lime }} />;
                    })}
                    <div style={{ marginLeft: 12, fontFamily: FONT_FAMILY, fontSize: 30, fontWeight: 900, color: C.forest, letterSpacing: "-0.04em" }}>↑ 상승</div>
                  </div>
                  <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <Chip delay={100} size={14}>상담 포인트 2</Chip>
                    <Chip delay={104} size={14}>제출률 92%</Chip>
                    <Chip delay={108} size={14} bg={C.lime} color={C.ink}>학부모 리포트 초안</Chip>
                  </div>
                </Bubble>
              )}
            </div>
          </UiCard>
        </div>
      </ClipReveal>
    </FeatureLayout>
  );
};
