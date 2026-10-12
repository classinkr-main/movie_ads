import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { IvoryStage } from "../components/Backgrounds";
import { Burst, Dots, GhostWord, Highlighter } from "../components/Flourish";
import { Chip, LogoStacked, Pop, Rise } from "../components/Ui";
import { FONT_FAMILY } from "../lib/fonts";
import { C } from "../lib/theme";

const CTA_URL = "classin.co.kr/contact";

// S7 — CTA 엔드카드
export const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const btnW = 720;
  const btnH = 140;
  const nudge = Math.max(0, Math.sin(frame / 5)) * 10;

  const ring = (i: number) => {
    const period = 32;
    const f = frame - 16 - i * (period / 2);
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
          border: `4px solid ${C.limeDeep}`,
          opacity: (1 - t) * 0.6,
          transform: `translate(-50%,-50%) scale(${1 + t * 0.3}, ${1 + t * 1.0})`,
        }}
      />
    );
  };

  return (
    <IvoryStage variant="white">
      <GhostWord text="CONTACT" size={300} top="72%" opacity={0.07} speed={1.2} />
      <Dots count={22} opacity={0.5} speed={0.7} seed="c" />

      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 34, paddingBottom: 30 }}>
        <div style={{ position: "relative", display: "grid", placeItems: "center" }}>
          <Burst delay={8} size={760} color={C.limeDeep} lines={20} style={{ left: "50%", top: "50%", transform: "translate(-50%,-50%)" }} />
          <Pop delay={0} from={0.4} y={30}>
            <LogoStacked height={320} />
          </Pop>
        </div>

        <div style={{ position: "relative", width: btnW, height: btnH, marginTop: 8 }}>
          {ring(0)}
          {ring(1)}
          <Pop delay={14} from={0.6} y={40}>
            <div
              style={{
                width: btnW,
                height: btnH,
                borderRadius: 999,
                background: C.forest,
                color: C.white,
                fontFamily: FONT_FAMILY,
                fontSize: 56,
                fontWeight: 800,
                letterSpacing: "-0.02em",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 22,
                boxShadow: "0 26px 70px rgba(8,71,52,0.32)",
              }}
            >
              지금 문의하기
              <span style={{ display: "inline-block", transform: `translateX(${nudge}px)`, fontWeight: 500 }}>→</span>
            </div>
          </Pop>
        </div>

        <Rise delay={26} distance={24}>
          <Highlighter delay={38} inset={22}>
            <div style={{ fontFamily: FONT_FAMILY, fontSize: 48, fontWeight: 700, color: C.forest, letterSpacing: "0", padding: "0 12px" }}>{CTA_URL}</div>
          </Highlighter>
        </Rise>
        <Rise delay={36} distance={20}>
          <div style={{ fontFamily: FONT_FAMILY, fontSize: 30, fontWeight: 500, color: C.gray, letterSpacing: "-0.01em", textAlign: "center" }}>1개 교실 파일럿부터, 학원에 맞게 함께 설계합니다</div>
        </Rise>
      </AbsoluteFill>

      <div style={{ position: "absolute", bottom: 64, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 12 }}>
        {["AI 강의 분석", "데이터 기반 교사 개발", "ClassIn"].map((t, i) => (
          <Chip key={t} delay={44 + i * 4} size={22}>
            {t}
          </Chip>
        ))}
      </div>
    </IvoryStage>
  );
};
