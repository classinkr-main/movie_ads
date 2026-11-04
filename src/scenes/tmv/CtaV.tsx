import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { IvoryStage } from "../../components/Backgrounds";
import { Burst, Chars, Dots, Highlighter } from "../../components/Flourish";
import { Chip, LogoStacked, Pop, Rise } from "../../components/Ui";
import { FONT_FAMILY } from "../../lib/fonts";
import { C } from "../../lib/theme";

const CTA_URL = "classin.co.kr/contact";
const PILLS = ["AI 강의 평가", "원장님 대시보드", "내 수업 리포트"];

// S6 — CTA: "원장님은 편하게, 강사는 객관적으로."
export const CtaV: React.FC = () => {
  const frame = useCurrentFrame();
  const btnW = 680;
  const btnH = 128;
  const nudge = Math.max(0, Math.sin(frame / 5)) * 10;

  const ring = (i: number) => {
    const period = 34;
    const f = frame - 32 - i * (period / 2);
    if (f < 0) return null;
    const t = (f % period) / period;
    return <div key={i} style={{ position: "absolute", left: "50%", top: "50%", width: btnW, height: btnH, borderRadius: 999, border: `4px solid ${C.limeDeep}`, opacity: (1 - t) * 0.55, transform: `translate(-50%,-50%) scale(${1 + t * 0.3}, ${1 + t * 1.0})` }} />;
  };

  return (
    <IvoryStage variant="white">
      <Dots count={18} opacity={0.45} speed={0.6} seed="cv" />
      <AbsoluteFill style={{ flexDirection: "row", alignItems: "center", padding: "0 150px", gap: 60 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: FONT_FAMILY, fontSize: 104, fontWeight: 900, color: C.ink, letterSpacing: "-0.05em", lineHeight: 1.1, whiteSpace: "nowrap" }}>
            <Chars text="원장님은 편하게," delay={4} stagger={2.2} rotate={8} />
            <br />
            <Highlighter delay={46} duration={18} inset={12}>
              <Chars text="강사는 객관적으로." delay={22} stagger={2.2} rotate={8} style={{ color: C.forest }} />
            </Highlighter>
          </div>
          <div style={{ marginTop: 30, display: "flex", flexWrap: "wrap", gap: 10, maxWidth: 820 }}>
            {PILLS.map((p, i) => (
              <Chip key={p} delay={50 + i * 6} size={20}>
                <span style={{ color: C.limeDeep, marginRight: 8 }}>{String(i + 1).padStart(2, "0")}</span>
                {p}
              </Chip>
            ))}
          </div>
          <Rise delay={64} distance={18} style={{ marginTop: 26 }}>
            <div style={{ fontFamily: FONT_FAMILY, fontSize: 30, fontWeight: 500, color: C.gray, letterSpacing: "-0.01em" }}>
              AI 강의 평가 하나로, <span style={{ color: C.ink, fontWeight: 700 }}>두 사람이 같은 데이터로 대화합니다.</span>
            </div>
          </Rise>
        </div>

        <div style={{ width: 740, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
          <div style={{ position: "relative", display: "grid", placeItems: "center" }}>
            <Burst delay={12} size={640} color={C.limeDeep} lines={18} style={{ left: "50%", top: "50%", transform: "translate(-50%,-50%)" }} />
            <Pop delay={4} from={0.4} y={30}>
              <LogoStacked height={270} />
            </Pop>
          </div>
          <div style={{ position: "relative", width: btnW, height: btnH }}>
            {ring(0)}
            {ring(1)}
            <Pop delay={26} from={0.6} y={40}>
              <div style={{ width: btnW, height: btnH, borderRadius: 999, background: C.forest, color: C.white, fontFamily: FONT_FAMILY, fontSize: 52, fontWeight: 800, letterSpacing: "-0.02em", display: "flex", alignItems: "center", justifyContent: "center", gap: 22, boxShadow: "0 26px 70px rgba(8,71,52,0.32)" }}>
                지금 문의하기
                <span style={{ display: "inline-block", transform: `translateX(${nudge}px)`, fontWeight: 500 }}>→</span>
              </div>
            </Pop>
          </div>
          <Rise delay={40} distance={18}>
            <div style={{ fontFamily: FONT_FAMILY, fontSize: 38, fontWeight: 700, color: C.forest }}>{CTA_URL}</div>
          </Rise>
        </div>
      </AbsoluteFill>
    </IvoryStage>
  );
};
