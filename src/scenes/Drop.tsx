import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Flash, Rings, SpeedLines } from "../components/Fx";
import { LimeStage, limeGrid } from "../components/Stage";
import { Slam } from "../components/Type";
import { C, FONT } from "../lib/theme";
import { clamp, ease, shake } from "../lib/motion";

// S3 드롭 (240–270f) — 침묵 뒤 첫 박. "미래의 학원은, / 남긴다."
export const Drop: React.FC = () => {
  const frame = useCurrentFrame();
  const sh = shake(frame, 0, 22, 18, "drop");
  const gridScale = interpolate(frame, [0, 30], [1.35, 1], { ...clamp, easing: ease.outExpo });
  return (
    <LimeStage grid={false}>
      <AbsoluteFill style={{ ...limeGrid(40), backgroundPosition: "center", transform: `scale(${gridScale})` }} />
      <SpeedLines start={0} dur={26} color="rgba(10,11,20,0.35)" />
      <Rings start={0} count={3} maxR={1100} width={14} />
      <AbsoluteFill style={{ transform: `translate(${sh.x}px, ${sh.y}px) rotate(${sh.r}deg)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 64, letterSpacing: "-0.02em", color: C.ink, opacity: 0.72, marginBottom: 6 }}>미래의 학원은,</div>
        <Slam start={0} from={1.75} style={{ fontFamily: FONT.display, fontWeight: 900, fontSize: 400, lineHeight: 1, letterSpacing: "-0.055em", color: C.ink }}>
          남긴다.
        </Slam>
      </AbsoluteFill>
      <Flash at={0} dur={9} />
    </LimeStage>
  );
};
