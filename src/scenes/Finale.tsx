import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Photo } from "../components/Media";
import { HandLine } from "../components/Marks";
import { Flash } from "../components/Fx";
import { Slam } from "../components/Type";
import { C, CUES, FONT, scene } from "../lib/theme";
import { clamp, ease, prog } from "../lib/motion";

// S9 피날레 (1080–1200f) — 실제 학원 사진이 8분음표로 바뀌는 위로 브랜드 문장을 첨삭한다.
// "좋은 수업을, / 강사의 개인기에서 → (취소선) / 학원의 시스템으로."
const { from } = scene("finale");
const LINES = CUES.finale.lines.map((f) => f - from);
const STRIKE = CUES.finale.strike - from;
const STEP = CUES.finale.strobe;

const STROBE = ["case-busan.jpg", "mokdong-point.jpg", "case-daechi.jpg", "case-pyeongtaek.jpg", "hw-room86.jpg", "mokdong-dual.jpg", "case-daegu.jpg", "mokdong-grid.jpg"];

export const Finale: React.FC = () => {
  const frame = useCurrentFrame();
  const idx = Math.min(STROBE.length - 1, Math.floor(frame / STEP));
  const local = frame - idx * STEP;
  const z = interpolate(local, [0, STEP], [1.1, 1.04], { ...clamp, easing: ease.out });
  const block = prog(frame, STRIKE, STRIKE + 7, ease.outExpo);
  const struck = prog(frame, STRIKE, STRIKE + 10);
  const push = interpolate(frame, [STRIKE, 120], [1, 1.05], { ...clamp, easing: ease.inOut });
  const line: React.CSSProperties = { fontFamily: FONT.display, fontSize: 150, lineHeight: 1.12, letterSpacing: "-0.05em", color: C.white, whiteSpace: "nowrap" };
  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      <Photo src={STROBE[idx]} scale={z} filter="saturate(0.85) contrast(1.12) brightness(0.48)" />
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(10,11,20,0.78) 0%, rgba(10,11,20,0.35) 60%, rgba(10,11,20,0.1) 100%)" }} />
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: "0% 50%" }}>
        <div style={{ position: "absolute", left: 130, top: 170 }}>
          <Slam start={LINES[0]} from={1.35} origin="0% 100%" style={{ ...line, fontWeight: 900 }}>
            좋은 수업을,
          </Slam>
          <div style={{ position: "relative", marginTop: 6 }}>
            <Slam start={LINES[1]} from={1.35} origin="0% 100%" style={{ ...line, fontWeight: 760, opacity: 1 - struck * 0.45 }}>
              강사의 개인기에서
            </Slam>
          </div>
          <div style={{ position: "relative", marginTop: 26, display: "inline-block" }}>
            <div style={{ position: "absolute", left: -26, right: -30, top: 8, bottom: -6, background: C.lime, transform: `scaleX(${block})`, transformOrigin: "0 50%" }} />
            <Slam start={LINES[2]} from={1.4} origin="0% 100%" style={{ ...line, position: "relative", fontSize: 168, fontWeight: 900, color: C.ink }}>
              학원의 시스템으로.
            </Slam>
          </div>
        </div>
        {frame >= STRIKE && <HandLine from={[118, 452]} to={[1300, 436]} start={STRIKE} dur={9} width={16} wobble={5} seed="strike" />}
      </AbsoluteFill>
      <Flash at={LINES[0]} dur={6} max={0.45} />
    </AbsoluteFill>
  );
};
