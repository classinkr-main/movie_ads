import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { CardHeader, FeatureLayout, Stamp, UiCard } from "../components/Feature";
import type { StampKind } from "../components/Feature";
import { Burst, ClipReveal, RollingNumber, TypeText } from "../../../shared/brand/Flourish";
import { Chip, Pop } from "../../../shared/brand/Ui";
import { FONT_FAMILY } from "../../../shared/fonts";
import { clamp, SMOOTH, sp } from "../../../shared/motion";
import { C } from "../theme";

const QS: Array<{ type: "객관식" | "서술형"; q: string; a: string; kind: StampKind }> = [
  { type: "객관식", q: "「서시」에서 '별'이 상징하는 것으로 알맞은 것은?", a: "② 이상과 희망", kind: "ok" },
  { type: "객관식", q: "다음 중 은유법이 쓰인 문장을 고르시오.", a: "③ 선생님의 목소리는 봄바람이다.", kind: "ok" },
  { type: "서술형", q: "'잎새에 이는 바람'이 상징하는 의미와 근거를 쓰시오.", a: "바람은 화자가 겪는 시련을 의미한다.", kind: "partial" },
  { type: "객관식", q: "비유와 상징의 차이를 바르게 설명한 것은?", a: "④ 상징은 원관념이 드러나지 않는다.", kind: "ok" },
  { type: "서술형", q: "직유법과 은유법의 차이를 예를 들어 쓰시오.", a: "직유는 '~처럼'으로, 은유는 'A는 B다'로 빗댄다.", kind: "ok" },
];
const GRADE_AT = 66;

const t = (size: number, weight: number, color: string, extra?: React.CSSProperties): React.CSSProperties => ({
  fontFamily: FONT_FAMILY,
  fontSize: size,
  fontWeight: weight,
  color,
  letterSpacing: "-0.01em",
  ...extra,
});

