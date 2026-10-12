import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { CardHeader, FeatureLayout, UiCard } from "../components/Feature";
import { ClipReveal, SkeletonLine } from "../components/Flourish";
import { Chip, Pop } from "../components/Ui";
import { FONT_FAMILY } from "../lib/fonts";
import { clamp, SMOOTH, sp } from "../lib/motion";
import { C } from "../lib/theme";

const LINES = [
  { t: "00:12", w: [92, 70] },
  { t: "03:48", w: [84, 55] },
  { t: "11:20", w: [96, 40], key: true },
  { t: "24:05", w: [78, 66] },
  { t: "38:51", w: [88, 30] },
  { t: "52:17", w: [74, 58] },
];

// 02 — AI 스크립트 · 강의 요약
export const F02Script: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sumS = sp(frame - 64, fps, SMOOTH, 24);

  return (
    <FeatureLayout
      index={1}
      side="left"
      variant="ivory2"
      title={
        <>
          60분 수업이
          <br />
          한 장의 요약으로
        </>
      }
      sub="수업 음성을 타임스탬프가 붙은 스크립트로 옮기고, AI가 핵심만 요약합니다. 다시 듣지 않아도 흐름이 보입니다."
      bullets={["타임스탬프 스크립트", "핵심 개념 요약", "복습·보강 자료"]}
    >
      <ClipReveal delay={8} radius={36} from="right">
        <UiCard width={860} style={{ minHeight: 560 }}>
          <CardHeader
            title="수업 스크립트"
            right={<span style={{ fontFamily: FONT_FAMILY, fontSize: 18, fontWeight: 600, color: C.gray300, fontVariantNumeric: "tabular-nums" }}>60:00 · 자동 생성</span>}
          />
          <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 16 }}>
            {LINES.map((l, i) => {
              const d = 18 + i * 7;
              const o = interpolate(frame - d, [0, 5], [0, 1], clamp);
              return (
                <div key={l.t} style={{ display: "flex", gap: 18, alignItems: "flex-start", opacity: o, background: l.key ? C.limeSoft : "transparent", borderRadius: 14, padding: l.key ? "10px 14px" : "0 14px", marginLeft: -14, marginRight: -14 }}>
                  <span style={{ fontFamily: FONT_FAMILY, fontSize: 17, fontWeight: 700, color: l.key ? C.limeInk : C.gray300, fontVariantNumeric: "tabular-nums", width: 56, flexShrink: 0, paddingTop: 2 }}>{l.t}</span>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                    <SkeletonLine width={l.w[0]} delay={d + 2} height={12} color={l.key ? C.limeDeep : C.ivory2} />
                    <SkeletonLine width={l.w[1]} delay={d + 6} height={12} color={l.key ? "rgba(139,201,38,0.6)" : C.ivory2} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* 요약 패널 */}
          <div style={{ position: "absolute", left: -20, bottom: -70, width: 420, transform: `translateY(${(1 - sumS) * 120}px) rotate(${(1 - sumS) * -8 + 3}deg)`, opacity: sumS }}>
            <div style={{ background: C.forest, color: C.white, borderRadius: 28, padding: 28, boxShadow: "0 40px 90px rgba(8,71,52,0.3)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontFamily: FONT_FAMILY, fontSize: 22, fontWeight: 800, letterSpacing: "-0.01em" }}>AI 강의 요약</span>
                <span style={{ fontFamily: FONT_FAMILY, fontSize: 14, fontWeight: 700, color: C.lime, letterSpacing: "0.12em" }}>SUMMARY</span>
              </div>
              <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 12 }}>
                {[88, 72, 60].map((w, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 999, background: C.lime, flexShrink: 0 }} />
                    <SkeletonLine width={w} delay={72 + i * 6} height={10} color="rgba(255,255,255,0.55)" />
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 20, display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Chip delay={92} size={16} bg={C.lime} color={C.ink}>핵심 개념 3</Chip>
                <Chip delay={96} size={16} bg="rgba(255,255,255,0.14)" color={C.white}>과제 1</Chip>
                <Chip delay={100} size={16} bg="rgba(255,255,255,0.14)" color={C.white}>질문 7회</Chip>
              </div>
            </div>
          </div>
        </UiCard>
      </ClipReveal>
    </FeatureLayout>
  );
};
