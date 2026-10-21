import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { clamp } from "../../lib/motion";
import { HeroShot } from "../HeroShot";
import { LightSweep, Mono } from "../fx";
import { HERO_CLOCK, R, T } from "../theme";

/*
 * S4 히어로 칠판 (글로벌 720–912f · 3.2s)
 * 그리드에서 줌스루로 넘어온 칠판 샷을 그대로 이어받아, 칠판 위 예시 수업을 지우개로 걷어내고
 * 브랜드 메시지 "좋은 수업을, 강사의 개인기에서 / 학원의 시스템으로." 를 칠판에 쓴다. 카메라는 칠판 쪽으로 천천히 민다.
 */
export const S4Hero: React.FC = () => {
  const f = useCurrentFrame();
  const heroF = f + T.hero.from - HERO_CLOCK;
  const push = interpolate(f, [0, 192], [0, 1], { ...clamp, easing: Easing.inOut(Easing.sin) });
  const label = interpolate(f, [10, 26, 170, 186], [0, 1, 1, 0], clamp);
  return (
    <AbsoluteFill>
      <HeroShot f={heroF} push={push} />
      <LightSweep from={112} dur={46} width={14} opacity={0.18} />
      <div style={{ position: "absolute", left: 72, bottom: 56, opacity: label, display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ width: 10, height: 10, borderRadius: 999, background: R.lime }} />
        <Mono size={17}>Classin Board · 예시 화면</Mono>
      </div>
    </AbsoluteFill>
  );
};
