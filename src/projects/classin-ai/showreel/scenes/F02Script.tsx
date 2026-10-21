import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { CardHeader, FeatureLayout, UiCard } from "../components/Feature";
import { ClipReveal, TypeText } from "../components/Flourish";
import { Chip } from "../components/Ui";
import { FONT_FAMILY } from "../../../../shared/fonts";
import { clamp, SMOOTH, sp } from "../../../../shared/motion";
import { C } from "../theme";

// 예시 수업 스크립트 (윤동주 「서시」는 공유 저작물)
const LINES = [
  { t: "00:42", who: "교사", text: "오늘은 윤동주의 「서시」로 비유와 상징을 공부해 볼게요." },
  { t: "05:18", who: "교사", text: "'하늘', '바람', '별'은 각각 무엇을 상징할까요?" },
  { t: "05:31", who: "김지민", text: "별은… 희망이나 이상 같아요.", student: true },
  { t: "12:40", who: "교사", text: "상징은 구체적인 사물로 추상적인 의미를 나타내는 표현이에요.", key: true },
  { t: "21:05", who: "박도윤", text: "그럼 '잎새에 이는 바람'은 시련인가요?", student: true },
  { t: "38:52", who: "교사", text: "다음 시간까지 상징이 쓰인 시를 한 편 찾아오세요." },
];
const SYMBOLS = [
  { w: "하늘", m: "양심 · 삶의 기준" },
  { w: "바람", m: "시련 · 갈등" },
  { w: "별", m: "이상 · 희망" },
];
const SUM_AT = 70;

const t = (size: number, weight: number, color: string, extra?: React.CSSProperties): React.CSSProperties => ({
  fontFamily: FONT_FAMILY,
  fontSize: size,
  fontWeight: weight,
  color,
  letterSpacing: "-0.01em",
  ...extra,
});

const Appear: React.FC<{ d: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ d, children, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = sp(frame - d, fps, SMOOTH, 14);
  return <div style={{ opacity: interpolate(frame - d, [0, 5], [0, 1], clamp), transform: `translateY(${(1 - s) * 14}px)`, ...style }}>{children}</div>;
};

// 02 — AI 스크립트 · 강의 요약
export const F02Script: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sumS = sp(frame - SUM_AT, fps, { damping: 16, stiffness: 160, mass: 0.9 });

  return (
    <FeatureLayout
      index={1}
      side="left"
      variant="ivory2"
      title={
        <>
          45분 수업이
          <br />
          한 장의 요약으로
        </>
      }
      sub="말한 사람까지 구분한 타임스탬프 스크립트에, 핵심 개념과 과제를 정리한 요약이 자동으로 붙습니다."
      bullets={["화자 구분 스크립트", "핵심 개념 요약", "복습·보강 자료"]}
    >
      <ClipReveal delay={8} radius={36} from="right">
        <UiCard width={940} padding={28}>
          <CardHeader title="수업 스크립트" right={<span style={{ ...t(16, 600, C.gray300), fontVariantNumeric: "tabular-nums" }}>45:00 · 자동 생성 · 화자 구분</span>} />
          <div style={{ display: "flex", gap: 18, marginTop: 18, alignItems: "stretch" }}>
            {/* 스크립트 */}
            <div style={{ width: 536, display: "flex", flexDirection: "column", gap: 10 }}>
              {LINES.map((l, i) => {
                const d = 14 + i * 9;
                const o = interpolate(frame - d, [0, 4], [0, 1], clamp);
                const keyOn = l.key && frame >= d + 14;
                return (
                  <div
                    key={l.t}
                    style={{
                      display: "flex",
                      gap: 10,
                      alignItems: "flex-start",
                      opacity: o,
                      background: keyOn ? C.limeSoft : "transparent",
                      borderRadius: 14,
                      padding: "8px 10px",
                      border: keyOn ? `1.5px solid ${C.lime}` : "1.5px solid transparent",
                    }}
                  >
                    <span style={{ ...t(14, 700, l.key ? C.limeInk : C.gray300), fontVariantNumeric: "tabular-nums", width: 44, flexShrink: 0, paddingTop: 3 }}>{l.t}</span>
                    <span
                      style={{
                        ...t(13, 800, l.student ? C.limeInk : C.ink),
                        background: l.student ? C.limeSoft : C.ivory2,
                        borderRadius: 6,
                        padding: "3px 8px",
                        flexShrink: 0,
                        marginTop: 1,
                        minWidth: 46,
                        textAlign: "center",
                      }}
                    >
                      {l.who}
                    </span>
                    <span style={{ ...t(18, l.key ? 700 : 500, C.ink), lineHeight: 1.45, wordBreak: "keep-all", flex: 1 }}>
                      <TypeText text={l.text} delay={d + 2} cps={2.4} caret={false} />
                    </span>
                    {l.key && (
                      <span style={{ ...t(12, 800, C.ink), background: C.lime, borderRadius: 6, padding: "3px 7px", flexShrink: 0, opacity: keyOn ? 1 : 0, marginTop: 2 }}>핵심</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* AI 요약 */}
            <div
              style={{
                flex: 1,
                background: C.forest,
                borderRadius: 24,
                padding: 22,
                color: C.white,
                opacity: interpolate(frame - SUM_AT, [0, 4], [0, 1], clamp),
                transform: `translateX(${(1 - sumS) * 60}px) scale(${0.92 + sumS * 0.08})`,
                transformOrigin: "100% 50%",
                boxShadow: "0 30px 70px rgba(8,71,52,0.25)",
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={t(20, 800, C.white)}>AI 강의 요약</span>
                <span style={{ ...t(12, 800, C.lime), letterSpacing: "0.14em" }}>SUMMARY</span>
              </div>
              <Appear d={SUM_AT + 8}>
                <div style={t(12, 800, C.lime, { letterSpacing: "0.08em" })}>핵심 개념</div>
                <div style={{ ...t(17, 700, C.white), marginTop: 4 }}>비유(직유·은유)와 상징의 차이</div>
              </Appear>
              <Appear d={SUM_AT + 14}>
                <div style={t(12, 800, C.lime, { letterSpacing: "0.08em" })}>「서시」 속 상징</div>
                <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 6 }}>
                  {SYMBOLS.map((s, i) => (
                    <Appear key={s.w} d={SUM_AT + 18 + i * 5} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ ...t(15, 800, C.ink), background: C.lime, borderRadius: 999, padding: "2px 10px", minWidth: 34, textAlign: "center" }}>{s.w}</span>
                      <span style={t(15, 700, "rgba(255,255,255,0.6)")}>→</span>
                      <span style={t(16, 600, C.white)}>{s.m}</span>
                    </Appear>
                  ))}
                </div>
              </Appear>
              <Appear d={SUM_AT + 34}>
                <div style={t(12, 800, C.lime, { letterSpacing: "0.08em" })}>과제</div>
                <div style={{ ...t(16, 600, C.white), marginTop: 4 }}>상징이 쓰인 시 1편 찾아오기</div>
              </Appear>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: "auto" }}>
                <Chip delay={SUM_AT + 40} size={14} bg={C.lime} color={C.ink}>핵심 개념 3</Chip>
                <Chip delay={SUM_AT + 44} size={14} bg="rgba(255,255,255,0.14)" color={C.white}>학생 질문 7</Chip>
                <Chip delay={SUM_AT + 48} size={14} bg="rgba(255,255,255,0.14)" color={C.white}>과제 1</Chip>
              </div>
            </div>
          </div>
        </UiCard>
      </ClipReveal>
    </FeatureLayout>
  );
};
