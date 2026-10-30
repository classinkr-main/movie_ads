import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { clamp } from "../../lib/motion";
import { C } from "../../lib/theme";
import { ClassinAI } from "../Brand";
import { BlurIn, Camera, DayStage } from "../Cinema";
import { DrawIcon } from "../Icons";
import type { IconKind } from "../Icons";
import { mono } from "../Layout";
import { local } from "../timeline";
import { useType } from "../typeset";

const L = {
  logo: local("reveal", "reveal.logo"),
  chips: [local("reveal", "reveal.chip1"), local("reveal", "reveal.chip2"), local("reveal", "reveal.chip3")],
};
const VERBS: Array<{ ko: string; en: string; icon: IconKind }> = [
  { ko: "분석", en: "EVALUATE", icon: "analyze" },
  { ko: "채점", en: "GRADE", icon: "grade" },
  { ko: "통역", en: "TRANSLATE", icon: "translate" },
];
const PAPER = "#FDFCF8"; // DayStage 중앙부 색 — 아이콘 녹아웃용

// S2 타이틀 — 플래시 속에서 로고가 초점을 맞추고, 'AI'가 워드마크와 같은 획으로 그려진 뒤 세 기능을 예고한다
export const Reveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { title } = useType();
  const focus = interpolate(frame - L.logo, [0, 18], [0, 1], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });
  return (
    <DayStage>
      <Camera keys={[{ f: 0, s: 1.08 }, { f: 60, s: 1.0 }]} origin="50% 45%" drift={0.5}>
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingBottom: 120 }}>
          <div style={{ opacity: focus, filter: focus < 0.99 ? `blur(${(1 - focus) * 24}px)` : undefined, transform: `scale(${1.12 - focus * 0.12})`, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Img src={staticFile("brand/classin-mark.png")} style={{ height: 200, width: "auto" }} />
            <div style={{ marginTop: 46 }}>
              <ClassinAI height={140} aiAt={L.logo + 4} id="reveal-ai" />
            </div>
          </div>
          <div style={{ marginTop: 110, display: "flex", alignItems: "stretch" }}>
            {VERBS.map((v, i) => (
              <React.Fragment key={v.ko}>
                {i > 0 && <div style={{ width: 1.5, margin: "8px 0", background: C.hairline, transform: `scaleY(${interpolate(frame - L.chips[i] + 4, [0, 10], [0, 1], clamp)})` }} />}
                <div style={{ width: 268, display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <DrawIcon kind={v.icon} delay={L.chips[i] - 4} size={112} color={C.ink} accent={C.limeDeep} bg={PAPER} stroke={2} />
                  <div style={{ marginTop: 26, ...title(68, 700, C.ink, { lineHeight: 1 }) }}>
                    <BlurIn delay={L.chips[i]} duration={16} track={[0.3, 0.06]}>
                      {v.ko}
                    </BlurIn>
                  </div>
                  <div style={{ marginTop: 16, ...mono(19, 500, C.gray, { letterSpacing: "0.28em" }), opacity: interpolate(frame - L.chips[i] - 6, [0, 10], [0, 1], clamp) }}>{v.en}</div>
                </div>
              </React.Fragment>
            ))}
          </div>
        </AbsoluteFill>
      </Camera>
    </DayStage>
  );
};
