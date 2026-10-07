import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { LightStage } from "../components/Backgrounds";
import { Chip, LogoStacked, Pop, Rise } from "../components/Ui";
import { FONT_FAMILY } from "../lib/fonts";
import { useLayout } from "../lib/layout";
import { C } from "../lib/theme";

const CTA_URL = "classin.co.kr/contact";

// S8 — CTA: 로고 + 지금 문의하기 + URL (엔드카드, 마지막 프레임까지 유지)
export const S8Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const { u, isPortrait } = useLayout();
  const btnW = (isPortrait ? 620 : 700) * u;
  const btnH = (isPortrait ? 120 : 136) * u;
  const nudge = Math.max(0, Math.sin(frame / 5)) * 10 * u;

  const ring = (i: number) => {
    const period = 30;
    const f = frame - 14 - i * (period / 2);
    if (f < 0) return null;
    const t = (f % period) / period;
    return (
      <div
        key={i}
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: btnW,
          height: btnH,
          borderRadius: 999,
          border: `${3 * u}px solid ${C.brand}`,
          opacity: (1 - t) * 0.45,
          transform: `translate(-50%,-50%) scale(${1 + t * 0.28}, ${1 + t * 0.9})`,
        }}
      />
    );
  };

  return (
    <LightStage>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 36 * u, paddingBottom: 30 * u }}>
        <Pop delay={0} from={0.5} y={30}>
          <LogoStacked height={(isPortrait ? 300 : 320) * u} />
        </Pop>

        <div style={{ position: "relative", width: btnW, height: btnH, marginTop: 10 * u }}>
          {ring(0)}
          {ring(1)}
          <Pop delay={12} from={0.6} y={40}>
            <div
              style={{
                width: btnW,
                height: btnH,
                borderRadius: 999,
                background: C.forest,
                color: C.page,
                fontFamily: FONT_FAMILY,
                fontSize: (isPortrait ? 48 : 54) * u,
                fontWeight: 700,
                letterSpacing: "-0.02em",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 22 * u,
                boxShadow: `0 ${24 * u}px ${70 * u}px rgba(8,71,52,0.35)`,
              }}
            >
              지금 문의하기
              <span style={{ display: "inline-block", transform: `translateX(${nudge}px)`, fontWeight: 500 }}>→</span>
            </div>
          </Pop>
        </div>

        <Rise delay={22} distance={24}>
          <div style={{ fontFamily: FONT_FAMILY, fontSize: (isPortrait ? 40 : 46) * u, fontWeight: 600, color: C.brand, letterSpacing: "0", fontVariantNumeric: "tabular-nums" }}>{CTA_URL}</div>
        </Rise>
        <Rise delay={30} distance={20}>
          <div style={{ fontFamily: FONT_FAMILY, fontSize: (isPortrait ? 26 : 30) * u, fontWeight: 500, color: C.warmGray, letterSpacing: "-0.01em", textAlign: "center" }}>
            1개 교실 파일럿부터, 학원에 맞게 함께 설계합니다
          </div>
        </Rise>
      </AbsoluteFill>

      <div style={{ position: "absolute", bottom: (isPortrait ? 160 : 70) * u, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 12 * u, flexWrap: "wrap" }}>
        {["AI 강의 분석", "AI 학습 활동", "ClassIn 6.0.6"].map((t, i) => (
          <Chip key={t} delay={34 + i * 4} size={22 * u}>
            {t}
          </Chip>
        ))}
      </div>
    </LightStage>
  );
};
