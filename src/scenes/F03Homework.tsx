import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { CardHeader, FeatureLayout, Stamp, UiCard } from "../components/Feature";
import { Burst, ClipReveal, RollingNumber, SkeletonLine } from "../components/Flourish";
import { Chip, Pop } from "../components/Ui";
import { FONT_FAMILY } from "../lib/fonts";
import { clamp, SMOOTH, sp } from "../lib/motion";
import { C } from "../lib/theme";

const QS = [
  { w: 86, ok: true },
  { w: 72, ok: true },
  { w: 90, ok: false },
  { w: 64, ok: true },
  { w: 80, ok: true },
];
const GRADE_AT = 50;

// 03 — AI 숙제 출제 · 채점
export const F03Homework: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const grading = frame >= GRADE_AT;
  const toggle = sp(frame - GRADE_AT, fps, SMOOTH, 14);

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
      sub="오늘 수업 범위에서 AI가 문제를 만들고, 학생이 제출하면 바로 채점과 피드백이 돌아옵니다. 교사는 개별 지도에 집중합니다."
      bullets={["수업 기반 자동 출제", "즉시 채점 · 피드백", "제출 현황 추적"]}
    >
      <ClipReveal delay={8} radius={36}>
        <UiCard width={860}>
          <CardHeader
            title="AI 숙제"
            right={
              <div style={{ position: "relative", display: "flex", background: C.ivory2, borderRadius: 999, padding: 4 }}>
                <div style={{ position: "absolute", top: 4, bottom: 4, left: 4, width: "calc(50% - 4px)", borderRadius: 999, background: C.lime, transform: `translateX(${toggle * 100}%)` }} />
                {["출제", "채점"].map((t, i) => (
                  <span key={t} style={{ position: "relative", fontFamily: FONT_FAMILY, fontSize: 18, fontWeight: 800, color: C.ink, padding: "6px 22px", opacity: (i === 0 ? 1 - toggle : toggle) * 0.6 + 0.4 }}>
                    {t}
                  </span>
                ))}
              </div>
            }
          />
          <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 14 }}>
            {QS.map((q, i) => {
              const d = 18 + i * 7;
              const o = interpolate(frame - d, [0, 5], [0, 1], clamp);
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 18, opacity: o, padding: "12px 16px", borderRadius: 16, background: grading && !q.ok ? "rgba(28,27,23,0.04)" : "transparent" }}>
                  <span style={{ fontFamily: FONT_FAMILY, fontSize: 18, fontWeight: 800, color: C.limeInk, width: 36 }}>Q{i + 1}</span>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                    <SkeletonLine width={q.w} delay={d + 2} height={12} />
                    <div style={{ display: "flex", gap: 8 }}>
                      {[18, 14, 22].map((w, k) => (
                        <SkeletonLine key={k} width={w} delay={d + 6 + k * 2} height={10} color="#EDE9DE" />
                      ))}
                    </div>
                  </div>
                  <div style={{ width: 40, display: "grid", placeItems: "center" }}>{grading && <Stamp delay={GRADE_AT + 6 + i * 4} ok={q.ok} />}</div>
                </div>
              );
            })}
          </div>

          {/* 점수 배지 */}
          <div style={{ position: "absolute", right: -50, top: -46 }}>
            <Pop delay={GRADE_AT + 28} from={0.2} rotate={-14}>
              <div style={{ position: "relative", background: C.forest, color: C.white, borderRadius: 24, padding: "16px 24px", boxShadow: "0 30px 70px rgba(8,71,52,0.3)", display: "flex", alignItems: "baseline", gap: 8 }}>
                <RollingNumber to={80} delay={GRADE_AT + 30} duration={24} size={54} color={C.lime} />
                <span style={{ fontFamily: FONT_FAMILY, fontSize: 22, fontWeight: 700 }}>점</span>
                <span style={{ fontFamily: FONT_FAMILY, fontSize: 16, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginLeft: 6 }}>4 / 5</span>
              </div>
            </Pop>
            <Burst delay={GRADE_AT + 30} size={360} color={C.limeDeep} style={{ left: "50%", top: "50%", transform: "translate(-50%,-50%)" }} />
          </div>

          <div style={{ marginTop: 18, display: "flex", gap: 8 }}>
            <Chip delay={GRADE_AT + 36} size={16}>피드백 전송됨</Chip>
            <Chip delay={GRADE_AT + 40} size={16}>제출 24 / 28</Chip>
          </div>
        </UiCard>
      </ClipReveal>
    </FeatureLayout>
  );
};
