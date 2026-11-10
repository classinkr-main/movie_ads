import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { IvoryStage } from "../../../shared/brand/Backgrounds";
import { Burst, Chars, Dots, Highlighter } from "../../../shared/brand/Flourish";
import { Chip, LogoStacked, Pop, Rise } from "../../../shared/brand/Ui";
import { FONT_FAMILY } from "../../../shared/fonts";
import { C } from "../../../shared/brand/theme";

const CTA_URL = "classin.co.kr/contact";
const PILLS = ["AI 강의 평가", "강사별 추이", "면담 준비 노트"];

// S4 — CTA: "AI로 강의 평가, 데이터로 강사 관리."
export const CtaTm: React.FC = () => {
  const frame = useCurrentFrame();
  const btnW = 700;
  const btnH = 132;
  const nudge = Math.max(0, Math.sin(frame / 5)) * 10;

  const ring = (i: number) => {
    const period = 34;
    const f = frame - 30 - i * (period / 2);
    if (f < 0) return null;
    const t = (f % period) / period;
    return <div key={i} style={{ position: "absolute", left: "50%", top: "50%", width: btnW, height: btnH, borderRadius: 999, border: `4px solid ${C.limeDeep}`, opacity: (1 - t) * 0.55, transform: `translate(-50%,-50%) scale(${1 + t * 0.3}, ${1 + t * 1.0})` }} />;
  };

  return (
    <IvoryStage variant="white">
      <Dots count={18} opacity={0.45} speed={0.6} seed="t" />
      <AbsoluteFill style={{ flexDirection: "row", alignItems: "center", padding: "0 150px", gap: 80 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: FONT_FAMILY, fontSize: 112, fontWeight: 900, color: C.ink, letterSpacing: "-0.05em", lineHeight: 1.08, whiteSpace: "nowrap" }}>
            <Chars text="AI로 강의 평가," delay={2} stagger={2.2} rotate={8} />
            <br />
            <Highlighter delay={44} duration={18} inset={12}>
              <Chars text="데이터로 강사 관리." delay={20} stagger={2.2} rotate={8} style={{ color: C.forest }} />
            </Highlighter>
          </div>
          <div style={{ marginTop: 30, display: "flex", flexWrap: "wrap", gap: 10, maxWidth: 820 }}>
            {PILLS.map((p, i) => (
              <Chip key={p} delay={40 + i * 6} size={21}>
                <span style={{ color: C.limeDeep, marginRight: 8 }}>{String(i + 1).padStart(2, "0")}</span>
                {p}
              </Chip>
            ))}
          </div>
          <Rise delay={56} distance={20} style={{ marginTop: 26 }}>
            <div style={{ fontFamily: FONT_FAMILY, fontSize: 30, fontWeight: 500, color: C.gray, letterSpacing: "-0.01em" }}>
              참관하지 않아도, <span style={{ color: C.ink, fontWeight: 700 }}>학원의 모든 수업이 보입니다.</span>
            </div>
          </Rise>
        </div>

        <div style={{ width: 760, display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
          <div style={{ position: "relative", display: "grid", placeItems: "center" }}>
            <Burst delay={12} size={640} color={C.limeDeep} lines={18} style={{ left: "50%", top: "50%", transform: "translate(-50%,-50%)" }} />
            <Pop delay={4} from={0.4} y={30}>
              <LogoStacked height={280} />
            </Pop>
          </div>
          <div style={{ position: "relative", width: btnW, height: btnH }}>
            {ring(0)}
            {ring(1)}
            <Pop delay={24} from={0.6} y={40}>
              <div style={{ width: btnW, height: btnH, borderRadius: 999, background: C.forest, color: C.white, fontFamily: FONT_FAMILY, fontSize: 54, fontWeight: 800, letterSpacing: "-0.02em", display: "flex", alignItems: "center", justifyContent: "center", gap: 22, boxShadow: "0 26px 70px rgba(8,71,52,0.32)" }}>
                지금 문의하기
                <span style={{ display: "inline-block", transform: `translateX(${nudge}px)`, fontWeight: 500 }}>→</span>
              </div>
            </Pop>
          </div>
          <Rise delay={38} distance={20}>
            <div style={{ fontFamily: FONT_FAMILY, fontSize: 40, fontWeight: 700, color: C.forest }}>{CTA_URL}</div>
          </Rise>
        </div>
      </AbsoluteFill>
    </IvoryStage>
  );
};
