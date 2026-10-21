import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Flash, Rings, SpeedLines } from "../components/Fx";
import { Slam } from "../components/Type";
import { C, FONT } from "../lib/theme";
import { clamp, ease, shake } from "../lib/motion";

// S3 드롭 (240–270f) — 침묵 뒤 첫 박. "미래의 학원은, / 남긴다."
export const Drop: React.FC = () => {
  const frame = useCurrentFrame();
  const sh = shake(frame, 0, 22, 18, "drop");
  const gridScale = interpolate(frame, [0, 30], [1.35, 1], { ...clamp, easing: ease.outExpo });
  return (
    <AbsoluteFill style={{ background: C.cobalt, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.13) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.13) 2px, transparent 2px)",
          backgroundSize: "120px 120px",
          backgroundPosition: "center",
          transform: `scale(${gridScale})`,
        }}
      />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 60% 60% at 50% 50%, rgba(47,60,255,0) 30%, ${C.cobaltDeep} 100%)` }} />
      <SpeedLines start={0} dur={26} />
      <Rings start={0} count={3} maxR={1100} width={14} />
      <AbsoluteFill style={{ transform: `translate(${sh.x}px, ${sh.y}px) rotate(${sh.r}deg)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 64, letterSpacing: "-0.02em", color: C.white, opacity: 0.72, marginBottom: 6 }}>미래의 학원은,</div>
        <Slam start={0} from={1.75} style={{ fontFamily: FONT.display, fontWeight: 900, fontSize: 400, lineHeight: 1, letterSpacing: "-0.055em", color: C.white }}>
          남긴다.
        </Slam>
      </AbsoluteFill>
      <Flash at={0} dur={9} />
    </AbsoluteFill>
  );
};
