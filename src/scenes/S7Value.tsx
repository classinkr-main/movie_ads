import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { BrandStage } from "../components/Backgrounds";
import { DrawLine, WordPop } from "../components/Kinetic";
import { Eyebrow, LogoMark, Rise } from "../components/Ui";
import { FONT_FAMILY } from "../lib/fonts";
import { useLayout } from "../lib/layout";
import { C } from "../lib/theme";

// S7 — 밸류 라인 (브랜드 포지셔닝 헤드라인 SSOT: lib/classin-positioning.ts heroHeadline)
export const S7Value: React.FC = () => {
  const frame = useCurrentFrame();
  const { u, isPortrait } = useLayout();
  const size = (isPortrait ? 92 : 124) * u;

  return (
    <BrandStage>
      {/* 워터마크 마크 — 천천히 회전 */}
      <div style={{ position: "absolute", right: -120 * u, bottom: -80 * u, opacity: 0.14, transform: `rotate(${frame * 0.25}deg)` }}>
        <LogoMark height={(isPortrait ? 420 : 560) * u} />
      </div>

      <div style={{ position: "absolute", top: 80 * u, left: 120 * u }}>
        <Rise delay={0} distance={20}>
          <Eyebrow size={24 * u} color="rgba(255,255,255,0.8)">
            Classin · 수업 시스템 OS
          </Eyebrow>
        </Rise>
      </div>

      <AbsoluteFill style={{ justifyContent: "center", padding: `0 ${120 * u}px` }}>
        <div style={{ fontFamily: FONT_FAMILY, fontSize: size, fontWeight: 900, color: C.page, letterSpacing: "-0.045em", lineHeight: 1.15, display: "flex", flexDirection: "column", gap: 8 * u }}>
          <div>
            <WordPop delay={0} fromScale={1.5}>
              좋은 수업을,
            </WordPop>
          </div>
          <div style={{ position: "relative", display: "inline-block", alignSelf: "flex-start" }}>
            <WordPop delay={8} fromScale={1.5} style={{ opacity: 0.8 }}>
              <span style={{ color: "rgba(255,255,255,0.82)" }}>강사의 개인기에서</span>
            </WordPop>
            <DrawLine delay={22} color={C.forestDeep} thickness={14 * u} style={{ top: "52%", transform: "translateY(-50%) rotate(-1.5deg)" }} duration={10} />
          </div>
          <div style={{ position: "relative", display: "inline-block", alignSelf: "flex-start", marginTop: 6 * u }}>
            <WordPop delay={28} fromScale={2} rotate={-3}>
              <span style={{ color: C.forestDeep, fontSize: size * 1.12 }}>학원의 시스템으로</span>
            </WordPop>
            <DrawLine delay={40} color={C.page} thickness={10 * u} style={{ bottom: -6 * u }} duration={12} />
          </div>
        </div>
      </AbsoluteFill>
    </BrandStage>
  );
};
