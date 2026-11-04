import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { DarkStage, Fade, LightSweep, Lines, Plate, t, Vignette } from "../../components/Cine";
import { clamp } from "../../lib/motion";
import { H } from "../../lib/hwTheme";

// S0 — 오프닝: 어둠 속 스탠드 보드가 빛과 함께 드러난다. "공간이 바뀌면, 공부가 바뀝니다."
export const H0Opening: React.FC = () => {
  const frame = useCurrentFrame();
  const reveal = interpolate(frame, [0, 46], [0, 1], { ...clamp, easing: (x) => x * x });
  return (
    <DarkStage glow={false}>
      <Plate src="hw/hero-stand.jpg" w={1536} h={1024} zoom={[1.22, 1.08]} focus={[0.5, 0.42]} offset={[230, 0]} over={150} opacity={reveal} grade={`brightness(${0.55 + reveal * 0.45}) contrast(1.08)`} />
      <LightSweep delay={6} duration={54} width={420} opacity={0.35} />
      <Vignette strength={0.7} />

      <AbsoluteFill style={{ padding: "0 150px", justifyContent: "flex-end", paddingBottom: 150 }}>
        <Fade delay={30} y={10}>
          <div style={t(20, 700, H.mint, { letterSpacing: "0.3em" })}>CLASSIN BOARD</div>
        </Fade>
        <Lines lines={["공간이 바뀌면,", "공부가 바뀝니다."]} delay={42} size={104} weight={600} style={{ marginTop: 22 }} />
        <Fade delay={82} y={14} style={{ marginTop: 26 }}>
          <div style={t(30, 400, H.muted, { letterSpacing: "-0.01em" })}>수업을 위해 설계된 전자칠판</div>
        </Fade>
      </AbsoluteFill>
    </DarkStage>
  );
};
