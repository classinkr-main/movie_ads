import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { SERIF_EN } from "../../lib/fonts";
import { clamp } from "../../lib/motion";
import { C } from "../../lib/theme";
import { BlurIn, Camera, DayStage } from "../Cinema";
import { mono, serif } from "../Layout";
import { local } from "../timeline";

const L = {
  logo: local("reveal", "reveal.logo"),
  chips: [local("reveal", "reveal.chip1"), local("reveal", "reveal.chip2"), local("reveal", "reveal.chip3")],
};
const VERBS = ["분석", "채점", "통역"];

// S2 타이틀 — 플래시 속에서 로고가 초점을 맞추고, 다음 세 장면을 예고한다
export const Reveal: React.FC = () => {
  const frame = useCurrentFrame();
  const focus = interpolate(frame - L.logo, [0, 18], [0, 1], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });
  const ai = interpolate(frame - L.logo - 6, [0, 16], [0, 1], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });
  const rule = interpolate(frame - L.chips[0] + 6, [0, 14], [0, 1], clamp);
  return (
    <DayStage>
      <Camera keys={[{ f: 0, s: 1.08 }, { f: 60, s: 1.0 }]} origin="50% 45%" drift={0.5}>
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingBottom: 140 }}>
          <div style={{ opacity: focus, filter: focus < 0.99 ? `blur(${(1 - focus) * 24}px)` : undefined, transform: `scale(${1.12 - focus * 0.12})`, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Img src={staticFile("brand/classin-mark.png")} style={{ height: 210, width: "auto" }} />
            <div style={{ display: "flex", alignItems: "flex-end", gap: 26, marginTop: 44 }}>
              <Img src={staticFile("brand/classin-wordmark.png")} style={{ height: 150, width: "auto" }} />
              <span
                style={{
                  fontFamily: SERIF_EN,
                  fontStyle: "italic",
                  fontSize: 236,
                  lineHeight: 0.78,
                  color: C.forest,
                  letterSpacing: "-0.02em",
                  opacity: ai,
                  transform: `translateX(${(1 - ai) * 40}px)`,
                  filter: ai < 0.99 ? `blur(${(1 - ai) * 16}px)` : undefined,
                  display: "inline-block",
                }}
              >
                AI
              </span>
            </div>
          </div>
          <div style={{ width: 160, height: 3, background: C.limeDeep, marginTop: 84, transform: `scaleX(${rule})` }} />
          <div style={{ marginTop: 50, display: "flex", gap: 34, alignItems: "center", ...serif(76, 600, C.ink) }}>
            {VERBS.map((v, i) => (
              <React.Fragment key={v}>
                {i > 0 && <span style={{ width: 12, height: 12, borderRadius: 999, background: C.lime, opacity: interpolate(frame - L.chips[i], [0, 6], [0, 1], clamp) }} />}
                <BlurIn delay={L.chips[i]} duration={16} track={[0.3, 0.08]}>
                  {v}
                </BlurIn>
              </React.Fragment>
            ))}
          </div>
          <div style={{ marginTop: 40, ...mono(22, 500, C.gray, { letterSpacing: "0.3em" }), opacity: interpolate(frame - L.chips[2] - 4, [0, 10], [0, 1], clamp) }}>EVALUATE · GRADE · TRANSLATE</div>
        </AbsoluteFill>
      </Camera>
    </DayStage>
  );
};
