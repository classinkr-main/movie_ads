import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { LimeStage } from "../../components/Backgrounds";
import { Burst, Chars, GhostWord, SketchCircle } from "../../components/Flourish";
import { Rise } from "../../components/Ui";
import { FONT_FAMILY } from "../../lib/fonts";
import { clamp, SMOOTH, sp } from "../../lib/motion";
import { C } from "../../lib/theme";

// 포인트 — 연두 풀블리드 키네틱 타이포: "원장님도, 강사도." 두 사람 모두 얻는다는 선언. 다음 두 씬(02 원장님 · 03 강사)의 예고.
export const PointV: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pillL = sp(frame - 44, fps, SMOOTH, 22);
  const pillR = sp(frame - 50, fps, SMOOTH, 22);
  return (
    <LimeStage>
      <GhostWord text="원장님 · 강사" size={300} speed={1.4} color={C.limeInk} top="68%" opacity={0.12} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: FONT_FAMILY, fontSize: 168, fontWeight: 900, color: C.ink, letterSpacing: "-0.05em", lineHeight: 1.05, whiteSpace: "nowrap", display: "flex", alignItems: "baseline", gap: 44, position: "relative" }}>
          <Chars text="원장님도," delay={2} stagger={2.2} rotate={10} rise={90} />
          <span style={{ position: "relative", display: "inline-block" }}>
            <SketchCircle delay={34} duration={18} color={C.forest} stroke={7}>
              <Chars text="강사도." delay={16} stagger={2.2} rotate={10} rise={90} style={{ color: C.forest }} />
            </SketchCircle>
            <Burst delay={30} size={420} color={C.forest} lines={16} style={{ left: "50%", top: "50%", transform: "translate(-50%,-50%)" }} />
          </span>
        </div>
        <Rise delay={36} distance={22} style={{ marginTop: 34 }}>
          <div style={{ fontFamily: FONT_FAMILY, fontSize: 42, fontWeight: 600, color: C.forest, letterSpacing: "-0.02em" }}>같은 데이터로, 두 사람 모두 얻습니다.</div>
        </Rise>
        {/* 두 사람 라벨 — 좌우에서 밀려 들어온다 */}
        <div style={{ position: "absolute", left: 150, bottom: 110, display: "flex", alignItems: "center", gap: 14, opacity: pillL, transform: `translateX(${(1 - pillL) * -80}px)` }}>
          <span style={{ width: 54, height: 54, borderRadius: 999, background: C.ink, color: C.lime, display: "grid", placeItems: "center", fontFamily: FONT_FAMILY, fontSize: 22, fontWeight: 900 }}>02</span>
          <span style={{ fontFamily: FONT_FAMILY, fontSize: 30, fontWeight: 800, color: C.ink, letterSpacing: "-0.02em" }}>원장님은 편해집니다</span>
        </div>
        <div style={{ position: "absolute", right: 150, bottom: 110, display: "flex", alignItems: "center", gap: 14, opacity: pillR, transform: `translateX(${(1 - pillR) * 80}px)` }}>
          <span style={{ fontFamily: FONT_FAMILY, fontSize: 30, fontWeight: 800, color: C.ink, letterSpacing: "-0.02em" }}>강사는 객관적으로 성장합니다</span>
          <span style={{ width: 54, height: 54, borderRadius: 999, background: C.ink, color: C.lime, display: "grid", placeItems: "center", fontFamily: FONT_FAMILY, fontSize: 22, fontWeight: 900 }}>03</span>
        </div>
        <div style={{ position: "absolute", left: "50%", bottom: 128, transform: "translateX(-50%)", width: 2, height: 24, background: C.forest, opacity: interpolate(frame - 54, [0, 8], [0, 0.5], clamp) }} />
      </AbsoluteFill>
    </LimeStage>
  );
};
