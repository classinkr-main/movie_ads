import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Highlighter } from "../../components/Flourish";
import { LogoStacked, Pop, Rise } from "../../components/Ui";
import { SERIF_EN } from "../../lib/fonts";
import { clamp, easeInOutCubic } from "../../lib/motion";
import { C } from "../../lib/theme";
import { BlurIn, Camera, DayStage } from "../Cinema";
import { mono, SAFE, serif, t } from "../Layout";
import { local } from "../timeline";

const L = {
  line1: local("end", "end.line1"),
  cta: local("end", "end.cta"),
  tap: local("end", "end.tap"),
};
const CTA_URL = "classin.co.kr/contact";
const BTN = { w: 820, h: 150, top: 1190 };

// S6 펀치라인 + CTA — 어둠에서 빠져나온 빛, 커서가 "지금 문의하기"를 누른다
export const End: React.FC = () => {
  const frame = useCurrentFrame();
  const move = interpolate(frame, [L.tap - 22, L.tap - 2], [0, 1], { ...clamp, easing: easeInOutCubic });
  const cx = interpolate(move, [0, 1], [980, 600]);
  const cy = interpolate(move, [0, 1], [1720, BTN.top + BTN.h / 2 + 10]);
  const press = interpolate(frame - L.tap, [-2, 0, 5], [1, 0.95, 1], clamp);
  const rip = frame - L.tap;

  return (
    <DayStage>
      <Camera keys={[{ f: 0, s: 1.06 }, { f: 40, s: 1.0 }, { f: 104, s: 1.025 }]} origin="50% 40%" drift={0.5}>
        <AbsoluteFill style={{ paddingTop: SAFE.top + 70, alignItems: "center" }}>
          <div style={serif(148, 500, C.ink, { lineHeight: 1.1, textAlign: "center", letterSpacing: "-0.045em" })}>
            <BlurIn delay={L.line1} duration={20} track={[0.1, -0.045]}>
              선생님은
            </BlurIn>
            <br />
            <Highlighter delay={L.line1 + 16} duration={14} inset={14}>
              <BlurIn delay={L.line1 + 6} duration={20} track={[0.1, -0.045]} style={{ color: C.forest, fontWeight: 800 }}>
                가르치기만
              </BlurIn>
            </Highlighter>
            <br />
            <BlurIn delay={L.line1 + 12} duration={20} track={[0.1, -0.045]}>
              하세요.
            </BlurIn>
          </div>
          <div style={{ marginTop: 26, fontFamily: SERIF_EN, fontStyle: "italic", fontSize: 58, color: C.limeInk, letterSpacing: "-0.01em" }}>
            <BlurIn delay={L.line1 + 22} duration={18} track={[0.2, 0]}>
              — just teach.
            </BlurIn>
          </div>
        </AbsoluteFill>

        <div style={{ position: "absolute", left: 0, right: 0, top: 960, display: "flex", justifyContent: "center" }}>
          <Pop delay={L.cta - 8} from={0.7} y={20}>
            <LogoStacked height={160} />
          </Pop>
        </div>

        <div style={{ position: "absolute", left: (1080 - BTN.w) / 2, top: BTN.top, width: BTN.w, height: BTN.h }}>
          {rip >= 0 && rip < 24 && (
            <div style={{ position: "absolute", inset: 0, borderRadius: 999, border: `5px solid ${C.limeDeep}`, opacity: 1 - rip / 24, transform: `scale(${1 + (rip / 24) * 0.18}, ${1 + (rip / 24) * 0.6})` }} />
          )}
          <Pop delay={L.cta} from={0.6} y={40}>
            <div style={{ width: BTN.w, height: BTN.h, borderRadius: 999, background: rip >= 0 ? "#06392A" : C.forest, display: "flex", alignItems: "center", justifyContent: "center", gap: 24, boxShadow: "0 30px 80px rgba(8,71,52,0.35)", transform: `scale(${press})`, ...t(62, 800, C.white, { letterSpacing: "-0.02em" }) }}>
              지금 문의하기
              <span style={{ color: C.lime, fontWeight: 500 }}>→</span>
            </div>
          </Pop>
        </div>

        <div style={{ position: "absolute", left: 0, right: 0, top: BTN.top + BTN.h + 44, display: "flex", justifyContent: "center" }}>
          <Rise delay={L.cta + 8} distance={20}>
            <div style={mono(40, 600, C.forest, { letterSpacing: "0.02em" })}>{CTA_URL}</div>
          </Rise>
        </div>
      </Camera>

      {/* 커서 */}
      <svg width={84} height={84} viewBox="0 0 24 24" style={{ position: "absolute", left: cx, top: cy, opacity: interpolate(frame, [L.tap - 24, L.tap - 18], [0, 1], clamp), transform: `scale(${press})`, transformOrigin: "0 0", filter: "drop-shadow(0 8px 14px rgba(28,27,23,0.25))" }}>
        <path d="M4 2 L4 19 L8.5 15 L11.5 22 L14.5 20.8 L11.6 14 L18 14 Z" fill={C.white} stroke={C.ink} strokeWidth={1.4} strokeLinejoin="round" />
      </svg>
    </DayStage>
  );
};