// 03 — AI 숙제 출제 · 채점
export const F03Homework: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const grading = frame >= GRADE_AT;
  const toggle = sp(frame - GRADE_AT, fps, SMOOTH, 14);
  const fb = sp(frame - (GRADE_AT + 32), fps, SMOOTH, 18);

  return (
    <FeatureLayout
      index={2}
      title={
        <>
          수업으로 출제하고,
          <br />
          제출 즉시 채점
        </>
      }
      sub="오늘 수업 스크립트를 근거로 문제를 만들고, 서술형까지 채점해 문항별 피드백을 돌려줍니다."
      bullets={["수업 기반 자동 출제", "서술형 채점 · 피드백", "제출 현황 추적"]}
    >
      <ClipReveal delay={8} radius={36}>
        <UiCard width={940} padding={30}>
          <CardHeader
            title="AI 숙제 · 3단원 형성평가"
            right={
              <div style={{ position: "relative", display: "flex", background: C.ivory2, borderRadius: 999, padding: 4 }}>
                <div style={{ position: "absolute", top: 4, bottom: 4, left: 4, width: "calc(50% - 4px)", borderRadius: 999, background: C.lime, transform: `translateX(${toggle * 100}%)` }} />
                {["출제", "채점"].map((s, i) => (
                  <span key={s} style={{ position: "relative", ...t(17, 800, C.ink), padding: "5px 20px", opacity: (i === 0 ? 1 - toggle : toggle) * 0.6 + 0.4 }}>
                    {s}
                  </span>
                ))}
              </div>
            }
          />

          {/* 출제 조건 */}
          <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
            <Chip delay={12} size={15}>범위 · 3단원 비유와 상징</Chip>
            <Chip delay={16} size={15}>근거 · 오늘 수업 스크립트</Chip>
            <Chip delay={20} size={15}>객관식 3 · 서술형 2</Chip>
            <Chip delay={24} size={15}>난이도 중</Chip>
            {grading && (
              <Chip delay={GRADE_AT + 2} size={15} bg={C.forest} color={C.white}>
                김지민 · 2학년 A반 제출
              </Chip>
            )}
          </div>

          {/* 문항 */}
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 4 }}>
            {QS.map((q, i) => {
              const d = 20 + i * 7;
              const o = interpolate(frame - d, [0, 4], [0, 1], clamp);
              const ansH = sp(frame - (GRADE_AT + 4 + i * 4), fps, SMOOTH, 12) * 24;
              const partial = grading && q.kind === "partial";
              return (
                <div key={i} style={{ opacity: o, padding: "8px 12px", borderRadius: 14, background: partial ? C.limeSoft : "transparent" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ ...t(15, 800, C.limeInk), width: 26 }}>Q{i + 1}</span>
                    <span style={{ ...t(12, 800, q.type === "서술형" ? C.limeInk : C.gray), background: q.type === "서술형" ? C.limeSoft : C.ivory2, border: q.type === "서술형" ? `1.5px solid ${C.lime}` : "1.5px solid transparent", borderRadius: 6, padding: "2px 8px", flexShrink: 0 }}>{q.type}</span>
                    <span style={{ ...t(18, 600, C.ink), flex: 1, whiteSpace: "nowrap", overflow: "hidden" }}>
                      <TypeText text={q.q} delay={d + 2} cps={3} caret={false} />
                    </span>
                    <div style={{ width: 34, display: "grid", placeItems: "center", flexShrink: 0 }}>{grading && <Stamp delay={GRADE_AT + 8 + i * 4} kind={q.kind} size={30} />}</div>
                  </div>
                  <div style={{ height: ansH, overflow: "hidden", paddingLeft: 38, display: "flex", alignItems: "flex-end" }}>
                    <span style={t(15, 600, C.gray)}>
                      <span style={{ color: C.limeInk, fontWeight: 800 }}>지민 답 </span>
                      {q.a}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Q3 피드백 */}
          <div style={{ marginTop: 10, minHeight: 84 }}>
            <div style={{ opacity: fb, transform: `translateY(${(1 - fb) * 16}px)`, background: C.white, border: `1.5px solid ${C.lime}`, borderRadius: 18, padding: "12px 16px", display: "flex", gap: 14, alignItems: "flex-start" }}>
              <span style={{ ...t(13, 800, C.ink), background: C.lime, borderRadius: 6, padding: "3px 8px", flexShrink: 0, marginTop: 2 }}>AI 피드백 · Q3</span>
              <span style={{ ...t(16, 600, C.ink), lineHeight: 1.5, wordBreak: "keep-all" }}>
                '시련'이라는 해석은 정확해요. '잎새에 이는 바람에도 나는 괴로워했다'는 시구를 근거로 덧붙이면 만점이에요.
              </span>
            </div>
          </div>

          {/* 점수 배지 */}
          <div style={{ position: "absolute", right: 24, bottom: -46 }}>
            <Pop delay={GRADE_AT + 40} from={0.2} rotate={-14}>
              <div style={{ background: C.forest, color: C.white, borderRadius: 24, padding: "14px 22px", boxShadow: "0 30px 70px rgba(8,71,52,0.3)" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                  <RollingNumber to={90} delay={GRADE_AT + 42} duration={24} size={52} color={C.lime} />
                  <span style={t(20, 800, C.white)}>점</span>
                </div>
                <div style={{ ...t(13, 600, "rgba(255,255,255,0.75)"), marginTop: 2 }}>4.5 / 5 · 서술형 부분 점수</div>
              </div>
            </Pop>
            <Burst delay={GRADE_AT + 42} size={360} color={C.limeDeep} style={{ left: "50%", top: "50%", transform: "translate(-50%,-50%)" }} />
          </div>

          <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
            <Chip delay={GRADE_AT + 48} size={15}>피드백 전송됨</Chip>
            <Chip delay={GRADE_AT + 52} size={15}>제출 24 / 28명</Chip>
            <Chip delay={GRADE_AT + 56} size={15}>반 평균 82점</Chip>
            <Chip delay={GRADE_AT + 60} size={15} bg={C.lime} color={C.ink}>오답 많은 문항 · Q3</Chip>
          </div>
        </UiCard>
      </ClipReveal>
    </FeatureLayout>
  );
};
