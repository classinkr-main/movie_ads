import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { IvoryStage } from "../components/Backgrounds";
import { FEATURES } from "../components/Feature";
import { Burst, Chars, Dots, Highlighter } from "../components/Flourish";
import { Chip, LogoStacked, Pop, Rise } from "../components/Ui";
import { FONT_FAMILY } from "../lib/fonts";
import { C } from "../lib/theme";

const CTA_URL = "classin.co.kr/contact";

// S7 — CTA 엔드카드
export const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const btnW = 700;
  const btnH = 132;
  const nudge = Math.max(0, Math.sin(frame / 5)) * 10;

  const ring = (i: number) => {
    const period = 32;
    const f = frame - 24 - i * (period / 2);
    if (f < 0) return null;
    const t = (f % period) / period;
    return <div key={i} style={{ position: "absolute", left: "50%", top: "50%", width: btnW, height: btnH, borderRadius: 999, border: `4px solid ${C.limeDeep}`, opacity: (1 - t) * 0.55, transform: `translate(-50%,-50%) scale(${1 + t * 0.3}, ${1 + t * 1.0})` }} />;
  };

  return (
    <IvoryStage variant="white">
      <Dots count={18} opacity={0.45} speed={0.6} seed="c" />
      <AbsoluteFill style={{ flexDirection: "row", alignItems: "center", padding: "0 150px", gap: 80 }}>
        {/* 좌: 메시지 */}
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: FONT_FAMILY, fontSize: 118, fontWeight: 900, color: C.ink, letterSpacing: "-0.05em", lineHeight: 1.06 }}>
            <Chars text="Classin AI로," delay={2} stagger={2} rotate={8} />
            <br />
            <Highlighter delay={34} duration={16} inset={12}>
              <Chars text="수업을 업그레이드" delay={14} stagger={2} rotate={8} style={{ color: C.forest }} />
            </Highlighter>
          </div>
          <div style={{ marginTop: 30, display: "flex", flexWrap: "wrap", gap: 10, maxWidth: 820 }}>
            {FEATURES.map((f, i) => (
              <Chip key={f.n} delay={30 + i * 4} size={20}>
                <span style={{ color: C.limeDeep, marginRight: 8 }}>{f.n}</span>
                {f.short}
              </Chip>
            ))}
          </div>
          <Rise delay={44} distance={20} style={{ marginTop: 26 }}>
            <div style={{ fontFamily: FONT_FAMILY, fontSize: 28, fontWeight: 500, color: C.gray, letterSpacing: "-0.01em" }}>1개 교실 파일럿부터, 학원에 맞게 함께 설계합니다</div>
          </Rise>
        </div>

        {/* 우: 로고 + 버튼 */}
        <div style={{ width: 760, display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
          <div style={{ position: "relative", display: "grid", placeItems: "center" }}>
            <Burst delay={10} size={640} color={C.limeDeep} lines={18} style={{ left: "50%", top: "50%", transform: "translate(-50%,-50%)" }} />
            <Pop delay={2} from={0.4} y={30}>
              <LogoStacked height={280} />
            </Pop>
          </div>
          <div style={{ position: "relative", width: btnW, height: btnH }}>
            {ring(0)}
            {ring(1)}
            <Pop delay={20} from={0.6} y={40}>
              <div style={{ width: btnW, height: btnH, borderRadius: 999, background: C.forest, color: C.white, fontFamily: FONT_FAMILY, fontSize: 54, fontWeight: 800, letterSpacing: "-0.02em", display: "flex", alignItems: "center", justifyContent: "center", gap: 22, boxShadow: "0 26px 70px rgba(8,71,52,0.32)" }}>
                지금 문의하기
                <span style={{ display: "inline-block", transform: `translateX(${nudge}px)`, fontWeight: 500 }}>→</span>
              </div>
            </Pop>
          </div>
          <Rise delay={32} distance={20}>
            <div style={{ fontFamily: FONT_FAMILY, fontSize: 40, fontWeight: 700, color: C.forest, letterSpacing: "0" }}>{CTA_URL}</div>
          </Rise>
        </div>
      </AbsoluteFill>
    </IvoryStage>
  );
};
