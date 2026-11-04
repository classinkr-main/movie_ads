import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ChipDark, DarkStage, LogoStackedWhite, Reveal, Shine, td } from "../../components/Dark";
import { Burst, Chars, Dots } from "../../components/Flourish";
import { Pop } from "../../components/Ui";
import { FONT_FAMILY } from "../../lib/fonts";
import { D } from "../../lib/themeDark";

const CTA_URL = "classin.co.kr/contact";
const PILLS = ["AI 강의 평가", "원장 대시보드", "내 수업 리포트"];

// S5 — CTA: "원장은 편하게, 강사는 객관적으로."
export const CtaB: React.FC = () => {
  const frame = useCurrentFrame();
  const btnW = 680;
  const btnH = 128;
  const nudge = Math.max(0, Math.sin(frame / 5)) * 10;

  const ring = (i: number) => {
    const period = 36;
    const f = frame - 34 - i * (period / 2);
    if (f < 0) return null;
    const t = (f % period) / period;
    return <div key={i} style={{ position: "absolute", left: "50%", top: "50%", width: btnW, height: btnH, borderRadius: 999, border: `3px solid ${D.lime}`, opacity: (1 - t) * 0.5, transform: `translate(-50%,-50%) scale(${1 + t * 0.3}, ${1 + t * 1.0})` }} />;
  };

  return (
    <DarkStage glow={1.3}>
      <Dots count={20} color={D.lime} opacity={0.35} speed={0.45} seed="cb" />
      <AbsoluteFill style={{ flexDirection: "row", alignItems: "center", padding: "0 150px", gap: 80 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: FONT_FAMILY, fontSize: 112, fontWeight: 900, color: D.ink, letterSpacing: "-0.05em", lineHeight: 1.1, whiteSpace: "nowrap" }}>
            <Chars text="원장은 편하게," delay={4} stagger={2.4} rotate={0} rise={44} />
            <br />
            <Chars text="강사는 객관적으로." delay={24} stagger={2.4} rotate={0} rise={44} style={{ color: D.lime }} />
          </div>
          <div style={{ marginTop: 30, display: "flex", flexWrap: "wrap", gap: 10, maxWidth: 820 }}>
            {PILLS.map((p, i) => (
              <ChipDark key={p} delay={52 + i * 6} size={18}>
                <span style={{ color: D.limeDeep }}>{String(i + 1).padStart(2, "0")}</span>
                {p}
              </ChipDark>
            ))}
          </div>
          <Reveal delay={66} distance={18} style={{ marginTop: 26 }}>
            <div style={{ fontFamily: FONT_FAMILY, fontSize: 30, fontWeight: 500, color: D.mute, letterSpacing: "-0.01em" }}>
              AI 강의 평가 하나로,{" "}
              <Shine delay={84} duration={44}>
                <span style={{ fontWeight: 700 }}>두 사람이 같은 데이터로 대화합니다.</span>
              </Shine>
            </div>
          </Reveal>
        </div>

        <div style={{ width: 760, display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
          <div style={{ position: "relative", display: "grid", placeItems: "center" }}>
            <Burst delay={14} size={640} color={D.limeDeep} lines={18} style={{ left: "50%", top: "50%", transform: "translate(-50%,-50%)" }} />
            <Pop delay={6} from={0.4} y={30}>
              <LogoStackedWhite height={270} />
            </Pop>
          </div>
          <div style={{ position: "relative", width: btnW, height: btnH }}>
            {ring(0)}
            {ring(1)}
            <Pop delay={28} from={0.6} y={40}>
              <div style={{ width: btnW, height: btnH, borderRadius: 999, background: D.lime, color: "#0A1A14", fontFamily: FONT_FAMILY, fontSize: 52, fontWeight: 800, letterSpacing: "-0.02em", display: "flex", alignItems: "center", justifyContent: "center", gap: 22, boxShadow: "0 26px 80px rgba(200,240,90,0.28)" }}>
                지금 문의하기
                <span style={{ display: "inline-block", transform: `translateX(${nudge}px)`, fontWeight: 500 }}>→</span>
              </div>
            </Pop>
          </div>
          <Reveal delay={42} distance={18}>
            <div style={td(38, 700, D.lime)}>{CTA_URL}</div>
          </Reveal>
        </div>
      </AbsoluteFill>
    </DarkStage>
  );
};
