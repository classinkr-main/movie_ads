import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { clamp } from "../../lib/motion";
import { HeroShot } from "../HeroShot";
import { Dust, LightLeak, LightSweep, Mono } from "../fx";
import { HERO_CLOCK, R, T } from "../theme";

/*
 * S4 히어로 칠판 (글로벌 812–1068f · 4.3s)
 * 그리드에서 줌스루로 넘어온 칠판 샷을 그대로 이어받는다(칠판 f=96부터).
 *   0–100   예시 영어 수업이 이어서 완성된다 — 마커 · 주석 · 스타일러스가 그리는 타임라인 · 어휘 칩 · Tip 메모 · 학생 질문
 *   100–126 지우개가 지나간다
 *   118–256 브랜드 메시지 "좋은 수업을, 강사의 개인기에서 / 학원의 시스템으로." 가 칠판에 쓰이고 머문다
 * 카메라는 칠판 쪽으로 천천히 민다.
 */
export const S4Hero: React.FC = () => {
  const f = useCurrentFrame();
  const heroF = f + T.hero.from - HERO_CLOCK;
  const push = interpolate(f, [0, 256], [0, 1], { ...clamp, easing: Easing.inOut(Easing.sin) });
  const label = interpolate(f, [12, 30, 226, 246], [0, 1, 1, 0], clamp);
  return (
    <AbsoluteFill>
      <HeroShot f={heroF} push={push} />
      <Dust count={36} seed="hero" opacity={0.5} />
      <LightLeak at={0} len={60} side="top" peak={0.38} />
      <LightSweep from={140} dur={56} width={14} opacity={0.18} />
      <div style={{ position: "absolute", left: 72, bottom: 56, opacity: label, display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ width: 10, height: 10, borderRadius: 999, background: R.accent }} />
        <Mono size={17}>Classin Board · 예시 화면</Mono>
      </div>
    </AbsoluteFill>
  );
};
