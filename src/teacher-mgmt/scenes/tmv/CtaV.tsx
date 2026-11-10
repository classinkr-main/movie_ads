import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { IvoryStage } from "../../../shared/brand/Backgrounds";
import { Burst, Chars, Dots, Highlighter } from "../../../shared/brand/Flourish";
import { AuroraOrbs, GlassButton } from "../../../shared/brand/Glass";
import { Chip, LogoStacked, Pop, Rise } from "../../../shared/brand/Ui";
import { FONT_FAMILY } from "../../../shared/fonts";
import { clamp } from "../../../shared/motion";
import { C } from "../../../shared/brand/theme";

const CTA_URL = "classin.co.kr/contact";
const PILLS = ["AI 강의 평가", "원장님 대시보드", "내 수업 리포트"];

// S6 — CTA: "원장님은 편하게, 강사는 객관적으로."
export const CtaV: React.FC = () => {
  const frame = useCurrentFrame();
  const btnW = 680;
  const btnH = 128;
  const haloSpin = (frame * 0.4) % 360;

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

        <div style={{ width: 740, flexShrink: 0, position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
          {/* 유리 뒤로 흐르는 오로라 — 버튼 영역을 중심으로 깔린다 */}
          <AuroraOrbs width={900} height={520} delay={18} style={{ left: -80, top: 150 }} />
          <div style={{ position: "relative", display: "grid", placeItems: "center" }}>
            <Burst delay={12} size={640} color={C.limeDeep} lines={18} style={{ left: "50%", top: "50%", transform: "translate(-50%,-50%)" }} />
            <Pop delay={4} from={0.4} y={30}>
              <LogoStacked height={270} />
            </Pop>
          </div>
          <div style={{ position: "relative", width: btnW, height: btnH }}>
            {/* 회전하는 그라데이션 헤일로 */}
            <div style={{ position: "absolute", inset: -3, borderRadius: 999, background: `conic-gradient(from ${haloSpin}deg, rgba(200,240,90,0) 0deg, rgba(200,240,90,0.9) 70deg, rgba(0,144,96,0.6) 150deg, rgba(200,240,90,0) 230deg, rgba(216,255,92,0.8) 320deg, rgba(200,240,90,0) 360deg)`, filter: "blur(6px)", opacity: interpolate(frame - 30, [0, 12], [0, 0.9], clamp) }} />
            <GlassButton label="지금 문의하기" width={btnW} height={btnH} delay={26} fontSize={50} />
          </div>
          <Rise delay={40} distance={18}>
            <div style={{ fontFamily: FONT_FAMILY, fontSize: 36, fontWeight: 700, color: C.forest, letterSpacing: "-0.01em" }}>{CTA_URL}</div>
          </Rise>
        </div>
      </AbsoluteFill>
    </IvoryStage>
  );
};
