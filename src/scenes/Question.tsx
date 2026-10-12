import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { IvoryStage } from "../components/Backgrounds";
import { Chars, Dots, GlassCard, Highlighter } from "../components/Flourish";
import { WordPop } from "../components/Kinetic";
import { Rise } from "../components/Ui";
import { FONT_FAMILY } from "../lib/fonts";
import { clamp, SOFT, sp } from "../lib/motion";
import { C } from "../lib/theme";

const CARDS = [
  { t: "60:00", x: 1240, y: 150, rot: -7, d: 6 },
  { t: "45:00", x: 1500, y: 330, rot: 6, d: 12 },
  { t: "90:00", x: 1300, y: 560, rot: -4, d: 18 },
  { t: "60:00", x: 1580, y: 760, rot: 8, d: 24 },
];

// S2 — 질문: "좋은 수업이었는지는, 누가 알 수 있을까요?"
export const Question: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const qs = sp(frame - 2, fps, SOFT);
  const qRot = Math.sin(frame / 40) * 5;

  return (
    <IvoryStage variant="ivory2">
      <Dots count={14} opacity={0.35} speed={0.6} seed="q" />

      {/* 거대 물음표 */}
      <div
        style={{
          position: "absolute",
          right: 60,
          top: -120,
          fontFamily: FONT_FAMILY,
          fontSize: 1150,
          fontWeight: 900,
          lineHeight: 1,
          color: "transparent",
          WebkitTextStroke: `3px ${C.limeDeep}`,
          opacity: 0.28 * qs,
          transform: `rotate(${qRot}deg) scale(${0.6 + 0.4 * qs})`,
          transformOrigin: "50% 50%",
        }}
      >
        ?
      </div>

      {/* 못 본 녹화본 카드 */}
      {CARDS.map((c, i) => {
        const s = sp(frame - c.d, fps, SOFT);
        const float = Math.sin(frame / 22 + i) * 10;
        return (
          <div key={i} style={{ position: "absolute", left: c.x, top: c.y + float, transform: `rotate(${c.rot}deg) scale(${0.7 + 0.3 * s})`, opacity: s }}>
            <GlassCard padding={22} radius={22} style={{ width: 250 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 999, background: C.limeSoft, display: "grid", placeItems: "center" }}>
                  <div style={{ width: 0, height: 0, borderLeft: `14px solid ${C.limeInk}`, borderTop: "9px solid transparent", borderBottom: "9px solid transparent", marginLeft: 4 }} />
                </div>
                <div>
                  <div style={{ fontFamily: FONT_FAMILY, fontSize: 26, fontWeight: 800, color: C.ink, letterSpacing: "-0.02em" }}>{c.t}</div>
                  <div style={{ fontFamily: FONT_FAMILY, fontSize: 16, fontWeight: 600, color: C.gray300 }}>아직 보지 않음</div>
                </div>
              </div>
            </GlassCard>
          </div>
        );
      })}

      {/* 헤드라인 */}
      <AbsoluteFill style={{ justifyContent: "center", paddingLeft: 120 }}>
        <div style={{ fontFamily: FONT_FAMILY, fontSize: 124, fontWeight: 900, color: C.ink, letterSpacing: "-0.045em", lineHeight: 1.12 }}>
          <Chars text="좋은 수업이었는지는," delay={4} stagger={2} />
          <div style={{ display: "flex", alignItems: "baseline", gap: 30, marginTop: 10 }}>
            <WordPop delay={28} fromScale={2.2} rotate={-6}>
              <Highlighter delay={40} inset={14}>
                <span style={{ color: C.forest }}>누가</span>
              </Highlighter>
            </WordPop>
            <WordPop delay={34}>알 수 있을까요?</WordPop>
          </div>
        </div>
        <Rise delay={56} distance={26} style={{ marginTop: 34 }}>
          <div style={{ fontFamily: FONT_FAMILY, fontSize: 40, fontWeight: 500, color: C.gray, letterSpacing: "-0.01em" }}>
            강사 열 명, 매일 열두 개의 수업. <span style={{ color: C.ink, fontWeight: 700 }}>다 들어볼 수는 없습니다.</span>
          </div>
        </Rise>
      </AbsoluteFill>
    </IvoryStage>
  );
};
